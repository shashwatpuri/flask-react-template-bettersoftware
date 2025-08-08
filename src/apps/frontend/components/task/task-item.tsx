import React, { useState } from 'react';

import Button from 'frontend/components/button';
import Input from 'frontend/components/input';
import ParagraphMedium from 'frontend/components/typography/paragraph-medium';
import { ButtonKind } from 'frontend/types/button';
import { Task, TaskUpdateData } from 'frontend/services/task.service';

interface TaskItemProps {
  task: Task;
  accountId: string;
  onUpdate: (taskId: string, updates: TaskUpdateData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
import TaskComments from './task-comments';


const TaskItem: React.FC<TaskItemProps> = ({
  task,
  accountId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedComments, setExpandedComments] = useState(false);

  const handleSave = async () => {
    if (!editingTask) return;

    await onUpdate(task.id, {
      title: editingTask.title,
      description: editingTask.description,
      isFinished: editingTask.isFinished,
    });
    setEditingTask(null);
  };

  const handleCancel = () => {
    setEditingTask(null);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    await onDelete(task.id);
  };

  const toggleComments = () => {
    setExpandedComments(!expandedComments);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {editingTask ? (
        <div className="space-y-3">
          <Input
            type="text"
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                title: e.target.value,
              })
            }
          />
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editingTask.isFinished ? 'completed' : 'ongoing'}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                isFinished: e.target.value === 'completed',
              })
            }
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                description: e.target.value,
              })
            }
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} disabled={isUpdating}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{task.title}</h4>
              <ParagraphMedium>
                {task.description || 'No description'}
              </ParagraphMedium>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${task.isFinished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}
                >
                  {task.isFinished ? 'Completed' : 'Ongoing'}
                </span>
                <span className="text-gray-500">
                  {task.created_at
                    ? new Date(task.created_at).toLocaleDateString()
                    : 'N/A'}
                </span>
                <button
                  onClick={toggleComments}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedComments ? 'Hide comments' : 'Show comments'}
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setEditingTask(task)}
                kind={ButtonKind.SECONDARY}
                disabled={isUpdating || isDeleting}
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                kind={ButtonKind.TERTIARY}
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {expandedComments && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <TaskComments
                taskId={task.id}
                accountId={accountId}
                initialComments={task.comments || []}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
