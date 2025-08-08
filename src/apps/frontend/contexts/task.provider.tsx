import React, { createContext, PropsWithChildren, useContext } from 'react';

import { AsyncError } from 'frontend/types';
import { Nullable } from 'frontend/types/common-types';
import useTasks from 'frontend/pages/tasks/use-tasks.hook';
import { Task } from 'frontend/services/task.service';

type TaskContextType = {
  fetchTasks: (accountId: string) => Promise<Nullable<Task[]>>;
  tasks: Nullable<Task[]>;
  isFetchingTasks: boolean;
  fetchTasksError: Nullable<AsyncError>;

  createTask: (
    accountId: string,
    title: string,
    description: string,
    isFinished: boolean,
  ) => Promise<Nullable<Task>>;
  isCreatingTask: boolean;
  createTaskError: Nullable<AsyncError>;

  updateTask: (
    accountId: string,
    taskId: string,
    updates: { title?: string; description?: string; isFinished: boolean },
  ) => Promise<Nullable<Task>>;
  isUpdatingTask: boolean;
  updateTaskError: Nullable<AsyncError>;

  deleteTask: (accountId: string, taskId: string) => Promise<Nullable<void>>;
  isDeletingTask: boolean;
  deleteTaskError: Nullable<AsyncError>;
};

const TaskContext = createContext<Nullable<TaskContextType>>(null);

export const useTaskContext = (): TaskContextType =>
  useContext(TaskContext) as TaskContextType;

export const TaskProvider: React.FC<PropsWithChildren> = ({ children }) => {
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
  } = useTasks();

  return (
    <TaskContext.Provider
      value={{
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
