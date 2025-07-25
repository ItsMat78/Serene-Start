'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  
  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }

  return (
    <Card className="bg-transparent backdrop-blur-none border-none shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="What needs to be done?"
                        {...field}
                        className="h-12 text-lg pl-4 pr-12"
                        onFocus={handleFocus}
                      />
                      <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 size-9 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AnimatePresence>
              {isExpanded && (
                 <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                 >
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
                 </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
