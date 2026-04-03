export const ErrorCode = {
  SUCCESS: 200,
  BAD_REQUEST: 1000,
  UNAUTHORIZED: 1001,
  FORBIDDEN: 1002,
  NOT_FOUND: 1003,
  CONFLICT: 1004,
  VALIDATION_ERROR: 1005,
  DUPLICATE_ENTRY: 2001,
  RECORD_NOT_FOUND: 2002,
  HAS_RELATED_DATA: 2003,
  INVALID_OPERATION: 2004,
  INVALID_TOKEN: 3001,
  TOKEN_EXPIRED: 3002,
  INVALID_CREDENTIALS: 3003,
  ACCOUNT_LOCKED: 3004,
  INVALID_EMAIL_FORMAT: 4001,
  EMAIL_NOT_FOUND: 4003,
  RATE_LIMIT_EXCEEDED: 4004,
  INVALID_CODE: 4005,
  CODE_EXPIRED: 4006,
  INTERNAL_ERROR: 5000,
  DATABASE_ERROR: 5001,
  REDIS_ERROR: 5002,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

export const RedisKeys = {
  DICT_PREFIX: 'dict:',
  RESET_CODE: 'reset:code:',
  RESET_DAILY: 'reset:daily:',
  RESET_LAST: 'reset:last:',
  VERIFY_CODE: 'verify:code:',
  USER_PROFILE: (id: number) => `user:profile:${id}`,
  USER_ROLES: (id: number) => `user:roles:${id}`,
  CONFIG: (key: string) => `config:${key}`,
} as const;

export const JwtDefaults = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
} as const;

export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

export enum UserType {
  ADMIN = 1,
  USER = 2,
}

export enum DictStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export enum IsDefault {
  NO = 0,
  YES = 1,
}

export enum PermissionType {
  MENU = 1,
  BUTTON = 2,
  API = 3,
}
