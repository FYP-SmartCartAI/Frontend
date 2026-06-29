export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 25

export const PASSWORD_PLACEHOLDER =
  '8–25 chars: upper, lower, number & symbol'

export const PASSWORD_HINT =
  'Use 8–25 characters with at least one uppercase letter, lowercase letter, number, and special character (e.g. !@#$).'

export const passwordChecks = (value = '') => ({
  minLength: value.length >= PASSWORD_MIN_LENGTH,
  maxLength: value.length <= PASSWORD_MAX_LENGTH,
  uppercase: /[A-Z]/.test(value),
  lowercase: /[a-z]/.test(value),
  number:    /[0-9]/.test(value),
  special:   /[^A-Za-z0-9]/.test(value),
})

export const isPasswordStrong = (value = '') => {
  const checks = passwordChecks(value)
  return Object.values(checks).every(Boolean)
}

export const passwordFieldRules = {
  required: 'Password is required',
  validate: {
    minLength: (v) =>
      v.length >= PASSWORD_MIN_LENGTH ||
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    maxLength: (v) =>
      v.length <= PASSWORD_MAX_LENGTH ||
      `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
    uppercase: (v) =>
      /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
    lowercase: (v) =>
      /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
    number: (v) =>
      /[0-9]/.test(v) || 'Password must contain at least one number',
    specialChar: (v) =>
      /[^A-Za-z0-9]/.test(v) || 'Password must contain at least one special character',
  },
}

export const getPasswordValidationError = (value = '') => {
  for (const validate of Object.values(passwordFieldRules.validate)) {
    const result = validate(value)
    if (result !== true) return result
  }
  return null
}
