
'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Confetti } from './Confetti';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper } from 'lucide-react';
import { useAppContext } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

const TASK_COLORS = ['#64B5F6', '#81C784', '#FFD54F', '#FF8A65', '#9575CD', '#F06292'];

export function TodoList() {
  const { tasks, setTasks } = useAppContext(); 
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);

  const ongoingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleAddTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTask = (id: string) => {
    let taskTitle = '';
    let isCompleting = false;

    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        if (!task.completed) {
          taskTitle = task.title;
          isCompleting = true;
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    setTasks(updatedTasks);

    if (isCompleting) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast({
        title: 'Task Completed!',
        description: (
          <div className="flex items-center gap-2">
            <PartyPopper className="text-accent" />
            <span>Great job on finishing "{taskTitle}"!</span>
          </div>
        ),
      });
      const alarm = new Audio('/sounds/task_complete.wav');
      alarm.play().catch(error => console.error('Could not play alarm', error));
    }
  };

  const handleUpdateTask = (id: string, title: string, description?: string) => {
    const updatedTasks = tasks.map((task) => 
      (task.id === id ? { ...task, title, description } : task)
    );
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const finalTasks = Array.from(tasks);
    const [reorderedItem] = finalTasks.splice(tasks.findIndex(t => t.id === draggableId), 1);
    
    if (source.droppableId !== destination.droppableId) {
        reorderedItem.completed = !reorderedItem.completed;
    }

    const ongoing = finalTasks.filter(t => !t.completed);
    const completed = finalTasks.filter(t => t.completed);

    if (destination.droppableId === 'ongoing') {
        ongoing.splice(destination.index, 0, reorderedItem);
    } else {
        completed.splice(destination.index, 0, reorderedItem);
    }

    setTasks([...ongoing, ...completed]);
  };

  const taskContainerClasses = cn(
    isMobile ? "flex flex-col gap-1" : "grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-6 items-start"
  );

  const renderTaskList = (tasksToRender: Task[], droppableId: string) => (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={taskContainerClasses}
        >
          {tasksToRender.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <TaskItem
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  isDragging={snapshot.isDragging}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  if (isMobile) {
    return (
      <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={onDragEnd}>
        <div className="space-y-4">
            <Card className={cn(
                "bg-card/80 border-border/50 shadow-lg",
                !isDragging && "backdrop-blur-sm"
            )}>
                <CardContent className="p-3 space-y-3">
                    <AddTaskForm onAddTask={handleAddTask} />
                    {renderTaskList(ongoingTasks, 'ongoing')}
                </CardContent>
            </Card>

            {completedTasks.length > 0 && (
                <Card className={cn(
                    "bg-card/60 border-border/30 shadow-lg",
                    !isDragging && "backdrop-blur-sm"
                )}>
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-xl text-shadow">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        {renderTaskList(completedTasks, 'completed')}
                    </CardContent>
                </Card>
            )}
        </div>
      </DragDropContext>
    );
  }

  return (
    <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={onDragEnd}>
      <div className="relative space-y-10">
        {showConfetti && <Confetti />}

        <div className="space-y-10">
          <Card className={cn(
              "bg-card/80 border-border/50 shadow-lg",
              !isDragging && "backdrop-blur-sm"
          )}>
            <CardContent className="p-6">
              <div className="pb-4">
                <AddTaskForm onAddTask={handleAddTask} />
              </div>
              {ongoingTasks.length > 0 ? (
                renderTaskList(ongoingTasks, 'ongoing')
              ) : (
                <p className="text-muted-foreground p-4 text-center">
                  Nothing to do! Add a task above.
                </p>
              )}
            </CardContent>
          </Card>

          {completedTasks.length > 0 && (
            <Card className={cn(
                "bg-card/60 border-border/30 shadow-lg",
                !isDragging && "backdrop-blur-sm"
            )}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-shadow">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTaskList(completedTasks, 'completed')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
