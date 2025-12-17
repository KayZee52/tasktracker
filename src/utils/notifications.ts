import Constants, { AppOwnership } from 'expo-constants';
import { Task } from '../types/Task';

const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

// Initialize handler only if not in Expo Go
if (!isExpoGo) {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('Failed to initialize notifications handler:', e);
  }
}

export const notifications = {
  async requestPermissions(): Promise<boolean> {
    if (isExpoGo) {
      console.warn('Notifications are not supported in Expo Go');
      return false;
    }

    try {
      const Notifications = require('expo-notifications');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.warn('Error requesting permissions:', error);
      return false;
    }
  },

  async scheduleTaskReminder(task: Task): Promise<string | null> {
    if (isExpoGo) {
      console.warn('Notifications are not supported in Expo Go');
      return null;
    }

    if (!task.dueDate) return null;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      const Notifications = require('expo-notifications');

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
        trigger: scheduleTime as any,
        identifier: task.id,
      });

      return notificationId;
    } catch (error) {
      console.warn('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelTaskReminder(taskId: string): Promise<void> {
    if (isExpoGo) return;
    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync(taskId);
    } catch (error) {
      console.warn('Error cancelling notification:', error);
    }
  },

  async cancelAllReminders(): Promise<void> {
    if (isExpoGo) return;
    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Error cancelling all notifications:', error);
    }
  },
};
