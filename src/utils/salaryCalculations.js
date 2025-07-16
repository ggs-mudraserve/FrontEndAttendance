import { DEDUCTION_RULES } from './constants'
import { getWorkingDays } from './dateHelpers'

export const calculateActualPresentDays = (presentDays, lateDays, halfDays) => {
  const lateDeductions = Math.floor(lateDays / DEDUCTION_RULES.LATE_TO_ABSENT)
  const halfDayDeductions = Math.floor(halfDays / DEDUCTION_RULES.HALF_DAY_TO_ABSENT)
  
  return Math.max(0, presentDays - lateDeductions - halfDayDeductions)
}

export const calculateNetSalary = (actualPresentDays, monthlySalary, workingDays) => {
  if (!monthlySalary || !workingDays) return 0
  
  return (actualPresentDays * monthlySalary) / workingDays
}

export const calculateAttendanceRate = (presentDays, totalDays) => {
  if (!totalDays) return 0
  return (presentDays / totalDays) * 100
}

export const calculateSalaryDeductions = (lateDays, halfDays, monthlySalary, workingDays) => {
  const dailySalary = monthlySalary / workingDays
  
  const lateDeductions = Math.floor(lateDays / DEDUCTION_RULES.LATE_TO_ABSENT)
  const halfDayDeductions = Math.floor(halfDays / DEDUCTION_RULES.HALF_DAY_TO_ABSENT)
  
  return (lateDeductions + halfDayDeductions) * dailySalary
}

export const getEmployeeSalaryData = (employee, month, year) => {
  const {
    present_days = 0,
    late_days = 0,
    half_days = 0,
    salary_current = 0
  } = employee
  
  const workingDays = getWorkingDays(month, year)
  const actualPresentDays = calculateActualPresentDays(present_days, late_days, half_days)
  const netSalary = calculateNetSalary(actualPresentDays, salary_current, workingDays)
  const deductions = calculateSalaryDeductions(late_days, half_days, salary_current, workingDays)
  const attendanceRate = calculateAttendanceRate(present_days, workingDays)
  
  return {
    workingDays,
    actualPresentDays,
    netSalary,
    deductions,
    attendanceRate,
    dailySalary: salary_current / workingDays
  }
}

export const getTotalSalaryMetrics = (employees, month, year) => {
  const workingDays = getWorkingDays(month, year)
  
  let totalMonthlySalary = 0
  let totalNetSalary = 0
  let totalDeductions = 0
  let totalPresentDays = 0
  let totalEmployees = employees.length
  
  employees.forEach(employee => {
    const salaryData = getEmployeeSalaryData(employee, month, year)
    
    totalMonthlySalary += employee.salary_current || 0
    totalNetSalary += salaryData.netSalary
    totalDeductions += salaryData.deductions
    totalPresentDays += employee.present_days || 0
  })
  
  return {
    totalMonthlySalary,
    totalNetSalary,
    totalDeductions,
    averageSalary: totalEmployees > 0 ? totalMonthlySalary / totalEmployees : 0,
    overallAttendanceRate: totalEmployees > 0 ? (totalPresentDays / (totalEmployees * workingDays)) * 100 : 0
  }
}