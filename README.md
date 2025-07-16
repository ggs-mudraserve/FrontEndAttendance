# Employee Attendance Dashboard

A comprehensive React frontend application for managing employee attendance records with integrated salary calculations and real-time analytics.

## Features

- **Real-time Dashboard**: Live attendance tracking with auto-refreshing present count
- **Salary Calculations**: Automated salary calculations based on attendance with deduction rules
- **Data Visualization**: Interactive charts showing attendance trends and analytics
- **Employee Management**: Complete employee data with attendance history
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Export Functionality**: Export attendance reports to CSV

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Date Handling**: Day.js

## Database Schema

### Profile Table
- Employee information including name, role, segment, salary, and active status
- Key field: `present_today` (boolean) for real-time presence tracking

### Attendance Table
- Daily attendance records with in/out times, status, and total minutes
- Links to profile table via `employee_id`

## Business Logic

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

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PROJECT_ID=your_project_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features

### Dashboard Overview
- Total employees count
- Present today with percentage
- Monthly attendance rate
- Salary budget and payouts
- Deduction tracking

### Data Table
- Sortable employee records
- Search and filter functionality
- Export to CSV
- Responsive design

### Charts & Analytics
- Daily attendance trends
- Segment-wise analysis
- Status distribution
- Salary vs attendance correlation

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── AttendanceSummary.jsx
│   │   ├── AttendanceTable.jsx
│   │   └── AttendanceCharts.jsx
│   ├── Layout/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── UI/
│       ├── Card.jsx
│       ├── Button.jsx
│       ├── Badge.jsx
│       └── LoadingSpinner.jsx
├── hooks/
│   ├── useAttendance.js
│   ├── useEmployees.js
│   └── useSalaryCalculation.js
├── services/
│   └── supabase.js
├── utils/
│   ├── dateHelpers.js
│   ├── salaryCalculations.js
│   └── constants.js
└── App.jsx
```

## Configuration

The application uses Supabase for data storage and real-time updates. Make sure to:

1. Set up your Supabase project
2. Create the required tables (profile, attendance)
3. Configure Row Level Security (RLS) policies
4. Update environment variables

## Performance Features

- Optimized queries with React Query caching
- Virtualization for large datasets
- Debounced search functionality
- Real-time updates every 30 seconds
- Responsive image loading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.