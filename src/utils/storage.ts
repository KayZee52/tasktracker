import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskTemplate, Theme } from '../types/Task';

const TASKS_KEY = '@task_tracker:tasks';
const TEMPLATES_KEY = '@task_tracker:templates';
const THEME_KEY = '@task_tracker:theme';

export const storage = {
  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      if (data) {
        const tasks = JSON.parse(data);
        // Convert date strings back to Date objects and migrate old tasks
        return tasks.map((task: any) => ({
          ...task,
          tags: task.tags || [],
          archived: task.archived || false,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  async updateTask(updatedTask: Task): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      await this.saveTasks(tasks);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(filtered);
  },

  async archiveTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.archived = true;
      task.updatedAt = new Date();
      await this.saveTasks(tasks);
    }
  },

  async unarchiveTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.archived = false;
      task.updatedAt = new Date();
      await this.saveTasks(tasks);
    }
  },

  // Templates
  async getTemplates(): Promise<TaskTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(TEMPLATES_KEY);
      if (data) {
        const templates = JSON.parse(data);
        return templates.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  },

  async saveTemplates(templates: TaskTemplate[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  },

  async addTemplate(template: TaskTemplate): Promise<void> {
    const templates = await this.getTemplates();
    templates.push(template);
    await this.saveTemplates(templates);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const templates = await this.getTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    await this.saveTemplates(filtered);
  },

  // Theme
  async getTheme(): Promise<Theme> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as Theme) || 'dark';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'dark';
    }
  },

  async saveTheme(theme: Theme): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Export
  async exportData(): Promise<string> {
    const tasks = await this.getTasks();
    const templates = await this.getTemplates();
    return JSON.stringify({ tasks, templates }, null, 2);
  },
};

