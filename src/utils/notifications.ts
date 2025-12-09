import * as Notifications from 'expo-notifications';
import { Task } from '../types/Task';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notifications = {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  async scheduleTaskReminder(task: Task): Promise<string | null> {
    if (!task.dueDate) return null;
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    // Cancel existing notification for this task
    if (task.id) {
      await Notifications.cancelScheduledNotificationAsync(task.id);
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Only schedule if due date is in the future
    if (dueDate <= now) return null;

    // Schedule notification 1 hour before due date
    const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    // If reminder time is in the past, schedule for due date instead
    const scheduleTime = reminderTime > now ? reminderTime : dueDate;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Task Due Soon: ${task.title}`,
        body: task.description || 'Don\'t forget to complete this task!',
        data: { taskId: task.id },
        sound: true,
      },
      trigger: scheduleTime,
      identifier: task.id,
    });

    return notificationId;
  },

  async cancelTaskReminder(taskId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  },

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};

