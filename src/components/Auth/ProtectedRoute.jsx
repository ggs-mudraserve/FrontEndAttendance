import { useAuth } from '../../contexts/AuthContext'
import { LoginForm } from './LoginForm'
import LoadingSpinner from '../UI/LoadingSpinner'

export const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth()

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