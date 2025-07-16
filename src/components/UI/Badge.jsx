import { STATUS_COLORS } from '../../utils/constants'

const Badge = ({ children, variant = 'info', className = '', ...props }) => {
  const baseClasses = 'badge'
  const variantClass = STATUS_COLORS[children] || `badge-${variant}`
  
  return (
    <span className={`${baseClasses} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  )
}

export default Badge