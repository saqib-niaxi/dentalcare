export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-gray-700 dark:text-gray-200 font-medium mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-field dark:bg-luxury-slate dark:border-white/15 dark:text-gray-100 dark:placeholder-gray-500 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
          disabled ? 'bg-gray-100 dark:bg-luxury-black cursor-not-allowed' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-gray-700 dark:text-gray-200 font-medium mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input-field dark:bg-luxury-slate dark:border-white/15 dark:text-gray-100 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
          disabled ? 'bg-gray-100 dark:bg-luxury-black cursor-not-allowed' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-gray-700 dark:text-gray-200 font-medium mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`input-field resize-none dark:bg-luxury-slate dark:border-white/15 dark:text-gray-100 dark:placeholder-gray-500 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
          disabled ? 'bg-gray-100 dark:bg-luxury-black cursor-not-allowed' : ''
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
