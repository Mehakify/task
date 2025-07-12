'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { type Task, type TaskStatus } from '@/types';
import { format, isBefore, startOfToday } from 'date-fns';
import { Calendar, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateCompletion: (id: string, completed: boolean) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
}

const getStatus = (task: Task): TaskStatus => {
  if (task.completed) {
    return 'Complete';
  }
  if (isBefore(new Date(task.dueDate), startOfToday()) && !task.completed) {
    return 'Not Complete';
  }
  return 'Pending';
};

export function TaskCard({ task, onEdit, onDelete, onUpdateCompletion, onUpdateSubtask }: TaskCardProps) {
  const status = getStatus(task);

  const statusColors: Record<TaskStatus, string> = {
    Pending: 'border-transparent bg-primary/20 text-primary',
    Complete: 'border-transparent bg-accent text-accent-foreground',
    'Not Complete': 'border-transparent bg-destructive/20 text-destructive',
  };

  return (
    <AlertDialog>
        <Card
        className={cn(
            'flex flex-col transition-all duration-300 ease-in-out',
            task.completed ? 'bg-card/60 opacity-70' : 'bg-card'
        )}
        >
        <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
            <div className="flex-1 space-y-1">
            <CardTitle
                className={cn(
                'text-lg font-bold leading-tight transition-all',
                task.completed && 'line-through text-muted-foreground'
                )}
            >
                {task.title}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground pt-1">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span>Due by {format(new Date(task.dueDate), 'PPP')}</span>
            </div>
            </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 pt-0">
            {task.notes && (
            <p className="text-sm text-muted-foreground">{task.notes}</p>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
                <>
                <Separator />
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Subtasks</h4>
                    <div className="space-y-2">
                        {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`subtask-${subtask.id}`}
                                    checked={subtask.completed}
                                    onCheckedChange={(checked) =>
                                    onUpdateSubtask(task.id, subtask.id, !!checked)
                                    }
                                    disabled={task.completed}
                                />
                                <label
                                    htmlFor={`subtask-${subtask.id}`}
                                    className={cn(
                                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                                    subtask.completed && 'line-through text-muted-foreground'
                                    )}
                                >
                                    {subtask.text}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
            <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={(checked) => onUpdateCompletion(task.id, !!checked)}
            />
            <label htmlFor={`task-${task.id}`} className="text-sm font-medium">
                Mark as complete
            </label>
            </div>
            <Badge variant="secondary" className={cn('text-xs font-semibold', statusColors[status])}>
            {status}
            </Badge>
        </CardFooter>
        </Card>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    task and all of its data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

  );
}
