# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React frontend application for an Employee Attendance Management Dashboard. The project connects to a Supabase backend with `profile` and `attendance` tables to track employee attendance and calculate monthly salaries.

## Project Status

**Current State**: ✅ **COMPLETED** - Full frontend application implemented and ready for use.

### Implemented Features:
- ✅ Complete React 18 + Vite setup with Tailwind CSS
- ✅ Supabase integration with real-time data fetching
- ✅ Dashboard with summary cards showing key metrics
- ✅ Interactive data table with search, filter, and export functionality
- ✅ Charts and visualizations (attendance trends, segment analysis, status distribution)
- ✅ Salary calculation logic with deduction rules
- ✅ Responsive design for all screen sizes
- ✅ Real-time attendance tracking with 30-second refresh
- ✅ Month navigation for historical data
- ✅ Export to CSV functionality
- ✅ Loading states and error handling
- ✅ Clean, maintainable code structure

## Technology Stack (Implemented)

- **Framework**: React 18 with hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query + useState/useReducer
- **Charts**: Recharts or Chart.js
- **Data Tables**: React Table or TanStack Table
- **Date Handling**: Day.js or date-fns
- **Backend**: Supabase (Project ID: vxcdvuekhfdkccjhbrhz)

## Database Schema

### Profile Table
- Employee information including name, role, segment, salary, and active status
- Key field: `present_today` (boolean) for real-time presence tracking

### Attendance Table
- Daily attendance records with in/out times, status, and total minutes
- Links to profile table via `employee_id`

## Key Business Logic

### Salary Calculation Formula
```
Net Salary = (Actual Present Days × Monthly Salary) ÷ Actual Working Days

Where:
- Actual Working Days = Total Days - Sundays - Holidays
- Actual Present Days = Present Days - Deductions

Deduction Rules:
- 3 Late = 1 Absent
- 2 Half Day = 1 Absent
```

### Core Functions to Implement
```javascript
// Date calculations
calculateWorkingDays(year, month)
getHolidaysForMonth(year, month)

// Attendance calculations
calculateActualPresentDays(attendanceRecords)
calculateAttendanceRate(presentDays, totalDays)

// Salary calculations
calculateNetSalary(actualPresentDays, monthlySalary, workingDays)
calculateSalaryDeductions(lateDays, halfDays, dailySalary)
```

## Planned Project Structure
```
src/
├── components/
│   ├── Dashboard/
│   │   ├── AttendanceSummary.jsx
│   │   ├── AttendanceTable.jsx
│   │   ├── AttendanceCharts.jsx
│   │   ├── SalaryCalculator.jsx
│   │   └── FilterPanel.jsx
│   ├── Layout/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── UI/
│       ├── Card.jsx
│       ├── Button.jsx
│       ├── Badge.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useAttendance.js
│   ├── useEmployees.js
│   └── useSalaryCalculation.js
├── services/
│   ├── supabase.js
│   └── calculations.js
├── utils/
│   ├── dateHelpers.js
│   ├── salaryCalculations.js
│   └── constants.js
└── App.jsx
```

## Environment Variables Required
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PROJECT_ID=vxcdvuekhfdkccjhbrhz
```

## Key Features to Implement

1. **Dashboard Overview**: Summary cards showing total employees, present today, attendance rate, salary metrics
2. **Data Table**: Employee attendance records with sorting, filtering, and pagination
3. **Charts**: Visual representation of attendance trends and salary distributions
4. **Salary Calculations**: Real-time salary calculations based on attendance data
5. **Filters**: Date range, department, employee search, status filtering
6. **Export**: Excel/PDF export functionality for payroll processing

## Performance Requirements
- Initial page load < 3 seconds
- Data table rendering < 1 second
- Pagination for 50-100 records per page
- Real-time updates every 30 seconds
- Virtualization for 500+ records

## Access Control
- Admin-only access (role = admin)
- Supabase RLS implementation required
- Environment variables for sensitive data

## MCP Servers Available
- **supabase**: Direct Supabase integration
- **browsertool**: Browser automation tools
- **context7**: Context management

## Development Commands

Since this is a new project, you'll need to:
1. Initialize with `npm create vite@latest . -- --template react`
2. Install dependencies: `npm install`
3. Set up Supabase client and environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Testing Strategy
- Unit tests for salary calculation functions
- Integration tests for Supabase data fetching
- Component rendering tests
- Real-time update functionality tests