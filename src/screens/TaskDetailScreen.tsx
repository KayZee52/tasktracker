import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Task, ChecklistItem, Priority, TaskTemplate } from '../types/Task';
import { useTheme } from '../contexts/ThemeContext';
import { storage } from '../utils/storage';

interface TaskDetailScreenProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: () => void;
  onBack: () => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  task,
  onUpdate,
  onDelete,
  onBack,
}) => {
  const { colors } = useTheme();
  const [description, setDescription] = useState(task.description);
  const [checklist, setChecklist] = useState<Task['checklist']>(task.checklist);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    setDescription(task.description);
    setChecklist(task.checklist);
  }, [task]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    // Update task description immediately
    onUpdate({ ...task, description: text });
  };

  const handleTextSelection = (event: any) => {
    const { selection } = event.nativeEvent;
    if (selection.start !== selection.end) {
      setSelection({ start: selection.start, end: selection.end });
    } else {
      setSelection(null);
    }
  };

  const convertSelectionToChecklist = () => {
    if (!selection) {
      Alert.alert('No Selection', 'Please highlight text in the description to convert to checklist items.');
      return;
    }

    const selectedText = description.substring(selection.start, selection.end);
    const lines = selectedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      Alert.alert('Invalid Selection', 'Please select text with at least one line.');
      return;
    }

    const newChecklistItems: ChecklistItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      completed: false,
    }));

    // Remove selected text from description
    const beforeSelection = description.substring(0, selection.start);
    const afterSelection = description.substring(selection.end);
    const newDescription = (beforeSelection + afterSelection).trim();

    // Add new checklist items
    const updatedChecklist = [...checklist, ...newChecklistItems];

    setDescription(newDescription);
    setChecklist(updatedChecklist);
    setSelection(null);

    // Update task
    onUpdate({
      ...task,
      description: newDescription,
      checklist: updatedChecklist,
    });

    Alert.alert('Success', `Created ${lines.length} checklist item(s) from selected text.`);
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    onUpdate({ ...task, checklist: updatedChecklist });
  };

  const deleteChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    setChecklist(updatedChecklist);
    onUpdate({ ...task, checklist: updatedChecklist });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const [templateName, setTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSaveAsTemplate = () => {
    setShowTemplateModal(true);
  };

  const confirmSaveTemplate = async () => {
    if (templateName.trim()) {
      const template: TaskTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateName.trim(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        checklist: task.checklist,
        tags: task.tags,
        createdAt: new Date(),
      };
      await storage.addTemplate(template);
      setShowTemplateModal(false);
      setTemplateName('');
      Alert.alert('Success', 'Template saved! You can use it from the Templates menu.');
    }
  };

  const priorityColors: Record<Priority, string> = {
    high: colors.priority.high,
    medium: colors.priority.medium,
    low: colors.priority.low,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDynamicStyles = () => ({
    container: { backgroundColor: colors.background },
    header: { borderBottomColor: colors.border },
    backButtonText: { color: colors.primary },
    deleteButtonText: { color: colors.priority.high },
    title: { color: colors.text },
    dueDateBadge: { backgroundColor: colors.surfaceLight },
    dueDateText: { color: colors.textSecondary },
    sectionTitle: { color: colors.text },
    convertButton: { backgroundColor: colors.primary },
    convertButtonText: { color: colors.text },
    descriptionInput: { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
    hint: { color: colors.textTertiary },
    checklistItem: { backgroundColor: colors.surface },
    checklistCheckbox: { borderColor: colors.checkbox.unchecked },
    checklistCheckboxChecked: { backgroundColor: colors.checkbox.checked, borderColor: colors.checkbox.checked },
    checkmark: { color: colors.text },
    checklistText: { color: colors.text },
    checklistTextCompleted: { color: colors.textSecondary },
    deleteItemText: { color: colors.textTertiary },
    addChecklistInput: { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
    addChecklistButton: { backgroundColor: colors.primary },
    addChecklistButtonText: { color: colors.text },
  });

  const dynamicStyles = getDynamicStyles();

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, dynamicStyles.backButtonText]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleSaveAsTemplate}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: colors.primary }]}>📋 Save Template</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={[styles.deleteButtonText, dynamicStyles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, dynamicStyles.title]}>{task.title}</Text>
          <View style={styles.meta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[task.priority] + '20' },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColors[task.priority] },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: priorityColors[task.priority] },
                ]}
              >
                {task.priority.toUpperCase()}
              </Text>
            </View>
            {task.dueDate && (
              <View style={[styles.dueDateBadge, dynamicStyles.dueDateBadge]}>
                <Text style={[styles.dueDateText, dynamicStyles.dueDateText]}>📅 {formatDate(task.dueDate)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Description</Text>
            {description.trim().length > 0 && (
              <TouchableOpacity
                style={[styles.convertButton, dynamicStyles.convertButton]}
                onPress={() => {
                  // Convert all lines in description to checklist
                  const lines = description
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                  
                  if (lines.length === 0) {
                    Alert.alert('No Content', 'Please add some text to convert to checklist items.');
                    return;
                  }
                  
                  const newChecklistItems: ChecklistItem[] = lines.map((line, index) => ({
                    id: `${Date.now()}-${index}`,
                    text: line,
                    completed: false,
                  }));
                  
                  const updatedChecklist = [...checklist, ...newChecklistItems];
                  setDescription('');
                  setChecklist(updatedChecklist);
                  
                  onUpdate({
                    ...task,
                    description: '',
                    checklist: updatedChecklist,
                  });
                  
                  Alert.alert('Success', `Created ${lines.length} checklist item(s) from description.`);
                }}
              >
                <Text style={[styles.convertButtonText, dynamicStyles.convertButtonText]}>
                  ✓ Convert All to Checklist
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.descriptionInput, dynamicStyles.descriptionInput]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Add description... (each line will become a checklist item when you tap 'Convert All to Checklist')"
            placeholderTextColor={colors.textTertiary}
            multiline
            onSelectionChange={handleTextSelection}
            selectionColor={colors.primary}
          />
          {description.trim().length > 0 && (
            <Text style={[styles.hint, dynamicStyles.hint]}>
              💡 Tip: Type each task on a new line, then tap "Convert All to Checklist"
            </Text>
          )}
          {selection && selection.start !== selection.end && (
            <TouchableOpacity
              style={[styles.convertButton, styles.convertSelectedButton, dynamicStyles.convertButton]}
              onPress={convertSelectionToChecklist}
            >
              <Text style={[styles.convertButtonText, dynamicStyles.convertButtonText]}>
                ✓ Convert Selected to Checklist
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Checklist ({checklist.filter(item => item.completed).length}/{checklist.length})
          </Text>
          
          {/* Add new checklist item input */}
          <View style={styles.addChecklistContainer}>
            <TextInput
              style={[styles.addChecklistInput, dynamicStyles.addChecklistInput]}
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              placeholder="Add checklist item..."
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={() => {
                if (newChecklistItem.trim()) {
                  const newItem: ChecklistItem = {
                    id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: newChecklistItem.trim(),
                    completed: false,
                  };
                  const updatedChecklist = [...checklist, newItem];
                  setChecklist(updatedChecklist);
                  setNewChecklistItem('');
                  onUpdate({ ...task, checklist: updatedChecklist });
                }
              }}
            />
            <TouchableOpacity
              style={[
                styles.addChecklistButton, 
                dynamicStyles.addChecklistButton,
                !newChecklistItem.trim() && styles.addChecklistButtonDisabled
              ]}
              onPress={() => {
                if (newChecklistItem.trim()) {
                  const newItem: ChecklistItem = {
                    id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: newChecklistItem.trim(),
                    completed: false,
                  };
                  const updatedChecklist = [...checklist, newItem];
                  setChecklist(updatedChecklist);
                  setNewChecklistItem('');
                  onUpdate({ ...task, checklist: updatedChecklist });
                }
              }}
              disabled={!newChecklistItem.trim()}
            >
              <Text style={[styles.addChecklistButtonText, dynamicStyles.addChecklistButtonText]}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Existing checklist items - sorted: incomplete first, completed at bottom */}
          {[...checklist].sort((a, b) => {
            // Completed items go to the bottom
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            // Keep original order for items with same completion status
            return 0;
          }).map((item) => {
            const indentLevel = item.indentLevel || 0;
            return (
              <View 
                key={item.id} 
                style={[
                  styles.checklistItem, 
                  dynamicStyles.checklistItem,
                  { paddingLeft: 12 + (indentLevel * 20) }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.checklistCheckbox,
                    dynamicStyles.checklistCheckbox,
                    item.completed && [styles.checklistCheckboxChecked, dynamicStyles.checklistCheckboxChecked],
                  ]}
                  onPress={() => toggleChecklistItem(item.id)}
                >
                  {item.completed && <Text style={[styles.checkmark, dynamicStyles.checkmark]}>✓</Text>}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.checklistText,
                    dynamicStyles.checklistText,
                    item.completed && [styles.checklistTextCompleted, dynamicStyles.checklistTextCompleted],
                  ]}
                  onPress={() => toggleChecklistItem(item.id)}
                >
                  {item.text}
                </Text>
                <View style={styles.checklistItemActions}>
                  {indentLevel > 0 && (
                    <TouchableOpacity
                      style={styles.indentButton}
                      onPress={() => {
                        const updatedChecklist = checklist.map(i =>
                          i.id === item.id ? { ...i, indentLevel: Math.max(0, (i.indentLevel || 0) - 1) } : i
                        );
                        setChecklist(updatedChecklist);
                        onUpdate({ ...task, checklist: updatedChecklist });
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text style={[styles.indentButtonText, { color: colors.textTertiary }]}>◀</Text>
                    </TouchableOpacity>
                  )}
                  {indentLevel < 3 && (
                    <TouchableOpacity
                      style={styles.indentButton}
                      onPress={() => {
                        const updatedChecklist = checklist.map(i =>
                          i.id === item.id ? { ...i, indentLevel: Math.min(3, (i.indentLevel || 0) + 1) } : i
                        );
                        setChecklist(updatedChecklist);
                        onUpdate({ ...task, checklist: updatedChecklist });
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text style={[styles.indentButtonText, { color: colors.textTertiary }]}>▶</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteItemButton}
                    onPress={() => deleteChecklistItem(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.deleteItemText, dynamicStyles.deleteItemText]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Template Save Modal */}
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[styles.templateModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.templateModalTitle, { color: colors.text }]}>Save as Template</Text>
            <TextInput
              style={[styles.templateInput, { backgroundColor: colors.surfaceLight, color: colors.text, borderColor: colors.border }]}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Template name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.templateModalButtons}>
              <TouchableOpacity
                style={[styles.templateButton, { backgroundColor: colors.surfaceLight }]}
                onPress={() => {
                  setShowTemplateModal(false);
                  setTemplateName('');
                }}
              >
                <Text style={[styles.templateButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.templateButton, { backgroundColor: colors.primary }]}
                onPress={confirmSaveTemplate}
              >
                <Text style={[styles.templateButtonText, { color: colors.text }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dueDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  convertButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  convertSelectedButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  convertButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checklistCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCheckboxChecked: {},
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
  },
  deleteItemButton: {
    padding: 4,
  },
  deleteItemText: {
    fontSize: 18,
  },
  addChecklistContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  addChecklistInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  addChecklistButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChecklistButtonDisabled: {
    opacity: 0.5,
  },
  addChecklistButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  checklistItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indentButton: {
    padding: 4,
  },
  indentButtonText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateModal: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  templateModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  templateInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  templateModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  templateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  templateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

