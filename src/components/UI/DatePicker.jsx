import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const DatePicker = ({ 
  selectedDate, 
  onDateChange, 
  className = '', 
  showNavigationButtons = true,
  maxDate = new Date(),
  minDate = null,
  ...props 
}) => {
  const formatDateForInput = (date) => {
    if (!date) return ''
    if (typeof date === 'string') return date
    return new Date(date).toISOString().split('T')[0]
  }

  const handleDateChange = (e) => {
    const value = e.target.value
    if (value && onDateChange) {
      onDateChange(value)
    }
  }

  const navigateDate = (direction) => {
    if (!selectedDate) return
    
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    
    // Check date bounds
    if (maxDate && newDate > maxDate) return
    if (minDate && newDate < minDate) return
    
    onDateChange(formatDateForInput(newDate))
  }

  const isNavigationDisabled = (direction) => {
    if (!selectedDate) return true
    
    const currentDate = new Date(selectedDate)
    const testDate = new Date(currentDate)
    
    if (direction === 'prev') {
      testDate.setDate(currentDate.getDate() - 1)
      return minDate && testDate < minDate
    } else {
      testDate.setDate(currentDate.getDate() + 1)
      return maxDate && testDate > maxDate
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {showNavigationButtons && (
        <button
          onClick={() => navigateDate('prev')}
          disabled={isNavigationDisabled('prev')}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      
      <div className="relative flex items-center">
        <Calendar size={16} className="absolute left-3 text-gray-400" />
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          max={formatDateForInput(maxDate)}
          min={formatDateForInput(minDate)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {showNavigationButtons && (
        <button
          onClick={() => navigateDate('next')}
          disabled={isNavigationDisabled('next')}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next day"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

export default DatePicker