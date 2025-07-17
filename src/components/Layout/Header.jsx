import { Calendar, Clock, Users, LogOut } from 'lucide-react'
import { formatDate } from '../../utils/dateHelpers'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthActions } from '../../hooks/useAuth'
import Button from '../UI/Button'

const Header = () => {
  const currentDate = new Date()
  const currentTime = new Date().toLocaleTimeString()
  const { profile } = useAuth()
  const { logout } = useAuthActions()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Attendance Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">
                {formatDate(currentDate.toISOString())}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">
                {currentTime}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {profile?.first_name} {profile?.last_name} - Admin
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header