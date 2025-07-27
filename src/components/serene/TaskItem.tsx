'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { extractLinks, removeLinks } from '@/lib/utils';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, description?: string) => void;
};

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const links = extractLinks(task.description || '');
  const descriptionText = removeLinks(task.description || '');

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdate(task.id, editedTitle.trim(), editedDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="w-full"
    >
      <Card
        className={cn(
          'bg-card/80 backdrop-blur-sm border-border/50 shadow-pop flex flex-col w-full h-64',
          task.completed && 'bg-card/60'
        )}
        style={{ borderTop: `4px solid ${task.completed ? 'transparent' : task.color || 'hsl(var(--primary))'}` }}
      >
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4">
          <div className="flex-grow space-y-2">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 flex-grow"
                autoFocus
              />
            ) : (
              <CardTitle
                className={`text-lg font-medium transition-colors ${
                  task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {task.title}
              </CardTitle>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                className="size-6 rounded-md border-primary/50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground mt-1"
                aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
              />
            </AlertDialogTrigger>
            {!task.completed && (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-accent" />
                    Complete Task?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark "{task.title}" as complete?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onToggle(task.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Complete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <div className="space-y-2">
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add details and links..."
              />
            ) : (
              <div className="text-muted-foreground text-base prose prose-sm prose-p:my-0 prose-a:text-primary max-w-none">
                {descriptionText ? (
                   <p>{descriptionText}</p>
                ) : (
                  <p className="italic">No details.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-2 pt-0 justify-between items-end mt-auto">
           <div className="flex flex-wrap gap-2">
            <TooltipProvider>
             {links.map((link, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <Badge variant="secondary" className="hover:bg-accent transition-colors">
                        <LinkIcon className="size-3 mr-1.5" />
                         {link.title.length > 20 ? `${link.title.substring(0, 20)}...` : link.title}
                      </Badge>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{link.href}</p>
                  </TooltipContent>
                </Tooltip>
             ))}
            </TooltipProvider>
           </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Trash2 className="size-4 text-destructive/80" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                     <AlertDialogHeader>
                       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                       <AlertDialogDescription>
                         This action cannot be undone. This will permanently delete the task "{task.title}".
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                       <AlertDialogAction
                         onClick={() => onDelete(task.id)}
                         className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                       >
                         Delete
                       </AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon" className="size-8" onClick={handleSave}>
                  <Save className="size-4 text-accent" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={handleCancel}>
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                {!task.completed && (
                  <Button variant="ghost" size="icon" className="size-8 opacity-60 hover:opacity-100" onClick={() => setIsEditing(true)}>
                    <Edit className="size-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
