import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  emp_id: number;
  name: string;
  role: string;
  email?: string;
}

export interface UserInfo {
  emp_id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login-json', credentials);
    return data;
  },

  getCurrentUser: async (): Promise<UserInfo> => {
    const { data } = await apiClient.get<UserInfo>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

export { authApi };

// Token management
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  setUserInfo: (userInfo: UserInfo): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  },
};
