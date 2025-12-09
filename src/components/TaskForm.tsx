import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Task, Priority } from '../types/Task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskFormProps {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  task,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDateOptions, setShowDateOptions] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setTags([]);
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      completed: task?.completed || false,
      checklist: task?.checklist || [],
      tags: tags,
      archived: task?.archived || false,
    });
    
    onClose();
  };

  const getDateOptions = (): Array<{ label: string; date: Date | null; isCustom?: boolean }> => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Next Week', date: nextWeek },
      { label: 'Custom...', date: null, isCustom: true },
    ];
  };

  const handleDateSelect = (date: Date | null, isCustom?: boolean) => {
    if (isCustom) {
      // For custom date, we'll use a simple prompt
      // In a real app, you'd use a proper date picker
      setShowDateOptions(false);
      // For now, set to next week as placeholder
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek);
    } else if (date) {
      setDueDate(date);
      setShowDateOptions(false);
    }
  };

  const priorities: Priority[] = ['low', 'medium', 'high'];
  const priorityColors: Record<Priority, string> = {
    high: colors.priority.high,
    medium: colors.priority.medium,
    low: colors.priority.low,
  };
  const priorityLabels: Record<Priority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {task ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.text, borderColor: colors.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceLight, color: colors.text, borderColor: colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add description... (highlight text to create checklist)"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      { borderColor: colors.border, backgroundColor: colors.surfaceLight },
                      priority === p && {
                        backgroundColor: priorityColors[p] + '30',
                        borderColor: priorityColors[p],
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[p] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityButtonText,
                        { color: priority === p ? priorityColors[p] : colors.textSecondary },
                      ]}
                    >
                      {priorityLabels[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                onPress={() => setShowDateOptions(!showDateOptions)}
              >
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {dueDate
                    ? dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No due date'}
                </Text>
                {dueDate && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setDueDate(null);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.clearDate, { color: colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              
              {showDateOptions && (
                <View style={[styles.dateOptions, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  {getDateOptions().map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateOption, { borderBottomColor: colors.border }]}
                      onPress={() => handleDateSelect(option.date, option.isCustom)}
                    >
                      <Text style={[styles.dateOptionText, { color: colors.text }]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.tagInput, { backgroundColor: colors.surfaceLight, color: colors.text, borderColor: colors.border }]}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tag and press Enter"
                  placeholderTextColor={colors.textTertiary}
                  onSubmitEditing={() => {
                    const tag = tagInput.trim().toLowerCase();
                    if (tag && !tags.includes(tag)) {
                      setTags([...tags, tag]);
                      setTagInput('');
                    }
                  }}
                />
              </View>
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                      <TouchableOpacity
                        onPress={() => setTags(tags.filter((_, i) => i !== index))}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Text style={[styles.tagRemove, { color: colors.primary }]}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.surfaceLight }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, !title.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 16,
  },
  clearDate: {
    fontSize: 18,
    paddingLeft: 8,
  },
  dateOptions: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  dateOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  dateOptionText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
  },
  tagInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  tagRemove: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

