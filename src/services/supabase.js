import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Check if user has admin role
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) throw profileError
      
      if (profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin role required.')
      }
    }
    
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

export const getCurrentUserProfile = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Get current user profile error:', error)
    throw error
  }
}

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

export const fetchAttendanceByDate = async (selectedDate) => {
  try {
    console.log('Fetching attendance records for date:', selectedDate)
    
    // First, get all active employees
    const employees = await fetchEmployees()
    console.log('Found', employees.length, 'active employees')
    
    // Then, get attendance records for the specific date
    const { data: attendanceData, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', selectedDate)
    
    if (error) {
      console.error('Error fetching attendance records by date:', error)
      throw error
    }
    
    console.log('Raw attendance data from database:', attendanceData)
    console.log('Number of attendance records found:', attendanceData?.length || 0)
    
    // Combine employees with their attendance data
    const processedAttendance = employees.map(employee => {
      // Find attendance record for this employee on the selected date
      const attendanceRecord = attendanceData?.find(record => record.employee_id === employee.id)
      
      let isPresent = false
      let effectiveStatus = 'Absent'
      
      if (attendanceRecord) {
        const hasStatus = attendanceRecord.status && attendanceRecord.status !== 'Absent'
        const hasInTime = attendanceRecord.in_time !== null
        isPresent = hasStatus || (!attendanceRecord.status && hasInTime)
        
        effectiveStatus = attendanceRecord.status || (hasInTime ? 'Present' : 'Absent')
      }
      
      return {
        employee_id: employee.id,
        attendance_date: selectedDate,
        in_time: attendanceRecord?.in_time || null,
        out_time: attendanceRecord?.out_time || null,
        status: attendanceRecord?.status || null,
        total_minutes: attendanceRecord?.total_minutes || null,
        isPresent,
        effectiveStatus,
        profile: employee
      }
    })
    
    console.log('Processed attendance records:', processedAttendance.length, 'records')
    console.log('Sample processed record:', processedAttendance[0])
    
    return processedAttendance
  } catch (err) {
    console.error('fetchAttendanceByDate error:', err)
    throw err
  }
}

export const fetchAttendanceByDateRange = async (startDate, endDate) => {
  try {
    console.log('Fetching attendance records for date range:', startDate, 'to', endDate)
    
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
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .eq('profile.is_active', true)
      .order('attendance_date', { ascending: false })
      .order('profile.first_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching attendance records by date range:', error)
      throw error
    }
    
    // Process attendance records
    const processedAttendance = data?.map(record => {
      const hasStatus = record.status && record.status !== 'Absent'
      const hasInTime = record.in_time !== null
      const isPresent = hasStatus || (!record.status && hasInTime)
      
      let effectiveStatus = record.status
      if (!record.status && hasInTime) {
        effectiveStatus = 'Present'
      }
      
      return {
        ...record,
        isPresent,
        effectiveStatus,
        profile: record.profile
      }
    }) || []
    
    console.log('Attendance records by date range processed:', processedAttendance.length, 'records')
    return processedAttendance
  } catch (err) {
    console.error('fetchAttendanceByDateRange error:', err)
    throw err
  }
}