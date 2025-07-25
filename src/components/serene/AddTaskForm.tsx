'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
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

  const handleCancel = () => {
    form.reset();
    setIsExpanded(false);
  }

  return (
    <motion.div
      layout
      className={`p-4 border rounded-lg ${isExpanded ? 'bg-background' : 'bg-transparent border-dashed'}`}
      transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
    >
      <AnimatePresence initial={false} mode="wait">
        {isExpanded ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
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
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    <X className="mr-2" /> Cancel
                  </Button>
                  <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="mr-2" /> Add Task
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center text-muted-foreground hover:text-foreground w-full transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a new task
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
