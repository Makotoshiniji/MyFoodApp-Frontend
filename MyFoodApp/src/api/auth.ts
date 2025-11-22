// src/api/auth.ts
import api from './client';

export type LoginResponse = {
  id: number;
  username: string;
  email?: string;
  rank: 'admin' | 'user';
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export const AuthApi = {
  login: (payload: { identity: string; password: string }) =>
    api.post<LoginResponse>('/Auth/login', payload).then(r => r.data),

  register: (payload: RegisterRequest) =>
    api.post<LoginResponse>('/Auth/register', payload).then(r => r.data),
  // 1. ขอ OTP
  forgotPassword: async (email: string) => {
    const res = await api.post('/Auth/forgot-password', { email });
    return res.data;
  },

  // 2. ยืนยัน OTP
  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post('/Auth/verify-otp', { email, otp });
    return res.data;
  },

  // 3. ตั้งรหัสใหม่
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post('/Auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return res.data;
  },
};

export default AuthApi;
