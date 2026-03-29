import axios from 'axios';
import { appConfig } from '@cafetrack/config';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
});

export const setAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};
