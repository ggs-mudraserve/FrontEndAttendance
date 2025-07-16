export const ROLES = {
  ADMIN: 'admin',
  BACKEND: 'backend',
  TEAM_LEADER: 'team_leader',
  AGENT: 'agent',
  SYSTEM: 'system',
  CHATBOT: 'chatbot'
}

export const SEGMENTS = {
  PL: 'PL',
  BL: 'BL',
  PL_DIGITAL: 'PL_DIGITAL',
  BL_DIGITAL: 'BL_DIGITAL'
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  HALF_DAY: 'Half Day'
}

export const STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'badge-success',
  [ATTENDANCE_STATUS.ABSENT]: 'badge-danger',
  [ATTENDANCE_STATUS.LATE]: 'badge-warning',
  [ATTENDANCE_STATUS.HALF_DAY]: 'badge-info'
}

export const DEDUCTION_RULES = {
  LATE_TO_ABSENT: 3, // 3 late = 1 absent
  HALF_DAY_TO_ABSENT: 2 // 2 half day = 1 absent
}

export const HOLIDAYS_2024 = [
  // Add Indian holidays for 2024
  '2024-01-26', // Republic Day
  '2024-03-08', // Holi
  '2024-03-29', // Good Friday
  '2024-08-15', // Independence Day
  '2024-10-02', // Gandhi Jayanti
  '2024-10-24', // Dussehra
  '2024-11-12', // Diwali
  '2024-12-25', // Christmas
]