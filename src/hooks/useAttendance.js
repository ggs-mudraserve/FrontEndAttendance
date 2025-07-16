import { useQuery } from '@tanstack/react-query'
import { fetchAttendanceRecords, fetchEmployeeAttendanceSummary, getTodaysPresentCount, getTodaysAttendance } from '../services/supabase'

export const useAttendanceRecords = (month, year) => {
  return useQuery({
    queryKey: ['attendance', month, year],
    queryFn: () => fetchAttendanceRecords(month, year),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!month && !!year,
  })
}

export const useEmployeeAttendanceSummary = (month, year) => {
  return useQuery({
    queryKey: ['attendance-summary', month, year],
    queryFn: () => fetchEmployeeAttendanceSummary(month, year),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!month && !!year,
  })
}

export const useTodaysPresentCount = () => {
  return useQuery({
    queryKey: ['todays-present'],
    queryFn: getTodaysPresentCount,
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  })
}

export const useTodaysAttendance = () => {
  return useQuery({
    queryKey: ['todays-attendance'],
    queryFn: getTodaysAttendance,
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  })
}