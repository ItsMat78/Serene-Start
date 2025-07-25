'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useRef, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
  description: z.string().optional(),
});

type AddTaskFormProps = {
  onAddTask: (title: string, description?: string) => void;
};

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scope, animate] = useAnimate();
  const formContainerRef = useRef<HTMLDivElement>(null);

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
    handleToggle(false);
  }

  const handleToggle = async (expand: boolean) => {
    setIsExpanded(expand);
    const formContainer = formContainerRef.current;
    if (formContainer) {
      animate(scope.current, { height: expand ? formContainer.scrollHeight : 0 }, { duration: 0.3, ease: 'easeInOut' });
    }
  };

  return (
    <div
      className={cn(
        'p-3 border rounded-lg transition-colors',
        isExpanded
          ? 'bg-card border-border'
          : 'bg-transparent border-dashed hover:border-primary/50 hover:bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        <motion.button
          onClick={() => handleToggle(!isExpanded)}
          className="flex-shrink-0 size-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors"
          aria-label={isExpanded ? 'Cancel adding task' : 'Add a new task'}
        >
          <motion.div animate={{ rotate: isExpanded ? 45 : 0 }}>
            <Plus className="size-5" />
          </motion.div>
        </motion.button>

        <div className="w-full overflow-hidden">
          <button
            className="flex items-center h-10 text-left w-full disabled:cursor-text"
            onClick={() => handleToggle(true)}
            disabled={isExpanded}
          >
            <span className="text-muted-foreground">Add a new task...</span>
          </button>

          <motion.div
            ref={scope}
            initial={{ height: 0 }}
            className="overflow-hidden"
          >
            <div ref={formContainerRef}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="What needs to be done?"
                            {...field}
                            className="h-10 text-base"
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
