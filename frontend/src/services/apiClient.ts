import { documentApi } from './document.service';

export type ApiClient = typeof apiClient
export const apiClient = {
  ...documentApi
}