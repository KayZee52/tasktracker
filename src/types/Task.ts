export type Priority = 'low' | 'medium' | 'high';
export type Theme = 'dark' | 'light';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  indentLevel?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  checklist: ChecklistItem[];
  tags: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: Priority;
  checklist: ChecklistItem[];
  tags: string[];
  createdAt: Date;
}

