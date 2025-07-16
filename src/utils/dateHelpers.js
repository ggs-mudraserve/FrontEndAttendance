import dayjs from 'dayjs'
import { HOLIDAYS_2024 } from './constants'

export const getCurrentMonth = () => dayjs().month() + 1
export const getCurrentYear = () => dayjs().year()

export const getMonthName = (month) => {
  return dayjs().month(month - 1).format('MMMM')
}

export const getDaysInMonth = (month, year) => {
  return dayjs(`${year}-${month}`).daysInMonth()
}

export const getWorkingDays = (month, year) => {
  const daysInMonth = getDaysInMonth(month, year)
  const startDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`)
  
  let workingDays = 0
  
  for (let i = 0; i < daysInMonth; i++) {
    const currentDate = startDate.add(i, 'day')
    const dayOfWeek = currentDate.day()
    const dateString = currentDate.format('YYYY-MM-DD')
    
    // Skip Sundays (0) and holidays
    if (dayOfWeek !== 0 && !HOLIDAYS_2024.includes(dateString)) {
      workingDays++
    }
  }
  
  return workingDays
}

export const getSundaysInMonth = (month, year) => {
  const daysInMonth = getDaysInMonth(month, year)
  const startDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`)
  
  let sundays = 0
  
  for (let i = 0; i < daysInMonth; i++) {
    const currentDate = startDate.add(i, 'day')
    if (currentDate.day() === 0) {
      sundays++
    }
  }
  
  return sundays
}

export const getHolidaysInMonth = (month, year) => {
  const monthStart = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`)
  const monthEnd = monthStart.endOf('month')
  
  return HOLIDAYS_2024.filter(holiday => {
    const holidayDate = dayjs(holiday)
    return holidayDate.isBetween(monthStart, monthEnd, 'day', '[]')
  }).length
}

export const formatTime = (timeString) => {
  if (!timeString) return '-'
  return dayjs(timeString).format('h:mm A')
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('DD MMM YYYY')
}

export const getTotalHours = (totalMinutes) => {
  if (!totalMinutes) return '0h 0m'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}h ${minutes}m`
}

// Alias for backwards compatibility
export const calculateWorkingDays = getWorkingDays