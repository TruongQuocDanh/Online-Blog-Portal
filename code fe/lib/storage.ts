import type { User } from "./types"

// Key lưu trong localStorage (đặt đúng 100%)
const TOKEN_KEY = "jwt_token"
const CURRENT_USER_KEY = "current_user"

// Lưu token + user
export function saveAuth(token: string, user: User) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

// Lấy token
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem(TOKEN_KEY)

  // Loại bỏ giá trị sai
  if (!token || token === "null" || token === "undefined") return null

  return token
}

// Xóa token + user
export function clearAuth() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Convert user backend -> frontend format
export function convertBackendUser(user: any): User {
  return {
    id: String(user.userId),
    email: user.email,
    name: user.username ?? "",
    displayName: user.displayName ?? "",
    password: "",
    role: user.role === 1 ? "admin" : "user",
    createdAt: user.createdAt || "",
  }
}

// Set current user
export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Lấy current user
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const raw = localStorage.getItem(CURRENT_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

// Kiểm tra đã login chưa
export function isLoggedIn(): boolean {
  return getToken() !== null
}
