import { useState } from 'react'
import { signIn, signOut } from '../services/supabase'

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await signOut()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    logout,
    loading,
    error,
    clearError: () => setError(null)
  }
}