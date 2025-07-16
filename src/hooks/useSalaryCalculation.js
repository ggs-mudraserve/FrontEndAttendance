import { useMemo } from 'react'
import { getEmployeeSalaryData, getTotalSalaryMetrics } from '../utils/salaryCalculations'

export const useSalaryCalculation = (employees, month, year) => {
  return useMemo(() => {
    if (!employees || !month || !year) return null
    
    const employeesWithSalary = employees.map(employee => ({
      ...employee,
      salaryData: getEmployeeSalaryData(employee, month, year)
    }))
    
    const totalMetrics = getTotalSalaryMetrics(employees, month, year)
    
    return {
      employeesWithSalary,
      totalMetrics
    }
  }, [employees, month, year])
}