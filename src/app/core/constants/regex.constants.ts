/**
 * Centralized Regular Expression Patterns & Validation Helpers for Work-Sphere Forms & Pipes
 */
export const REGEX_PATTERNS = {
  /**
   * Standard corporate & personal email validation (e.g., hr.admin@nexacloud.io)
   */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  /**
   * Strong password: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
   */
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`])[A-Za-z\d@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`]{8,64}$/,

  /**
   * Indian mobile phone number (supports optional +91 / 91 prefix and spaces/hyphens)
   */
  PHONE_INDIA: /^(?:\+91[\s-]?|91[\s-]?|0)?([6-9]\d{4})[\s-]?(\d{5})$/,

  /**
   * International E.164 / general phone number (7 to 15 digits with optional +, spaces, parentheses, hyphens)
   */
  PHONE_INTERNATIONAL: /^\+?[0-9\s\-()]{7,20}$/,

  /**
   * 10-digit Indian phone capture groups ($1 = first 5 digits, $2 = last 5 digits)
   */
  PHONE_10_DIGIT_GROUPS: /^([6-9]\d{4})(\d{5})$/,

  /**
   * 12-digit 91-prefixed Indian phone capture groups ($1 = 91, $2 = first 5 digits, $3 = last 5 digits)
   */
  PHONE_91_12_DIGIT_GROUPS: /^(91)([6-9]\d{4})(\d{5})$/,

  /**
   * Matches any non-digit character (used for stripping formatting from phone numbers)
   */
  NON_DIGIT: /\D/g,

  /**
   * Matches any non-numeric/decimal character (used for parsing currency strings like "$75,000" or "₹1,20,000")
   */
  NON_NUMERIC_CURRENCY: /[^0-9.-]+/g,

  /**
   * Matches one or more whitespace characters (used for splitting full names into initials)
   */
  WHITESPACE_SPLIT: /\s+/,

  /**
   * Full name (letters, spaces, dots, apostrophes, hyphens; 2 to 80 chars)
   */
  FULL_NAME: /^[a-zA-Z][a-zA-Z\s.'-]{1,79}$/,

  /**
   * Employee Code (e.g., EMP-001, HR-001, NX-001, HR-002-01)
   */
  EMPLOYEE_CODE: /^[A-Z]{2,6}-\d{2,5}(?:-\d{1,3})?$/,

  /**
   * Company Code (e.g., CMP-001, CMP-002)
   */
  COMPANY_CODE: /^CMP-\d{3,5}$/,

  /**
   * Department or Sub-Department Code (e.g., ENG, HR, ENG-FE, HR-TA, FIN-TAX)
   */
  DEPARTMENT_CODE: /^[A-Z]{2,8}(?:-[A-Z]{2,6})?$/,

  /**
   * Organizational Level Code (Employee L1-L10 or HR H1-H6)
   */
  ORGANIZATIONAL_LEVEL_CODE: /^(?:L(?:10|[1-9])|H[1-6])$/,

  /**
   * Designation Code (e.g., DESIG_CTO, DESIG_DEV, DESIG_CHRO)
   */
  DESIGNATION_CODE: /^DESIG_[A-Z0-9_]{2,30}$/,

  /**
   * System Role Code (e.g., EMP_DEVELOPER, HR_MANAGER, HR_CHRO)
   */
  ROLE_CODE: /^(?:EMP|HR)_[A-Z0-9_]{2,35}$/,

  /**
   * Project Code (e.g., PRJ-101, PRJ-2026-01)
   */
  PROJECT_CODE: /^PRJ-(?:\d{4}-)?\d{2,6}$/,

  /**
   * Task Code (e.g., TSK-2001)
   */
  TASK_CODE: /^TSK-\d{3,6}$/,

  /**
   * Company Domain (e.g., worksphere.com, nexacloud.io)
   */
  DOMAIN: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,

  /**
   * HTTP / HTTPS URL (e.g., external tool URL, resume link, meeting link)
   */
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,

  /**
   * Indian PAN Card Number (e.g., ABCDE1234F)
   */
  PAN_CARD: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  /**
   * Indian Bank IFSC Code (e.g., HDFC0001234)
   */
  IFSC_CODE: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  /**
   * Positive numeric / currency amount (supports optional commas and up to 2 decimal places)
   */
  CURRENCY_AMOUNT: /^\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?$|^\d+(?:\.\d{1,2})?$/,

  /**
   * ISO Date (YYYY-MM-DD)
   */
  DATE_ISO: /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/,

  /**
   * 12-Hour Time (e.g., 09:30 AM, 06:30 PM)
   */
  TIME_12HR: /^(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM|am|pm)$/,
} as const;

export type RegexPatternKey = keyof typeof REGEX_PATTERNS;

/**
 * Reusable Regex Validation Helper Functions
 */
export const RegexValidator = {
  isValidEmail: (value: string): boolean => REGEX_PATTERNS.EMAIL.test((value || '').trim()),
  isStrongPassword: (value: string): boolean => REGEX_PATTERNS.PASSWORD_STRONG.test(value || ''),
  isValidPhoneIndia: (value: string): boolean => REGEX_PATTERNS.PHONE_INDIA.test((value || '').trim()),
  isValidPhoneInternational: (value: string): boolean => REGEX_PATTERNS.PHONE_INTERNATIONAL.test((value || '').trim()),
  isValidFullName: (value: string): boolean => REGEX_PATTERNS.FULL_NAME.test((value || '').trim()),
  isValidEmployeeCode: (value: string): boolean => REGEX_PATTERNS.EMPLOYEE_CODE.test((value || '').trim().toUpperCase()),
  isValidCompanyCode: (value: string): boolean => REGEX_PATTERNS.COMPANY_CODE.test((value || '').trim().toUpperCase()),
  isValidDepartmentCode: (value: string): boolean => REGEX_PATTERNS.DEPARTMENT_CODE.test((value || '').trim().toUpperCase()),
  isValidLevelCode: (value: string): boolean => REGEX_PATTERNS.ORGANIZATIONAL_LEVEL_CODE.test((value || '').trim().toUpperCase()),
  isValidDomain: (value: string): boolean => REGEX_PATTERNS.DOMAIN.test((value || '').trim().toLowerCase()),
  isValidUrl: (value: string): boolean => REGEX_PATTERNS.URL.test((value || '').trim()),
  isValidPan: (value: string): boolean => REGEX_PATTERNS.PAN_CARD.test((value || '').trim().toUpperCase()),
  isValidIfsc: (value: string): boolean => REGEX_PATTERNS.IFSC_CODE.test((value || '').trim().toUpperCase()),
};
