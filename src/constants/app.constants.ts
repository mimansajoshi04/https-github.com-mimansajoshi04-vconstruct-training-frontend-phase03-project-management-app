export const STORAGE_KEYS = {
  USER: 'user',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  TESTER: 'tester',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  OVERDUE: 'overdue',
} as const;

export const ROUTE_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_PROJECTS: '/dashboard/projects',
  DASHBOARD_USERS: '/dashboard/users',
} as const;

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 1;

export const VALIDATION_MESSAGES = {
  INVALID_NAME: 'Invalid Name',
  INVALID_PASSWORD_LENGTH: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_START_DATE: 'Invalid start date',
} as const;

export const ERROR_TITLES = {
  LOGIN_FAILED: 'Login Failed',
  REGISTRATION_FAILED: 'Registration Failed',
} as const;
