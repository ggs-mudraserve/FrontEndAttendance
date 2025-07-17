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

// Date validation utilities
export const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = dayjs(dateString)
  return date.isValid()
}

export const isDateInPast = (dateString) => {
  if (!isValidDate(dateString)) return false
  const date = dayjs(dateString)
  const today = dayjs().startOf('day')
  return date.isBefore(today)
}

export const isDateToday = (dateString) => {
  if (!isValidDate(dateString)) return false
  const date = dayjs(dateString)
  const today = dayjs().startOf('day')
  return date.isSame(today, 'day')
}

export const isDateInFuture = (dateString) => {
  if (!isValidDate(dateString)) return false
  const date = dayjs(dateString)
  const today = dayjs().startOf('day')
  return date.isAfter(today)
}

export const formatDateForInput = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return ''
  const date = dayjs(dateString)
  
  if (isDateToday(dateString)) {
    return 'Today'
  }
  
  if (isDateInPast(dateString)) {
    const daysAgo = dayjs().diff(date, 'day')
    if (daysAgo === 1) return 'Yesterday'
    if (daysAgo <= 7) return `${daysAgo} days ago`
  }
  
  return date.format('DD MMM YYYY')
}

export const getDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return []
  
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const dates = []
  
  let current = start
  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  
  return dates
}

export const isWorkingDay = (dateString) => {
  if (!isValidDate(dateString)) return false
  
  const date = dayjs(dateString)
  const dayOfWeek = date.day()
  const dateStr = date.format('YYYY-MM-DD')
  
  // Skip Sundays (0) and holidays
  return dayOfWeek !== 0 && !HOLIDAYS_2024.includes(dateStr)
}