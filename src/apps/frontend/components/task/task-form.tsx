import React, { useState } from 'react';

import Button from 'frontend/components/button';
import Input from 'frontend/components/input';
import { ButtonType } from 'frontend/types/button';
import { TaskFormData } from 'frontend/services/task.service';

interface TaskFormProps {
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    isFinished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await onSubmit(formData);

    setFormData({
      title: '',
      description: '',
      isFinished: false,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <Input
            id="task-title"
            type="text"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            aria-describedby="task-title-help"
          />
          <p id="task-title-help" className="mt-1 text-sm text-gray-500">
            Enter a descriptive title for your task
          </p>
        </div>
        <div>
          <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="task-status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.isFinished ? 'completed' : 'ongoing'}
            onChange={(e) =>
              setFormData({
                ...formData,
                isFinished: e.target.value === 'completed',
              })
            }
            aria-describedby="task-status-help"
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <p id="task-status-help" className="mt-1 text-sm text-gray-500">
            Choose whether the task is ongoing or completed
          </p>
        </div>
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="task-description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            aria-describedby="task-description-help"
          />
          <p id="task-description-help" className="mt-1 text-sm text-gray-500">
            Provide additional details about the task (optional)
          </p>
        </div>
        <Button type={ButtonType.SUBMIT} disabled={isSubmitting || !formData.title.trim()}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </div>
  );
};

export default TaskForm;
