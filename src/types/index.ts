export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // Storing as ISO string
  completed: boolean;
  subtasks: Subtask[];
  userId: string;
}

export type TaskStatus = 'Pending' | 'Complete' | 'Not Complete';
