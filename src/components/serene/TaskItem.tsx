
'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X, AlertTriangle, Link as LinkIcon, CheckCircle } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id:string) => void;
  onUpdate: (id: string, title: string, description?: string) => void;
};

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const isMobile = useIsMobile();

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

  if (isMobile) {
    // Mobile-specific bar layout
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
        className="w-full origin-top"
      >
        <div className={cn(
            'group flex items-stretch bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-sm w-full transition-shadow hover:shadow-md rounded-lg',
            task.completed && 'bg-card/60'
          )}
        >
          <div 
            className="flex-shrink-0 w-2" 
            style={{ backgroundColor: task.completed ? 'transparent' : task.color || 'hsl(var(--primary))' }}
          />

          {isEditing ? (
            <div className="flex-grow p-4">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-base mb-2"
                autoFocus
              />
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add details and links..."
                className="text-sm"
              />
            </div>
          ) : (
            <div className="flex-grow p-3">
              <h3 className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              {descriptionText && (
                <p className="text-sm text-muted-foreground mt-1">{descriptionText}</p>
              )}
              {links.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-2">
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
                          <TooltipContent><p>{link.href}</p></TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
              )}
            </div>
          )}

          <div className="flex-shrink-0 pr-2 py-2 flex items-center gap-1">
            {isEditing ? (
              <>
                <Button variant="ghost" size="icon" className="size-7" onClick={handleSave}><Save className="size-4 text-green-500" /></Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={handleCancel}><X className="size-4" /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-4 text-destructive/80" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{task.title}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsEditing(true)}><Edit className="size-4" /></Button>
                 <AlertDialog>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className={cn('size-7 rounded-full transition-colors', task.completed ? 'bg-primary/20 text-primary' : '')}>
                                          <CheckCircle className="size-5" />
                                      </Button>
                                  </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent><p>Mark as {task.completed ? 'incomplete' : 'complete'}</p></TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500" />{task.completed ? 'Mark as Incomplete?' : 'Complete Task?'}</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to mark "{task.title}" as {task.completed ? 'incomplete' : 'complete'}?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onToggle(task.id)}>{task.completed ? 'Mark Incomplete' : 'Complete'}</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop card layout
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.8, transition: { duration: 0.2 } }}
      className="w-full origin-top"
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-8 transition-colors ${
                        task.completed
                          ? 'bg-accent/80 text-accent-foreground'
                          : 'hover:bg-accent/80'
                      }`}
                    >
                      <CheckCircle className="size-5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Finished?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge
                        variant="secondary"
                        className="hover:bg-accent transition-colors"
                      >
                        <LinkIcon className="size-3 mr-1.5" />
                        {link.title.length > 20
                          ? `${link.title.substring(0, 20)}...`
                          : link.title}
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
                          This action cannot be undone. This will permanently delete the
                          task "{task.title}".
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={handleSave}
                  >
                    <Save className="size-4 text-accent" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={handleCancel}
                  >
                    <X className="size-4" />
                  </Button>
                </>
            ) : (
                <>
                  {!task.completed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-60 hover:opacity-100"
                      onClick={() => setIsEditing(true)}
                    >
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
