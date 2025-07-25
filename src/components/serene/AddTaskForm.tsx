'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
  description: z.string().optional(),
});

type AddTaskFormProps = {
  onAddTask: (title: string, description?: string) => void;
};

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask(values.title, values.description);
    form.reset();
    setIsExpanded(false);
  }

  const handleToggle = () => {
    if (isExpanded) {
      form.reset();
    }
    setIsExpanded(!isExpanded);
  }

  return (
    <motion.div
      layout
      className={`p-4 border rounded-lg ${isExpanded ? 'bg-background' : 'bg-transparent border-dashed'}`}
      transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
    >
      <div className="flex items-start gap-3">
        <motion.button
          onClick={handleToggle}
          className="flex-shrink-0 size-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors"
          aria-label={isExpanded ? 'Cancel adding task' : 'Add a new task'}
        >
          <motion.div animate={{ rotate: isExpanded ? 45 : 0 }}>
            <Plus className="size-6" />
          </motion.div>
        </motion.button>
        
        <div className="w-full">
          <AnimatePresence initial={false} mode="wait">
            {!isExpanded ? (
               <motion.div
                 key="prompt"
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 transition={{ duration: 0.2 }}
                 className="flex items-center h-12"
               >
                 <span className="text-muted-foreground">Add a new task...</span>
               </motion.div>
            ) : (
              <motion.div
                key="form"
                className="w-full"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="What needs to be done?"
                              {...field}
                              className="h-12 text-lg"
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea placeholder="Add details or links (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-1">
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Add Task
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
