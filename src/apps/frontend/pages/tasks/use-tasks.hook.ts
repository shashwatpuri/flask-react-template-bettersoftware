
import { useState, useCallback } from 'react';
import useAsync from 'frontend/contexts/async.hook';

import { AsyncResult, AsyncError } from 'frontend/types';
import { Nullable } from 'frontend/types/common-types';
import taskService, { Task } from 'frontend/services/task.service';

interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  total_pages: number;
}

const DEFAULT_PAGE_SIZE = 10;

const getTasksFn = async (accountId: string, page: number, size: number): Promise<AsyncResult<PaginatedTasks>> => {
  const result = await taskService.getTasks(accountId, page, size);
  return { data: result };
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

export type TaskFilter = 'all' | 'finished' | 'unfinished';

export interface UseTasksReturn {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  filteredTasks: Task[];
  
  fetchTasks: (accountId: string, page?: number, size?: number) => Promise<Nullable<PaginatedTasks>>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [paginatedTasks, setPaginatedTasks] = useState<Nullable<PaginatedTasks>>(null);
  
  const filteredTasks = useCallback(() => {
    if (!paginatedTasks?.items) return [];
    if (filter === 'finished') return paginatedTasks.items.filter(task => task.isFinished);
    if (filter === 'unfinished') return paginatedTasks.items.filter(task => !task.isFinished);
    return paginatedTasks.items;
  }, [paginatedTasks, filter]);
  
  const fetchTasks = useCallback(async (accountId: string, page: number, size: number) => {
    try {
      const result = await getTasksFn(accountId, page, size);
      if (result.data) {
        setPaginatedTasks(result.data);
        setTotalItems(result.data.total || 0);
      }
      return result.data || null;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return null;
    }
  }, []);

  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [fetchTasksError, setFetchTasksError] = useState<AsyncError | null>(null);
  
  const tasks = paginatedTasks?.items || [];
  
  const wrappedFetchTasks = useCallback(async (accountId: string, page: number) => {
    setIsFetchingTasks(true);
    setFetchTasksError(null);
    try {
      const result = await fetchTasks(accountId, page, 10);
      setCurrentPage(page);
      return result;
    } catch (error) {
      setFetchTasksError({ 
        message: error instanceof Error ? error.message : 'Failed to fetch tasks',
        code: 'FETCH_ERROR' 
      });
      return null;
    } finally {
      setIsFetchingTasks(false);
    }
  }, [fetchTasks]);

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
    currentPage,
    pageSize,
    totalItems,
    setPage: setCurrentPage,
    setPageSize: useCallback((size: number) => {
      setPageSize(prevSize => {
        if (prevSize !== size) {
          setCurrentPage(1);
          return size;
        }
        return prevSize;
      });
    }, []),
    
    filter,
    setFilter,
    filteredTasks: filteredTasks(),
    
    fetchTasks: wrappedFetchTasks,
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
