import { api } from './api'

export const authApi = {
  registerTeacher: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register/teacher', data),

  registerStudent: (data: { name: string; email: string; password: string; lrn: string; sectionId: string }) =>
    api.post('/auth/register/student', data),

  loginTeacher: (data: { email: string; password: string }) =>
    api.post<{ token: string }>('/auth/login/teacher', data),

  loginStudent: (data: { email: string; password: string }) =>
    api.post<{ token: string }>('/auth/login/student', data),

  getMe: (token: string) =>
    api.get('/auth/me', token)
}