import { AxiosInstance } from 'axios';

import AppService from 'frontend/services/app.service';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';

export default class APIService extends AppService {
  apiClient: AxiosInstance;
  apiUrl: string;

  constructor() {
    super();
    this.apiUrl = `${this.appHost}/api`;
    this.apiClient = APIService.getAxiosInstance({
      baseURL: this.apiUrl,
    });

    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const accessToken = getAccessTokenFromStorage();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken.token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        return Promise.reject(error);
      }
    );
  }
}
