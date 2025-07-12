'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import { type Task } from '@/types';
import { useAuth } from '@/context/auth-provider';
import { PlusCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoadingTasks(false);
      return;
    };

    setLoadingTasks(true);
    const tasksCollectionRef = collection(db, 'tasks');
    const q = query(tasksCollectionRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userTasks.push({ 
            id: doc.id,
            // Convert Firestore Timestamps to ISO strings
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : new Date().toISOString(),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            ...data
         } as Task);
      });
      setTasks(userTasks);
      setLoadingTasks(false);
    }, (error) => {
        console.error("Error fetching tasks:", error);
        setLoadingTasks(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const handleOpenCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'userId'>, id?: string) => {
    if (!user || !db) return;
    
    // Firestore converts Date objects to Timestamps, so we send the date object directly
    const dataToSave = {
        ...taskData,
        dueDate: new Date(taskData.dueDate),
    };

    if (id) {
      // Update existing task
      const taskDocRef = doc(db, 'tasks', id);
      await updateDoc(taskDocRef, dataToSave);
    } else {
      // Create new task
      const tasksCollectionRef = collection(db, 'tasks');
      await addDoc(tasksCollectionRef, {
        ...dataToSave,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!db) return;
    const taskDocRef = doc(db, 'tasks', id);
    await deleteDoc(taskDocRef);
  };
  
  const handleUpdateTaskCompletion = async (id: string, completed: boolean) => {
     if (!db) return;
     const taskDocRef = doc(db, 'tasks', id);
     await updateDoc(taskDocRef, { completed });
  };
  
  const handleUpdateSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    if (!db) return;
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    const updatedSubtasks = taskToUpdate.subtasks.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, completed } : subtask
    );

    const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
    
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, {
        subtasks: updatedSubtasks,
        completed: updatedSubtasks.length > 0 ? allSubtasksCompleted : taskToUpdate.completed,
    });
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
      
      {loadingTasks ? (
         <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
         </div>
      ) : (
        <>
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
        </>
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
