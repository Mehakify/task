'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import { type Task } from '@/types';
import { useAuth } from '@/context/auth-provider';
import { PlusCircle } from 'lucide-react';

// Mock data - in a real app, this would come from a database.
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Set up development environment',
    notes: 'Install Node.js, Next.js, and Tailwind CSS.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    completed: true,
    subtasks: [
      { id: 's1-1', text: 'Install Node.js', completed: true },
      { id: 's1-2', text: 'Create Next.js app', completed: true },
    ],
    userId: 'mock-user',
  },
  {
    id: '2',
    title: 'Create UI components',
    notes: 'Build reusable components using shadcn/ui.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    completed: false,
    subtasks: [
      { id: 's2-1', text: 'Button component', completed: true },
      { id: 's2-2', text: 'Card component', completed: false },
      { id: 's2-3', text: 'Dialog component', completed: false },
    ],
    userId: 'mock-user',
  },
  {
    id: '3',
    title: 'Implement authentication',
    notes: 'Add Google and anonymous sign-in.',
    dueDate: new Date(new Date().setDate(new Date().getDate() -1)).toISOString(),
    completed: false,
    subtasks: [],
    userId: 'mock-user',
  },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  
  // In a real app, you would fetch tasks for the current user.
  // Here we'll just filter the mock data.
  // We also use a localStorage-based persistence layer for a better demo experience.
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
        const storedTasks = localStorage.getItem(`tasks_${user.uid}`);
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            // For demo, we assign mock data if no stored data exists.
            const userTasks = initialTasks.map(t => ({...t, userId: user.uid}));
            setTasks(userTasks);
        }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);


  const handleOpenCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId'>, id?: string) => {
    if (!user) return;
    if (id) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === id ? { ...t, ...taskData, id } : t)));
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        userId: user.uid,
      };
      setTasks([newTask, ...tasks]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };
  
  const handleUpdateTaskCompletion = (id: string, completed: boolean) => {
     setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)));
  };
  
  const handleUpdateSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks(tasks.map(task => {
        if (task.id === taskId) {
            const updatedSubtasks = task.subtasks.map(subtask => 
                subtask.id === subtaskId ? { ...subtask, completed } : subtask
            );
            const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
            
            return {
                ...task,
                subtasks: updatedSubtasks,
                completed: updatedSubtasks.length > 0 ? allSubtasksCompleted : task.completed,
            };
        }
        return task;
    }));
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Your Tasks</h2>
        <Button onClick={handleOpenCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskList 
        tasks={sortedTasks} 
        onEdit={handleOpenEditForm} 
        onDelete={handleDeleteTask}
        onUpdateCompletion={handleUpdateTaskCompletion}
        onUpdateSubtask={handleUpdateSubtask}
      />

      {tasks.length === 0 && (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium text-muted-foreground">No tasks yet.</h3>
            <p className="text-sm text-muted-foreground">Click "Create Task" to get started.</p>
         </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
