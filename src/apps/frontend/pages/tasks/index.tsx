import React, { useState, useEffect, useCallback } from 'react';
import H2 from 'frontend/components/typography/h2';
import Spinner from 'frontend/components/spinner/spinner';
import toast from 'react-hot-toast';
import TaskForm from 'frontend/components/task/task-form';
import TaskList from 'frontend/components/task/task-list';
import { TaskFormData } from 'frontend/services/task.service';
import { useTaskContext } from 'frontend/contexts/task.provider';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';

const TasksPage: React.FC = () => {
  const [accessToken] = useState(() => getAccessTokenFromStorage());
  const {
    // Task data
    tasks,
    filteredTasks,
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

    // Pagination
    currentPage,
    fetchTasks,

    // Filter
    filter,
    setFilter,
  } = useTaskContext();

  const loadTasks = useCallback((page: number) => {
    if (accessToken?.accountId) {
      return fetchTasks(accessToken.accountId, page, 10);
    }
    return Promise.resolve(null);
  }, [accessToken?.accountId, fetchTasks]);

  // Initial load
  useEffect(() => {
    if (accessToken?.accountId) {
      loadTasks(1);
    }
  }, [accessToken?.accountId, loadTasks]);

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
    if (!accessToken?.accountId) return;

    try {
      await createTask(
        accessToken.accountId,
        taskData.title,
        taskData.description,
        taskData.isFinished
      );

      await loadTasks(1);
      toast.success('Task created successfully!');
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
    if (!accessToken?.accountId) return;

    try {
      await deleteTask(accessToken.accountId, taskId);

      // go back if empty
      const shouldGoToPreviousPage = tasks && tasks.length === 1 && currentPage > 1;
      const targetPage = shouldGoToPreviousPage ? currentPage - 1 : currentPage;

      await loadTasks(targetPage);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1) {
      loadTasks(newPage);
    }
  };

  const PaginationControls = () => (
    <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isFetchingTasks}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="flex items-center">Page {currentPage}</span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!tasks || tasks.length < 10 || isFetchingTasks}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  const FilterControls = () => (
    <div className="flex items-center gap-4 mb-4">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="taskFilter"
          checked={filter === 'all'}
          onChange={() => setFilter('all')}
          className="text-blue-500"
        />
        All Tasks
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="taskFilter"
          checked={filter === 'finished'}
          onChange={() => setFilter('finished')}
          className="text-green-500"
        />
        Finished
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="taskFilter"
          checked={filter === 'unfinished'}
          onChange={() => setFilter('unfinished')}
          className="text-yellow-500"
        />
        Unfinished
      </label>
    </div>
  );



  if (isFetchingTasks && !tasks?.length) {
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
      <div className='flex flex-col items-center'>
        <PaginationControls />
        <FilterControls />
      </div>

      <div className="mb-6">
        <TaskList
          tasks={filteredTasks}
          accountId={accessToken?.accountId || ''}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          isUpdating={isUpdatingTask}
          isDeleting={isDeletingTask}
        />
      </div>
    </div>
  );
};

export default TasksPage;
