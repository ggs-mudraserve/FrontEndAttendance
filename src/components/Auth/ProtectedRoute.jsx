import { useAuth } from '../../contexts/AuthContext'
import { LoginForm } from './LoginForm'
import LoadingSpinner from '../UI/LoadingSpinner'

export const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth()

  // Temporarily skip authentication for development/testing
  if (process.env.NODE_ENV === 'development') {
    if (loading) {
      // Add timeout for development
      setTimeout(() => {
        console.log('Development mode: skipping auth check')
      }, 2000)
    }
    
    // Skip auth in development after 2 seconds
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return children
}