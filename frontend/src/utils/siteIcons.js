import {
  // Dental Service Icons
  SparklesIcon,
  SunIcon,
  WrenchScrewdriverIcon,
  WrenchIcon,
  ArchiveBoxXMarkIcon,
  CubeIcon,
  AcademicCapIcon,
  FaceSmileIcon,
  DocumentMagnifyingGlassIcon,
  ViewfinderCircleIcon,
  UserCircleIcon,
  HeartIcon,
  ExclamationCircleIcon,

  // Contact & General Icons
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarIcon,

  // Admin Panel Icons
  CalendarIcon as CalendarIconSolid,
  UserGroupIcon,
  UsersIcon,
  UserIcon,

  // Alert/Status Icons
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,

  // Solid Icons for colored backgrounds
  SparklesIcon as SparklesSolidIcon,
  SunIcon as SunSolidIcon,
  WrenchScrewdriverIcon as WrenchScrewdriverSolidIcon,
  WrenchIcon as WrenchSolidIcon,
  CubeIcon as CubeSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon,
  FaceSmileIcon as FaceSmileSolidIcon,
  HeartIcon as HeartSolidIcon,
  ExclamationCircleIcon as ExclamationCircleSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  InformationCircleIcon as InformationCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  MapPinIcon as MapPinSolidIcon,
  PhoneIcon as PhoneSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon
} from '@heroicons/react/24/solid'

import {
  SparklesIcon as SparklesOutlineIcon,
  SunIcon as SunOutlineIcon,
  WrenchScrewdriverIcon as WrenchScrewdriverOutlineIcon,
  WrenchIcon as WrenchOutlineIcon,
  CubeIcon as CubeOutlineIcon,
  AcademicCapIcon as AcademicCapOutlineIcon,
  FaceSmileIcon as FaceSmileOutlineIcon,
  HeartIcon as HeartOutlineIcon,
  ExclamationCircleIcon as ExclamationCircleOutlineIcon,
  MapPinIcon as MapPinOutlineIcon,
  PhoneIcon as PhoneOutlineIcon,
  EnvelopeIcon as EnvelopeOutlineIcon,
  CalendarIcon as CalendarOutlineIcon,
  ClockIcon as ClockOutlineIcon,
  UserGroupIcon as UserGroupOutlineIcon,
  UserIcon as UserOutlineIcon
} from '@heroicons/react/24/outline'

// Dental service icon mapping (same as before)
export const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase()

  if (name.includes('cleaning') || name.includes('hygiene')) {
    return SparklesSolidIcon
  }
  if (name.includes('whitening') || name.includes('bleach')) {
    return SunSolidIcon
  }
  if (name.includes('root') || name.includes('canal')) {
    return WrenchScrewdriverSolidIcon
  }
  if (name.includes('implant')) {
    return WrenchSolidIcon
  }
  if (name.includes('extraction') || name.includes('removal')) {
    return ArchiveBoxXMarkIcon
  }
  if (name.includes('filling') || name.includes('cavity')) {
    return CubeSolidIcon
  }
  if (name.includes('crown') || name.includes('cap')) {
    return AcademicCapSolidIcon
  }
  if (name.includes('braces') || name.includes('orthodontic')) {
    return FaceSmileSolidIcon
  }
  if (name.includes('checkup') || name.includes('examination')) {
    return DocumentMagnifyingGlassIcon
  }
  if (name.includes('x-ray') || name.includes('xray') || name.includes('radiography')) {
    return ViewfinderCircleIcon
  }
  if (name.includes('dentures')) {
    return UserCircleIcon
  }
  if (name.includes('gum') || name.includes('periodontal')) {
    return HeartSolidIcon
  }
  if (name.includes('emergency')) {
    return ExclamationCircleSolidIcon
  }
  if (name.includes('consultation') || name.includes('advice')) {
    return ChatBubbleLeftRightIcon
  }

  // Default dental icon
  return SparklesSolidIcon
}

// Color mapping for service icons (same as before)
export const getServiceColor = (serviceName) => {
  const name = serviceName.toLowerCase()

  if (name.includes('cleaning') || name.includes('hygiene')) {
    return 'text-blue-500 bg-blue-50'
  }
  if (name.includes('whitening') || name.includes('bleach')) {
    return 'text-yellow-500 bg-yellow-50'
  }
  if (name.includes('root') || name.includes('canal')) {
    return 'text-red-500 bg-red-50'
  }
  if (name.includes('implant')) {
    return 'text-purple-500 bg-purple-50'
  }
  if (name.includes('extraction') || name.includes('removal')) {
    return 'text-orange-500 bg-orange-50'
  }
  if (name.includes('filling') || name.includes('cavity')) {
    return 'text-green-500 bg-green-50'
  }
  if (name.includes('crown') || name.includes('cap')) {
    return 'text-amber-500 bg-amber-50'
  }
  if (name.includes('braces') || name.includes('orthodontic')) {
    return 'text-pink-500 bg-pink-50'
  }

  return 'text-primary bg-light'
}

// Alert icons mapping
export const getAlertIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleSolidIcon
    case 'error':
      return XCircleSolidIcon
    case 'warning':
      return ExclamationTriangleSolidIcon
    case 'info':
    default:
      return InformationCircleSolidIcon
  }
}

// General site icons
export const SiteIcons = {
  // Contact icons
  location: MapPinSolidIcon,
  phone: PhoneSolidIcon,
  email: EnvelopeSolidIcon,
  clock: ClockSolidIcon,
  calendar: CalendarSolidIcon,

  // Feature icons
  doctor: UserIcon,
  equipment: WrenchScrewdriverSolidIcon,
  affordable: CurrencyDollarIcon,
  experience: AcademicCapSolidIcon,
  excellence: SparklesSolidIcon,
  integrity: ShieldCheckIcon,
  education: BookOpenIcon,

  // Tab icons
  appointments: CalendarIconSolid,
  services: SparklesSolidIcon,
  patients: UsersIcon,

  // Status icons
  check: CheckIcon,
  cross: XMarkIcon,
  info: InformationCircleIcon
}