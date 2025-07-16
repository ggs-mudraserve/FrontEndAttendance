import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helpers
export const fetchEmployees = async () => {
  try {
    console.log('Fetching employees...')
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('is_active', true)
      .order('first_name')
    
    if (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
    
    console.log('Employees fetched successfully:', data?.length)
    return data
  } catch (err) {
    console.error('fetchEmployees error:', err)
    throw err
  }
}

export const fetchAttendanceRecords = async (month, year) => {
  try {
    console.log('Fetching attendance records for:', month, year)
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
    
    console.log('Date range:', startDate, 'to', endDate)
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profile:employee_id (
          id,
          first_name,
          last_name,
          emp_code,
          role,
          segment,
          salary_current
        )
      `)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching attendance records:', error)
      throw error
    }
    
    console.log('Attendance records fetched successfully:', data?.length)
    return data
  } catch (err) {
    console.error('fetchAttendanceRecords error:', err)
    throw err
  }
}

export const fetchEmployeeAttendanceSummary = async (month, year) => {
  try {
    console.log('Fetching employee attendance summary for:', month, year)
    
    // Get monthly attendance summary with employee details
    const { data, error } = await supabase
      .rpc('get_employee_attendance_summary', {
        target_month: month,
        target_year: year
      })
    
    if (error) {
      console.log('RPC function not found, using fallback method:', error.message)
      
      // Fallback to manual calculation if RPC doesn't exist
      const employees = await fetchEmployees()
      const attendance = await fetchAttendanceRecords(month, year)
      const todaysAttendance = await getTodaysAttendance()
      
      console.log('Processing', employees.length, 'employees with', attendance.length, 'attendance records')
      
      const result = employees.map(employee => {
        const empAttendance = attendance.filter(a => a.employee_id === employee.id)
        const empTodaysAttendance = todaysAttendance.find(a => a.employee_id === employee.id)
        
        const presentDays = empAttendance.filter(a => a.status === 'Present').length
        const lateDays = empAttendance.filter(a => a.status === 'Late').length
        const halfDays = empAttendance.filter(a => a.status === 'Half Day').length
        const absentDays = empAttendance.filter(a => a.status === 'Absent').length
        
        return {
          ...employee,
          present_days: presentDays,
          late_days: lateDays,
          half_days: halfDays,
          absent_days: absentDays,
          attendance_records: empAttendance,
          todaysAttendance: empTodaysAttendance
        }
      })
      
      console.log('Fallback calculation completed for', result.length, 'employees')
      return result
    }
    
    console.log('RPC function returned:', data?.length)
    return data
  } catch (err) {
    console.error('fetchEmployeeAttendanceSummary error:', err)
    throw err
  }
}

export const getTodaysAttendance = async () => {
  try {
    console.log('Fetching todays attendance...')
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profile:employee_id (
          id,
          first_name,
          last_name,
          emp_code,
          role,
          segment,
          salary_current,
          is_active
        )
      `)
      .eq('attendance_date', today)
      .eq('profile.is_active', true)
    
    if (error) {
      console.error('Error fetching todays attendance:', error)
      throw error
    }
    
    // Process attendance records to determine present status
    const processedAttendance = data?.map(record => {
      // Determine if present based on status or in_time
      const hasStatus = record.status && record.status !== 'Absent'
      const hasInTime = record.in_time !== null
      const isPresent = hasStatus || (!record.status && hasInTime)
      
      // Determine effective status for display
      let effectiveStatus = record.status
      if (!record.status && hasInTime) {
        effectiveStatus = 'Present' // Assume present if in_time exists but status is NULL
      }
      
      return {
        ...record,
        isPresent,
        effectiveStatus,
        profile: record.profile
      }
    }) || []
    
    console.log('Todays attendance processed:', processedAttendance.length, 'records')
    return processedAttendance
  } catch (err) {
    console.error('getTodaysAttendance error:', err)
    throw err
  }
}

export const getTodaysPresentCount = async () => {
  try {
    const todaysAttendance = await getTodaysAttendance()
    const presentCount = todaysAttendance.filter(record => record.isPresent).length
    
    console.log('Present today count:', presentCount, 'out of', todaysAttendance.length, 'total records')
    return presentCount
  } catch (err) {
    console.error('getTodaysPresentCount error:', err)
    throw err
  }
}