import { useState, useEffect, useCallback } from "react"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  })

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }))
  }, [])
  const navigate = useNavigate()

  // Carregar sessão existente no localStorage ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      updateAuthState({ loading: false })
      return
    }

    // Validar token no backend e buscar dados do usuário
    const fetchUser = async () => {

      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        updateAuthState({
          user: res.data,
          isAuthenticated: true,
          loading: false,
          error: null
        })
      } catch (err) {
        console.error("Erro ao validar sessão:", err)
        localStorage.removeItem("token")
        updateAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        })
      }
    }

    fetchUser()
  }, [updateAuthState])

  // Login
  const signIn = useCallback(
    async (email: string, password: string) => {
      updateAuthState({ loading: true, error: null })
      try {
        const res = await api.post("/auth/login", { email, password })

        const { token, user } = res.data
        localStorage.setItem("token", token)

        updateAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        })

        return user
      } catch (error: any) {
        console.error("Login error:", error)
        updateAuthState({
          loading: false,
          error: error.response?.data?.message || "Erro ao fazer login"
        })
        throw error
      }
    },
    [updateAuthState]
  )

  // Logout
  const signOut = useCallback(() => {
    localStorage.removeItem("token")
    updateAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    })
    navigate("/login");
  }, [updateAuthState])

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut
  }
}
