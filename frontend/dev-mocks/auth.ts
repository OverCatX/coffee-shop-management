import { LoginRequest, LoginResponse, UserInfo } from '@/lib/api/auth';
import { mockEmployees } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock users with passwords (for demo: password is "password123")
const mockUsers = mockEmployees.map((emp) => ({
  ...emp,
  password: 'password123', // Demo password
}));

export const mockAuthApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await delay(500);
    
    const user = mockUsers.find(
      (u) => u.email?.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      throw new Error('Incorrect email or password');
    }

    // For demo: accept any password if user exists
    // In production, verify password hash
    if (credentials.password !== user.password && credentials.password !== 'password123') {
      throw new Error('Incorrect email or password');
    }

    // Generate mock JWT token
    const mockToken = `mock_jwt_token_${user.emp_id}_${Date.now()}`;

    return {
      access_token: mockToken,
      token_type: 'bearer',
      emp_id: user.emp_id,
      name: user.name,
      role: user.role,
      email: user.email,
    };
  },

  getCurrentUser: async (): Promise<UserInfo> => {
    await delay(200);
    // In real app, decode token to get user info
    // For mock, get user from token storage or return first user
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    }
    const user = mockUsers[0];
    if (!user) {
      throw new Error('No user found');
    }
    return {
      emp_id: user.emp_id,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
    // Mock logout - just return success
  },
};

