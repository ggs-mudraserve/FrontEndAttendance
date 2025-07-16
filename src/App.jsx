import { useState } from 'react'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import AttendanceSummary from './components/Dashboard/AttendanceSummary'
import AttendanceTable from './components/Dashboard/AttendanceTable'
import AttendanceCharts from './components/Dashboard/AttendanceCharts'
import EmployeeAttendanceDetail from './components/Dashboard/EmployeeAttendanceDetail'
import { useEmployees } from './hooks/useEmployees'
import { useEmployeeAttendanceSummary, useTodaysPresentCount } from './hooks/useAttendance'
import { useSalaryCalculation } from './hooks/useSalaryCalculation'
import { getCurrentMonth, getCurrentYear, getMonthName } from './utils/dateHelpers'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Button from './components/UI/Button'

function App() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [currentYear, setCurrentYear] = useState(getCurrentYear())
  const [activeTab, setActiveTab] = useState('summary')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Fetch data
  const { data: employees, isLoading: employeesLoading } = useEmployees()
  const { data: attendanceSummary, isLoading: attendanceLoading } = useEmployeeAttendanceSummary(currentMonth, currentYear)
  const { data: todaysPresentCount, isLoading: presentCountLoading } = useTodaysPresentCount()

  // Calculate salary data
  const salaryData = useSalaryCalculation(attendanceSummary, currentMonth, currentYear)

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee)
  }

  const handleBackToList = () => {
    setSelectedEmployee(null)
  }

  const isLoading = employeesLoading || attendanceLoading || presentCountLoading

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Button variant="secondary" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
            </div>
            
            <Button variant="secondary" onClick={handleNextMonth}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Data Table
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'charts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Charts
            </button>
          </div>
        </div>

        {/* Summary Cards - Always visible */}
        <div className="mb-8">
          <AttendanceSummary
            employees={employees}
            todaysPresentCount={todaysPresentCount}
            salaryMetrics={salaryData?.totalMetrics}
            loading={isLoading}
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {selectedEmployee ? (
            <EmployeeAttendanceDetail
              employee={selectedEmployee}
              onBack={handleBackToList}
            />
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="grid grid-cols-1 gap-8">
                  <AttendanceCharts
                    employees={salaryData?.employeesWithSalary}
                    attendanceRecords={attendanceSummary?.flatMap(emp => emp.attendance_records || [])}
                    loading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'table' && (
                <AttendanceTable
                  employees={salaryData?.employeesWithSalary}
                  loading={isLoading}
                  onEmployeeClick={handleEmployeeClick}
                />
              )}

              {activeTab === 'charts' && (
                <AttendanceCharts
                  employees={salaryData?.employeesWithSalary}
                  attendanceRecords={attendanceSummary?.flatMap(emp => emp.attendance_records || [])}
                  loading={isLoading}
                />
              )}
            </>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-gray-600">Loading attendance data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !employees && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Unable to load data
              </h3>
              <p className="text-red-600">
                Please check your connection and try again.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App