  import APIService from './api.service';

import { AxiosResponse } from 'axios';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  account_id: string;
  isFinished: boolean;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
}

export interface TaskFormData {
  title: string;
  description: string;
  isFinished: boolean;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  isFinished: boolean;
}

class TaskService extends APIService {
  constructor() {
    super();
    this.apiUrl += '/tasks';
  }

  async getTasks(accountId: string, page: number = 1, size: number = 10): Promise<{ items: Task[]; total: number; page: number; total_pages: number }> {
    const response: AxiosResponse<{ items: Task[]; total: number; page: number; total_pages: number }> = 
      await this.apiClient.get(
        `/accounts/${accountId}/tasks`,
        { params: { page, size } }
      );
    return response.data;
  }

  async getTask(accountId: string, taskId: string): Promise<Task> {
    const response: AxiosResponse<Task> = await this.apiClient.get(
      `/accounts/${accountId}/tasks/${taskId}`,
    );
    return response.data;
  }

  async createTask(
    accountId: string,
    title: string,
    description: string,
    isFinished: boolean,
  ): Promise<Task> {
    const response: AxiosResponse<Task> = await this.apiClient.post(
      `/accounts/${accountId}/tasks`,
      { title, description, isFinished },
    );
    return response.data;
  }

  async updateTask(
    accountId: string,
    taskId: string,
    updates: { title?: string; description?: string; isFinished: boolean },
  ): Promise<Task> {
    const response: AxiosResponse<Task> = await this.apiClient.patch(
      `/accounts/${accountId}/tasks/${taskId}`,
      updates,
    );
    return response.data;
  }

  async deleteTask(accountId: string, taskId: string): Promise<void> {
    await this.apiClient.delete(`/accounts/${accountId}/tasks/${taskId}`);
  }

  async addComment(
    accountId: string,
    taskId: string,
    content: string,
  ): Promise<Comment> {
    try {
      const response: AxiosResponse<Comment> = await this.apiClient.post(
        `/accounts/${accountId}/tasks/${taskId}/comments`,
        { content },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in addComment:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      throw error;
    }
  }

  async updateComment(
    accountId: string,
    taskId: string,
    commentId: string,
    content: string,
  ): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.apiClient.patch(
      `/accounts/${accountId}/tasks/${taskId}/comments/${commentId}`,
      { content },
    );
    return response.data;
  }

  async deleteComment(
    accountId: string,
    taskId: string,
    commentId: string,
  ): Promise<void> {
    await this.apiClient.delete(
      `/accounts/${accountId}/tasks/${taskId}/comments/${commentId}`,
    );
  }
}

export default new TaskService();