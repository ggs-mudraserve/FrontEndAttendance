import { useState, useMemo } from 'react'
import { Search, Download, ChevronUp, ChevronDown } from 'lucide-react'
import Card from '../UI/Card'
import Badge from '../UI/Badge'
import Button from '../UI/Button'
import LoadingSpinner from '../UI/LoadingSpinner'

const AttendanceTable = ({ employees, loading = false, onEmployeeClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSegment, setFilterSegment] = useState('all')

  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return []

    let filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.emp_code?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'present' && employee.todaysAttendance?.isPresent) ||
        (filterStatus === 'absent' && !employee.todaysAttendance?.isPresent)

      const matchesSegment = filterSegment === 'all' || employee.segment === filterSegment

      return matchesSearch && matchesStatus && matchesSegment
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'name') {
          aValue = `${a.first_name} ${a.last_name}`
          bValue = `${b.first_name} ${b.last_name}`
        }

        if (sortConfig.key === 'netSalary') {
          aValue = a.salaryData?.netSalary || 0
          bValue = b.salaryData?.netSalary || 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [employees, searchTerm, sortConfig, filterStatus, filterSegment])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const exportToCSV = () => {
    const headers = [
      'Employee Name',
      'Employee Code',
      'Role',
      'Segment',
      'Today\'s Status',
      'In Time',
      'Out Time',
      'Present Days',
      'Actual Present Days',
      'Attendance Rate',
      'Monthly Salary',
      'Net Salary',
      'Deductions'
    ]

    const csvData = filteredAndSortedEmployees.map(employee => [
      `${employee.first_name} ${employee.last_name}`,
      employee.emp_code,
      employee.role,
      employee.segment,
      employee.todaysAttendance?.effectiveStatus || 'Absent',
      employee.todaysAttendance?.in_time ? 
        new Date(employee.todaysAttendance.in_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : '-',
      employee.todaysAttendance?.out_time ? 
        new Date(employee.todaysAttendance.out_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : '-',
      employee.present_days || 0,
      employee.salaryData?.actualPresentDays || 0,
      `${employee.salaryData?.attendanceRate?.toFixed(1) || 0}%`,
      employee.salary_current || 0,
      employee.salaryData?.netSalary || 0,
      employee.salaryData?.deductions || 0
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
          Employee Attendance Details
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="present">Present Today</option>
            <option value="absent">Absent Today</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
          >
            <option value="all">All Segments</option>
            <option value="PL">PL</option>
            <option value="BL">BL</option>
            <option value="PL_DIGITAL">PL Digital</option>
            <option value="BL_DIGITAL">BL Digital</option>
          </select>
          
          <Button variant="secondary" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Employee Name
                  <SortIcon column="name" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Segment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Today's Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out Time
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('present_days')}
              >
                <div className="flex items-center">
                  Present Days
                  <SortIcon column="present_days" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual Present
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance Rate
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('salary_current')}
              >
                <div className="flex items-center">
                  Monthly Salary
                  <SortIcon column="salary_current" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('netSalary')}
              >
                <div className="flex items-center">
                  Net Salary
                  <SortIcon column="netSalary" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedEmployees.map((employee, index) => (
              <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                    onClick={() => onEmployeeClick && onEmployeeClick(employee)}
                  >
                    {employee.first_name} {employee.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.emp_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.segment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={employee.todaysAttendance?.isPresent ? 'success' : 'danger'}>
                    {employee.todaysAttendance?.effectiveStatus || 'Absent'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.todaysAttendance?.in_time ? 
                    new Date(employee.todaysAttendance.in_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 
                    '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.todaysAttendance?.out_time ? 
                    new Date(employee.todaysAttendance.out_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 
                    '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.present_days || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.salaryData?.actualPresentDays || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.salaryData?.attendanceRate?.toFixed(1) || 0}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(employee.salary_current)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(employee.salaryData?.netSalary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No employees found matching your criteria.</p>
        </div>
      )}
    </Card>
  )
}

export default AttendanceTable