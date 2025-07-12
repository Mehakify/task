'use client';

import { Task } from '@/types';
import { TaskCard } from './task-card';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateCompletion: (id: string, completed: boolean) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onUpdateCompletion, onUpdateSubtask }: TaskListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tasks.map((task) => (
        <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onUpdateCompletion={onUpdateCompletion}
            onUpdateSubtask={onUpdateSubtask}
        />
      ))}
    </div>
  );
}
