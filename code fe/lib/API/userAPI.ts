import { api } from "./api"

export interface UserRequest {
  username: string
  email: string
  passwordHash: string
  displayName: string
  role?: number
}

export interface UserResponse {
  userId: number
  username: string
  email: string
  role: number
  displayName: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginSuccessResponse {
  token: string
  userId: number
  email: string
  displayName: string
  role: number
}

export const userApi = {
  createUser: async (data: UserRequest) => {
    const res = await api.post<UserResponse>("/users/create", data)
    return res.data
  },

  getUserById: async (id: number) => {
    const res = await api.get<UserResponse>(`/users/${id}`)
    return res.data
  },

  getAllUsers: async () => {
    const res = await api.get<UserResponse[]>("/users")
    return res.data
  },

  updateUser: async (id: number, data: Partial<UserRequest>) => {
    const res = await api.put<UserResponse>(`/users/update/${id}`, data)
    return res.data
  },

  deleteUser: async (id: number) => {
    const res = await api.delete(`/users/delete/${id}`)
    return res.data
  },

  login: async (email: string, password: string) => {
    const res = await api.post<LoginSuccessResponse>("/users/login", {
      email,
      password,
    })
    return res.data
  },
}
