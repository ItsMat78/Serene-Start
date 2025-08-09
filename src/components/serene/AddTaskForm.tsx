
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      const targetHeight = expand ? formContainer.scrollHeight : 0;
      animate(scope.current, { height: targetHeight }, { duration: 0.3, ease: 'easeInOut' });
    }
  };
  
  const plusIconSize = isMobile ? 'size-4' : 'size-5';
  const formPadding = isMobile ? 'p-2' : 'p-3';
  const buttonContainerClass = isMobile ? 'size-9' : 'size-10';
  const inputHeight = isMobile ? 'h-9' : 'h-10';
  const placeholderText = isMobile ? "Add task..." : "Add a new task...";

  return (
    <div
      className={cn(
        `${formPadding} border rounded-lg transition-colors`,
        isExpanded
          ? 'bg-card border-border'
          : 'bg-transparent border-dashed hover:border-primary/50 hover:bg-primary/5'
      )}
    >
      <div className="flex items-start gap-2">
        <motion.button
          onClick={() => handleToggle(!isExpanded)}
          className={`flex-shrink-0 ${buttonContainerClass} rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors`}
          aria-label={isExpanded ? 'Cancel adding task' : 'Add a new task'}
        >
          <motion.div animate={{ rotate: isExpanded ? 45 : 0 }}>
            <Plus className={plusIconSize} />
          </motion.div>
        </motion.button>

        <div className="w-full overflow-hidden">
          <button
            className={`flex items-center text-left w-full disabled:cursor-text ${inputHeight}`}
            onClick={() => handleToggle(true)}
            disabled={isExpanded}
          >
            <span className={cn("text-muted-foreground", isMobile && "text-sm")}>{placeholderText}</span>
          </button>

          <motion.div
            ref={scope}
            initial={{ height: 0 }}
            className="overflow-hidden"
          >
            <div ref={formContainerRef}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pt-1">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="What needs to be done?"
                            {...field}
                            className={cn(inputHeight, isMobile ? 'text-sm' : 'text-base')}
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
                          <Textarea placeholder="Add details or links (optional)" {...field} className={cn(isMobile ? 'text-sm' : '')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-1">
                    <Button type="submit" size={isMobile ? 'sm' : 'default'} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
