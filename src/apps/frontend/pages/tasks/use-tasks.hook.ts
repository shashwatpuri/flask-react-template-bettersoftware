
import useAsync from 'frontend/contexts/async.hook';

import { AsyncResult, AsyncError } from 'frontend/types';
import { Nullable } from 'frontend/types/common-types';
import taskService, { Task } from 'frontend/services/task.service';
const getTasksFn = async (accountId: string): Promise<AsyncResult<Task[]>> => {
  const tasks = await taskService.getTasks(accountId);
  return { data: tasks };
};

const createTaskFn = async (
  accountId: string,
  title: string,
  description: string,
  isFinished: boolean,
): Promise<AsyncResult<Task>> => {
  const task = await taskService.createTask(accountId, title, description, isFinished);
  return { data: task };
};

const updateTaskFn = async (
  accountId: string,
  taskId: string,
  updates: { title?: string; description?: string; isFinished: boolean },
): Promise<AsyncResult<Task>> => {
  const task = await taskService.updateTask(accountId, taskId, updates);
  return { data: task };
};

const deleteTaskFn = async (
  accountId: string,
  taskId: string,
): Promise<AsyncResult<void>> => {
  await taskService.deleteTask(accountId, taskId);
  return { data: null };
};

export interface UseTasksReturn {
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
}

const useTasks = (): UseTasksReturn => {
  const {
    asyncCallback: fetchTasks,
    isLoading: isFetchingTasks,
    error: fetchTasksError,
    result: tasks,
  } = useAsync<Task[]>(getTasksFn);

  const {
    asyncCallback: createTask,
    isLoading: isCreatingTask,
    error: createTaskError,
  } = useAsync<Task>(createTaskFn);

  const {
    asyncCallback: updateTask,
    isLoading: isUpdatingTask,
    error: updateTaskError,
  } = useAsync<Task>(updateTaskFn);

  const {
    asyncCallback: deleteTask,
    isLoading: isDeletingTask,
    error: deleteTaskError,
  } = useAsync<void>(deleteTaskFn);

  return {
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
  };
};

export default useTasks;
