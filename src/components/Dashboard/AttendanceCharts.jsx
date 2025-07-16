import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import Card from '../UI/Card'

const AttendanceCharts = ({ employees, attendanceRecords, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="h-80">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Prepare data for charts
  const prepareAttendanceTrendData = () => {
    if (!attendanceRecords) return []
    
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    const trendData = {}
    
    attendanceRecords.forEach(record => {
      // Skip today's data as status is not finalized until 8 PM IST
      if (record.attendance_date === today) {
        return
      }
      
      const date = new Date(record.attendance_date).toLocaleDateString()
      if (!trendData[date]) {
        trendData[date] = {
          date,
          Present: 0,
          Absent: 0,
          Late: 0,
          'Half Day': 0
        }
      }
      
      // Only count records with actual status (not NULL)
      if (record.status) {
        trendData[date][record.status] += 1
      }
    })
    
    return Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const prepareSegmentData = () => {
    if (!employees) return []
    
    const segmentData = {}
    
    employees.forEach(employee => {
      const segment = employee.segment || 'Unknown'
      if (!segmentData[segment]) {
        segmentData[segment] = {
          segment,
          totalEmployees: 0,
          presentToday: 0,
          presentDays: 0,
          totalSalary: 0
        }
      }
      
      segmentData[segment].totalEmployees += 1
      segmentData[segment].presentToday += employee.present_today ? 1 : 0
      segmentData[segment].presentDays += employee.present_days || 0
      segmentData[segment].totalSalary += employee.salary_current || 0
    })
    
    return Object.values(segmentData)
  }

  const prepareStatusDistribution = () => {
    if (!employees) return []
    
    const statusData = {
      'Present Today': 0,
      'Absent Today': 0
    }
    
    employees.forEach(employee => {
      if (employee.present_today) {
        statusData['Present Today'] += 1
      } else {
        statusData['Absent Today'] += 1
      }
    })
    
    return Object.entries(statusData).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / employees.length) * 100).toFixed(1)
    }))
  }

  const prepareSalaryData = () => {
    if (!employees) return []
    
    return employees
      .filter(emp => emp.salaryData)
      .map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        empCode: emp.emp_code,
        monthlySalary: emp.salary_current || 0,
        netSalary: emp.salaryData?.netSalary || 0,
        deductions: emp.salaryData?.deductions || 0,
        attendanceRate: emp.salaryData?.attendanceRate || 0
      }))
      .sort((a, b) => b.netSalary - a.netSalary)
      .slice(0, 10) // Top 10 employees
  }

  const trendData = prepareAttendanceTrendData()
  const segmentData = prepareSegmentData()
  const statusDistribution = prepareStatusDistribution()
  const salaryData = prepareSalaryData()

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6']

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Trend Chart */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Daily Attendance Trend (Up to Previous Day)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Present" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="Late" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Half Day" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Segment-wise Attendance */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Segment-wise Attendance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={segmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalEmployees" fill="#3B82F6" name="Total Employees" />
            <Bar dataKey="presentToday" fill="#10B981" name="Present Today" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Status Distribution Pie Chart */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Today's Attendance Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percentage }) => `${status}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Salary vs Attendance Chart */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Top 10 - Salary vs Attendance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salaryData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="empCode" width={60} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'netSalary' || name === 'monthlySalary' ? formatCurrency(value) : value,
                name === 'netSalary' ? 'Net Salary' : 
                name === 'monthlySalary' ? 'Monthly Salary' : name
              ]}
            />
            <Legend />
            <Bar dataKey="monthlySalary" fill="#94A3B8" name="Monthly Salary" />
            <Bar dataKey="netSalary" fill="#10B981" name="Net Salary" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default AttendanceCharts