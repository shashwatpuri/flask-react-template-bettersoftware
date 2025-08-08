import React from 'react';

import ParagraphMedium from 'frontend/components/typography/paragraph-medium';
import { Task, TaskUpdateData } from 'frontend/services/task.service';

interface TaskListProps {
  tasks: Task[];
  accountId: string;
  onUpdate: (taskId: string, updates: TaskUpdateData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
import TaskItem from './task-item';





const TaskList: React.FC<TaskListProps> = ({
  tasks,
  accountId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>
      {tasks.length === 0 ? (
        <ParagraphMedium>
          No tasks found. Create your first task above!
        </ParagraphMedium>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              accountId={accountId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
