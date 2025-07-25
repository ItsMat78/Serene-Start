'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RenderWithLinks } from './RenderWithLinks';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

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
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className="bg-background/50 rounded-lg transition-colors group"
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={task.id} className="border-b-0">
          <div className="flex items-center gap-2 p-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="size-5 rounded-md border-primary/50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
            />

            {isEditing ? (
              <Input 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 flex-grow"
              />
            ) : (
                <AccordionTrigger className="flex-1 p-0 hover:no-underline justify-start">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-left text-base font-medium transition-colors ${
                      task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </label>
                </AccordionTrigger>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="icon" className="size-8" onClick={handleSave}><Save className="size-4 text-accent" /></Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={handleCancel}><X className="size-4" /></Button>
                </>
              ) : (
                <>
                  {!task.completed && <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsEditing(true)}><Edit className="size-4" /></Button>}
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => onDelete(task.id)}><Trash2 className="size-4 text-destructive/80" /></Button>
                </>
              )}
            </div>
          </div>
          
          <AccordionContent className="px-4 pb-3">
            <div className="pl-8 space-y-2">
              {isEditing ? (
                <Textarea 
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add details and links..."
                />
              ) : (
                <div className="text-muted-foreground text-sm prose prose-sm prose-p:my-0 prose-a:text-primary">
                  {task.description ? <RenderWithLinks text={task.description} /> : <p className="italic">No details.</p>}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.li>
  );
}
