import { Users, UserCheck, TrendingUp, DollarSign, Calculator, AlertTriangle } from 'lucide-react'
import Card from '../UI/Card'
import LoadingSpinner from '../UI/LoadingSpinner'

const SummaryCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

const AttendanceSummary = ({ 
  employees, 
  todaysPresentCount, 
  salaryMetrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-24">
            <LoadingSpinner />
          </Card>
        ))}
      </div>
    )
  }

  const totalEmployees = employees?.length || 0
  const presentToday = todaysPresentCount || 0
  const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const summaryData = [
    {
      icon: Users,
      title: 'Total Employees',
      value: totalEmployees,
      subtitle: 'Active employees',
      color: 'blue'
    },
    {
      icon: UserCheck,
      title: 'Present Today',
      value: presentToday,
      subtitle: `${attendanceRate}% attendance`,
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Attendance Rate',
      value: `${salaryMetrics?.overallAttendanceRate?.toFixed(1) || 0}%`,
      subtitle: 'This month',
      color: 'yellow'
    },
    {
      icon: DollarSign,
      title: 'Total Salary Budget',
      value: formatCurrency(salaryMetrics?.totalMonthlySalary),
      subtitle: 'Monthly budget',
      color: 'purple'
    },
    {
      icon: Calculator,
      title: 'Net Salary Payout',
      value: formatCurrency(salaryMetrics?.totalNetSalary),
      subtitle: 'After deductions',
      color: 'green'
    },
    {
      icon: AlertTriangle,
      title: 'Deductions',
      value: formatCurrency(salaryMetrics?.totalDeductions),
      subtitle: 'Late & absent',
      color: 'red'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {summaryData.map((item, index) => (
        <SummaryCard key={index} {...item} />
      ))}
    </div>
  )
}

export default AttendanceSummary