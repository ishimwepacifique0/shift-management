import { apiClient } from './axios'
import PathVariable from '../../types/pathVaribale'
import { ApiResponse, User } from '../../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  permissions: string[]
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  phone: string
  address: string
  date_of_birth: string
  user_type: 'ADMIN' | 'STAFF' | 'CLIENT'
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post(PathVariable.LOGIN, credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post(PathVariable.REGISTER, data)
    return response.data
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(PathVariable.ME)
    return response.data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.LOGOUT)
    return response.data
  },

  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.CHANGE_PASSWORD, data)
    return response.data
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.FORGOT_PASSWORD, { email })
    return response.data
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.RESET_PASSWORD, { token, password })
    return response.data
  },

  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.VERIFY_EMAIL, { token })
    return response.data
  },

  resendVerification: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(PathVariable.VERIFY_EMAIL, { email })
    return response.data
  }
}