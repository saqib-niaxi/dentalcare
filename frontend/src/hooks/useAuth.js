import { useAuth as useAuthContext } from '../context/AuthContext'

// Re-export the context hook for convenience
export function useAuth() {
  return useAuthContext()
}
