import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task, Priority } from '../types/Task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

const getPriorityColors = (colors: any): Record<Priority, string> => ({
  high: colors.priority.high,
  medium: colors.priority.medium,
  low: colors.priority.low,
});

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleComplete,
}) => {
  const { colors } = useTheme();
  const priorityColors = getPriorityColors(colors);
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const completedChecklistCount = task.checklist.filter(item => item.completed).length;
  const totalChecklistCount = task.checklist.length;
  const hasChecklist = totalChecklistCount > 0;

  const dynamicStyles = {
    card: { backgroundColor: colors.surface, borderLeftColor: colors.border },
    cardCompleted: { borderLeftColor: colors.completed },
    checkbox: { borderColor: colors.checkbox.unchecked },
    checkboxChecked: { backgroundColor: colors.checkbox.checked, borderColor: colors.checkbox.checked },
    checkmark: { color: colors.text },
    title: { color: colors.text },
    titleCompleted: { color: colors.textSecondary },
    description: { color: colors.textSecondary },
    dueDate: { color: colors.textSecondary },
    checklistProgress: { color: colors.textTertiary },
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        dynamicStyles.card,
        task.completed && [styles.cardCompleted, dynamicStyles.cardCompleted],
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          dynamicStyles.checkbox,
          task.completed && [styles.checkboxChecked, dynamicStyles.checkboxChecked],
        ]}
        onPress={onToggleComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed && <Text style={[styles.checkmark, dynamicStyles.checkmark]}>✓</Text>}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            dynamicStyles.title,
            task.completed && [styles.titleCompleted, dynamicStyles.titleCompleted],
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        
        {task.description ? (
          <Text style={[styles.description, dynamicStyles.description]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            {task.priority && (
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
                  {priorityLabels[task.priority]}
                </Text>
              </View>
            )}
            
            {task.dueDate && (
              <Text style={[styles.dueDate, dynamicStyles.dueDate]}>
                📅 {formatDate(task.dueDate)}
              </Text>
            )}
          </View>
          
          {hasChecklist && (
            <Text style={[styles.checklistProgress, dynamicStyles.checklistProgress]}>
              ✓ {completedChecklistCount}/{totalChecklistCount}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {},
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 12,
  },
  checklistProgress: {
    fontSize: 12,
  },
});

