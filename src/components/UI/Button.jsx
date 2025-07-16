
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button 
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button