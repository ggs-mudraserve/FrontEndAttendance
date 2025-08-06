import React, { useState } from 'react'
import { Calendar, Download, X } from 'lucide-react'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)
import Button from '../UI/Button'
import { fetchAttendanceByDateRange, fetchEmployees } from '../../services/supabase'
import { calculateActualPresentDays, calculateNetSalary, calculateAttendanceRate } from '../../utils/salaryCalculations'
import { getWorkingDays } from '../../utils/dateHelpers'
import { DEDUCTION_RULES } from '../../utils/constants'

const DateRangeExport = ({ isOpen, onClose, employees }) => {
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExport = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Starting export for date range:', startDate, 'to', endDate)

      // Use passed employees data instead of fetching
      console.log('Using provided employees data:', employees?.length || 0)
      
      if (!employees || employees.length === 0) {
        throw new Error('No employees data available. Please wait for data to load.')
      }
      
      // Actually fetch attendance data for the selected date range
      console.log('Fetching attendance records for selected date range...')
      let attendanceRecords = []
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 10000)
        )
        
        const fetchPromise = fetchAttendanceByDateRange(startDate, endDate)
        attendanceRecords = await Promise.race([fetchPromise, timeoutPromise])
        
        console.log('Attendance records fetched successfully:', attendanceRecords?.length || 0)
        console.log('Sample record:', attendanceRecords[0])
      } catch (fetchError) {
        console.warn('Could not fetch attendance data, using fallback method:', fetchError.message)
        // If fetch fails, create a meaningful error message
        throw new Error(`Unable to fetch attendance data for ${startDate} to ${endDate}. ${fetchError.message}`)
      }
      
      // Process data for each employee with actual date range data
      const start = new Date(startDate)
      const end = new Date(endDate)
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      const workingDays = Math.ceil(totalDays * 26 / 30) // Approximate working days
      
      const processedData = employees.map(employee => {
        // Filter attendance records for this specific employee
        const employeeAttendanceRecords = attendanceRecords.filter(record => 
          record.employee_id === employee.id || 
          record.profile?.id === employee.id
        )
        
        console.log(`Processing ${employee.first_name} ${employee.last_name}: ${employeeAttendanceRecords.length} records found`)
        
        // Calculate actual attendance metrics from the fetched records
        const presentRecords = employeeAttendanceRecords.filter(record => 
          record.effectiveStatus === 'Present' || record.status === 'Present'
        )
        const lateRecords = employeeAttendanceRecords.filter(record => 
          record.effectiveStatus === 'Late' || record.status === 'Late'
        )
        const halfDayRecords = employeeAttendanceRecords.filter(record => 
          record.effectiveStatus === 'Half Day' || record.status === 'Half Day'
        )
        const noStatusRecords = employeeAttendanceRecords.filter(record => 
          record.effectiveStatus === 'No Status' || (!record.status && record.in_time)
        )
        
        const presentDays = presentRecords.length
        const lateDays = lateRecords.length
        const halfDays = halfDayRecords.length
        const noStatusDays = noStatusRecords.length
        const absentDays = totalDays - presentDays - lateDays - halfDays - noStatusDays
        
        // Use existing salary calculations if available
        const actualPresentDays = employee.salaryData?.actualPresentDays || calculateActualPresentDays(presentDays, lateDays, halfDays)
        const netSalary = employee.salaryData?.netSalary || calculateNetSalary(actualPresentDays, employee.salary_current || 0, workingDays)
        const attendanceRate = employee.salaryData?.attendanceRate || calculateAttendanceRate(presentDays, totalDays)
        
        // Build attendance by date using the fetched records
        const attendanceByDate = {}
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0]
          
          // Find actual attendance record for this specific date
          const attendanceRecord = employeeAttendanceRecords.find(record => {
            const recordDate = record.attendance_date 
            if (recordDate) {
              // Handle both date string formats
              const recordDateStr = recordDate.includes('T') 
                ? recordDate.split('T')[0] 
                : recordDate.split(' ')[0]
              return recordDateStr === dateStr
            }
            return false
          })
          
          if (attendanceRecord) {
            // Use actual attendance data
            attendanceByDate[dateStr] = {
              status: attendanceRecord.status || (attendanceRecord.in_time ? 'Present' : 'Absent'),
              inTime: attendanceRecord.in_time ? new Date(attendanceRecord.in_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : null,
              outTime: attendanceRecord.out_time ? new Date(attendanceRecord.out_time).toLocaleTimeString('en-US', {
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              }) : null
            }
          } else {
            // No data for this date
            attendanceByDate[dateStr] = {
              status: 'No Data',
              inTime: null,
              outTime: null
            }
          }
        }
        
        return {
          ...employee,
          presentDays,
          lateDays,
          halfDays,
          noStatusDays,
          absentDays,
          actualPresentDays,
          netSalary,
          attendanceRate,
          attendanceByDate
        }
      })
      
      // Generate CSV
      generateCSV(processedData, startDate, endDate)
      
    } catch (err) {
      console.error('Error exporting date range data:', err)
      let errorMessage = 'Failed to export data. Please try again.'
      
      if (err.message?.includes('No employees found')) {
        errorMessage = 'No employees found. Please check your data connection.'
      } else if (err.message?.includes('Auth')) {
        errorMessage = 'Authentication error. Please try logging in again.'
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  const generateCSV = (data, start, end) => {
    // Generate date columns
    const dateColumns = []
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      dateColumns.push(d.toLocaleDateString('en-GB', options))
    }
    
    // Headers
    const headers = [
      'Employee Name',
      'Employee Code', 
      'Role',
      'Segment',
      'Monthly Salary',
      'Present Days',
      'Late Days',
      'Half Days',
      'No Status Days',
      ...dateColumns
    ]
    
    // Data rows
    const csvData = data.map(employee => {
      const dateValues = []
      const startDate = new Date(start)
      const endDate = new Date(end)
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const attendance = employee.attendanceByDate?.[dateStr]
        
        if (!attendance) {
          dateValues.push('No Data')
          continue
        }
        
        let cellValue = attendance.status || 'No Status'
        if (attendance.inTime) {
          cellValue += ` (${attendance.inTime}`
          if (attendance.outTime) {
            cellValue += ` - ${attendance.outTime}`
          }
          cellValue += ')'
        }
        dateValues.push(cellValue)
      }
      
      return [
        `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        employee.emp_code || '',
        employee.role || '',
        employee.segment || '',
        employee.salary_current || 0,
        employee.presentDays || 0,
        employee.lateDays || 0,
        employee.halfDays || 0,
        employee.noStatusDays || 0,
        ...dateValues
      ]
    })
    
    // Convert to CSV format with proper escaping
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => {
        // Handle null/undefined values
        const value = cell === null || cell === undefined ? '' : String(cell)
        // Escape double quotes by doubling them
        const escaped = value.replace(/"/g, '""')
        // Wrap in quotes
        return `"${escaped}"`
      }).join(','))
      .join('\n')
    
    // Add UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF'
    const finalContent = BOM + csvContent
    
    // Download file with proper MIME type
    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeStartDate = start.replace(/\//g, '-')
    const safeEndDate = end.replace(/\//g, '-')
    a.download = `attendance_report_${safeStartDate}_to_${safeEndDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    // Close modal after successful export
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Export Attendance Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={dayjs().format('YYYY-MM-DD')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateRangeExport