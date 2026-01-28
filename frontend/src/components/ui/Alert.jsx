import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'

export default function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  }

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }

  const IconComponent = icons[type]

  return (
    <div className={`${types[type]} border-l-4 p-4 rounded-r-lg flex items-center gap-3`}>
      <IconComponent className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
