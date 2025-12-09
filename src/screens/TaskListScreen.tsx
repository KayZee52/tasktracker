import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Task, Priority, TaskTemplate } from '../types/Task';
import { storage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { notifications } from '../utils/notifications';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';

export const TaskListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  const loadTasks = useCallback(async () => {
    const loadedTasks = await storage.getTasks();
    // Filter out archived unless showing archived
    const visibleTasks = showArchived 
      ? loadedTasks.filter(t => t.archived)
      : loadedTasks.filter(t => !t.archived);
    
    // Sort: incomplete first (by priority and due date), completed tasks at bottom (by completion time)
    visibleTasks.sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // For incomplete tasks: sort by priority, then due date
      if (!a.completed) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // If same priority and no due dates, sort by most recently updated
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      
      // For completed tasks: sort by completion time (most recently completed at bottom)
      return a.updatedAt.getTime() - b.updatedAt.getTime();
    });
    setTasks(visibleTasks);
    applyFilters(visibleTasks);
  }, [showArchived]);

  const applyFilters = useCallback((taskList: Task[]) => {
    let filtered = [...taskList];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Tag filter
    if (filterTag.trim()) {
      filtered = filtered.filter(task =>
        task.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [searchQuery, filterPriority, filterTag]);

  useEffect(() => {
    applyFilters(tasks);
  }, [tasks, searchQuery, filterPriority, filterTag, applyFilters]);

  useEffect(() => {
    loadTasks();
    loadTemplates();
  }, [showArchived]);

  const loadTemplates = useCallback(async () => {
    const loadedTemplates = await storage.getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        ...taskData,
        updatedAt: new Date(),
      };
      await storage.updateTask(updatedTask);
      // Schedule notification if due date exists
      if (updatedTask.dueDate && !updatedTask.completed) {
        await notifications.scheduleTaskReminder(updatedTask);
      }
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await storage.addTask(newTask);
      // Schedule notification if due date exists
      if (newTask.dueDate && !newTask.completed) {
        await notifications.scheduleTaskReminder(newTask);
      }
    }
    await loadTasks();
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCreateFromTemplate = async (template: TaskTemplate) => {
    const newTask: Task = {
      title: template.title,
      description: template.description,
      priority: template.priority,
      dueDate: null,
      completed: false,
      checklist: template.checklist,
      tags: template.tags,
      archived: false,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await storage.addTask(newTask);
    await loadTasks();
    setShowTemplates(false);
  };

  const handleToggleComplete = async (task: Task) => {
    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date(),
    };
    await storage.updateTask(updatedTask);
    // Cancel notification if completed, schedule if uncompleted and has due date
    if (updatedTask.completed) {
      await notifications.cancelTaskReminder(task.id);
    } else if (updatedTask.dueDate) {
      await notifications.scheduleTaskReminder(updatedTask);
    }
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await storage.deleteTask(taskId);
    await loadTasks();
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { task });
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const getAllTags = () => {
    const allTags = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => allTags.add(tag)));
    return Array.from(allTags).sort();
  };

  const getStats = () => {
    const allTasks = tasks;
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const highPriority = allTasks.filter(t => t.priority === 'high' && !t.completed).length;
    const overdue = allTasks.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    const withChecklist = allTasks.filter(t => t.checklist.length > 0).length;
    const completedChecklistItems = allTasks.reduce((sum, t) => 
      sum + t.checklist.filter(item => item.completed).length, 0
    );
    const totalChecklistItems = allTasks.reduce((sum, t) => sum + t.checklist.length, 0);
    
    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      highPriority,
      overdue,
      withChecklist,
      completedChecklistItems,
      totalChecklistItems,
      checklistCompletionRate: totalChecklistItems > 0 
        ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
        : 0,
    };
  };

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      await Share.share({
        message: data,
        title: 'Task Tracker Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    await storage.archiveTask(taskId);
    await loadTasks();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Tasks</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {incompleteTasks.length} active, {completedTasks.length} completed
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
            <Text style={[styles.menuButtonText, { color: colors.text }]}>☰</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.surface, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterPriority === 'all' && { backgroundColor: colors.primary },
                { borderColor: colors.border }
              ]}
              onPress={() => setFilterPriority('all')}
            >
              <Text style={[
                styles.filterChipText,
                filterPriority === 'all' && { color: colors.text }
              ]}>All</Text>
            </TouchableOpacity>
            {(['high', 'medium', 'low'] as Priority[]).map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterChip,
                  filterPriority === priority && { 
                    backgroundColor: colors.priority[priority] + '30' 
                  },
                  { borderColor: colors.border }
                ]}
                onPress={() => setFilterPriority(priority)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: colors.priority[priority] }
                ]}>{priority.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onToggleComplete={() => handleToggleComplete(item)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              {searchQuery || filterPriority !== 'all' || filterTag
                ? 'Try adjusting your filters'
                : 'Tap the + button to create your first task'}
            </Text>
          </View>
        }
      />

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuModal, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowStats(true);
                setShowMenu(false);
              }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>📊 Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowArchived(!showArchived);
                setShowMenu(false);
                loadTasks();
              }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {showArchived ? '📋 Show Active' : '📦 Show Archived'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                toggleTheme();
                setShowMenu(false);
              }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>🌓 Toggle Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowTemplates(true);
                setShowMenu(false);
              }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>📋 Templates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                handleExport();
                setShowMenu(false);
              }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>📤 Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuItemText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.statsModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.statsHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>Task Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsContent}>
              {templates.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No templates yet</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                    Save a task as a template from the task detail screen
                  </Text>
                </View>
              ) : (
                templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.templateCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                    onPress={() => handleCreateFromTemplate(template)}
                  >
                    <Text style={[styles.templateTitle, { color: colors.text }]}>{template.name}</Text>
                    <Text style={[styles.templateDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {template.title}
                    </Text>
                    {template.checklist.length > 0 && (
                      <Text style={[styles.templateMeta, { color: colors.textTertiary }]}>
                        {template.checklist.length} checklist items
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Statistics Modal */}
      <Modal
        visible={showStats}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStats(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.statsModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.statsHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>Statistics</Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsContent}>
              {(() => {
                const stats = getStats();
                return (
                  <>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Tasks</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.statValue, { color: colors.primary }]}>{stats.completionRate}%</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completion Rate</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.statValue, { color: colors.priority.high }]}>{stats.highPriority}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High Priority</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.statValue, { color: colors.priority.medium }]}>{stats.overdue}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Overdue</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{stats.checklistCompletionRate}%</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Checklist Completion</Text>
                    </View>
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
        activeOpacity={0.8}
      >
        <Text style={[styles.fabText, { color: colors.text }]}>+</Text>
      </TouchableOpacity>

      <TaskForm
        visible={showTaskForm}
        task={editingTask}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
  },
  searchInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  menuItem: {
    padding: 20,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  statsModal: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
  statsContent: {
    padding: 20,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  templateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  templateMeta: {
    fontSize: 12,
  },
});

