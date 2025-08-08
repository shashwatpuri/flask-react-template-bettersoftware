import React, { useState, useEffect } from 'react';
import H2 from 'frontend/components/typography/h2';
import Spinner from 'frontend/components/spinner/spinner';
import toast from 'react-hot-toast';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';
import { useTaskContext } from 'frontend/contexts/task.provider';
import TaskForm from 'frontend/components/task/task-form';
import TaskList from 'frontend/components/task/task-list';
import { TaskFormData } from 'frontend/services/task.service';

const TasksPage: React.FC = () => {
  const [accessToken] = useState(() => getAccessTokenFromStorage());
  const {
    fetchTasks,
    tasks,
    isFetchingTasks,
    fetchTasksError,
    createTask,
    isCreatingTask,
    createTaskError,
    updateTask,
    isUpdatingTask,
    updateTaskError,
    deleteTask,
    isDeletingTask,
    deleteTaskError,
  } = useTaskContext();

  useEffect(() => {
    if (accessToken?.accountId) {
      fetchTasks(accessToken.accountId);
    }
  }, [accessToken?.accountId, fetchTasks]);

  useEffect(() => {
    if (fetchTasksError) {
      toast.error(fetchTasksError.message || 'Failed to load tasks');
    }
    if (createTaskError) {
      toast.error(createTaskError.message || 'Failed to create task');
    }
    if (updateTaskError) {
      toast.error(updateTaskError.message || 'Failed to update task');
    }
    if (deleteTaskError) {
      toast.error(deleteTaskError.message || 'Failed to delete task');
    }
  }, [fetchTasksError, createTaskError, updateTaskError, deleteTaskError]);

  const handleCreateTask = async (taskData: TaskFormData) => {
    if (!accessToken?.accountId) {
      toast.error('Please log in to create tasks');
      return;
    }

    try {
      const result = await createTask(
        accessToken.accountId,
        taskData.title,
        taskData.description,
        taskData.isFinished,
      );

      if (result) {
        toast.success('Task created successfully!');
        await fetchTasks(accessToken.accountId);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: { title?: string; description?: string; isFinished: boolean }) => {
    if (!accessToken?.accountId) {
      toast.error('Please log in to update tasks');
      return;
    }

    try {
      const result = await updateTask(accessToken.accountId, taskId, updates);
      if (result) {
        toast.success('Task updated successfully!');
        await fetchTasks(accessToken.accountId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!accessToken?.accountId) {
      toast.error('Please log in to delete tasks');
      return;
    }

    try {
      await deleteTask(accessToken.accountId, taskId);
      toast.success('Task deleted successfully!');
      await fetchTasks(accessToken.accountId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };



  if (isFetchingTasks) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <H2>Task Management</H2>

      <TaskForm
        onSubmit={handleCreateTask}
        isSubmitting={isCreatingTask}
      />

      <TaskList
        tasks={tasks || []}
        accountId={accessToken?.accountId || ''}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        isUpdating={isUpdatingTask}
        isDeleting={isDeletingTask}
      />
    </div>
  );
};

export default TasksPage;
