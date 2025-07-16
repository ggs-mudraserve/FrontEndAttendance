import { useState, useMemo } from 'react'
import { Calendar, Clock, User, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../UI/Card'
import Badge from '../UI/Badge'
import Button from '../UI/Button'
import LoadingSpinner from '../UI/LoadingSpinner'
import { useAttendanceRecords } from '../../hooks/useAttendance'
import { calculateWorkingDays } from '../../utils/dateHelpers'

const EmployeeAttendanceDetail = ({ employee, onBack }) => {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  const { data: attendanceRecords, isLoading, error } = useAttendanceRecords(selectedMonth, selectedYear)
  
  const employeeData = useMemo(() => {
    if (!attendanceRecords || !employee) return null
    
    const employeeRecords = attendanceRecords.filter(record => 
      record.employee_id === employee.id
    )
    
    // Calculate stats
    const presentDays = employeeRecords.filter(r => r.status === 'Present').length
    const lateDays = employeeRecords.filter(r => r.status === 'Late').length
    const halfDays = employeeRecords.filter(r => r.status === 'Half Day').length
    const absentDays = employeeRecords.filter(r => r.status === 'Absent').length
    
    const workingDays = calculateWorkingDays(selectedYear, selectedMonth)
    const attendanceRate = workingDays > 0 ? (presentDays / workingDays) * 100 : 0
    
    return {
      records: employeeRecords.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)),
      stats: {
        presentDays,
        lateDays,
        halfDays,
        absentDays,
        workingDays,
        attendanceRate
      }
    }
  }, [attendanceRecords, employee, selectedMonth, selectedYear])
  
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success'
      case 'Late': return 'warning'
      case 'Half Day': return 'info'
      case 'Absent': return 'danger'
      default: return 'secondary'
    }
  }
  
  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const getMonthName = (month, year) => {
    return new Date(year, month - 1).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  if (isLoading) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading attendance data: {error.message}</p>
          <Button onClick={onBack} className="mt-4">
            Back to Employee List
          </Button>
        </div>
      </Card>
    )
  }
  
  if (!employeeData) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">No attendance data found for this employee.</p>
          <Button onClick={onBack} className="mt-4">
            Back to Employee List
          </Button>
        </div>
      </Card>
    )
  }
  
  const { records, stats } = employeeData
  
  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-gray-600">
                {employee.emp_code} • {employee.role} • {employee.segment}
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={onBack}>
            Back to List
          </Button>
        </div>
      </Card>
      
      {/* Month Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => navigateMonth('prev')}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Month</span>
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {getMonthName(selectedMonth, selectedYear)}
          </h3>
          
          <Button
            variant="secondary"
            onClick={() => navigateMonth('next')}
            className="flex items-center space-x-2"
            disabled={selectedMonth === currentDate.getMonth() + 1 && selectedYear === currentDate.getFullYear()}
          >
            <span>Next Month</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      
      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentDays}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Late Days</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lateDays}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Half Days</p>
              <p className="text-2xl font-bold text-blue-600">{stats.halfDays}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Absent Days</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.attendanceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Daily Attendance Records */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Attendance Records
          </h3>
          <p className="text-sm text-gray-600">
            {records.length} records found
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Out Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.attendance_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status || 'No Status'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(record.in_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(record.out_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.total_minutes ? `${Math.floor(record.total_minutes / 60)}h ${record.total_minutes % 60}m` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records found for this month.</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default EmployeeAttendanceDetail