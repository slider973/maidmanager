/**
 * French error message translations for auth errors
 */

const errorMessages: Record<string, string> = {
  // Sign up errors
  'User already registered': 'Cet email est déjà utilisé',
  'Password should be at least 8 characters': 'Le mot de passe doit contenir au moins 8 caractères',
  'Password is too weak': 'Le mot de passe est trop faible',
  'Invalid email format': "Format d'email invalide",
  'Unable to validate email address: invalid format': "Format d'email invalide",

  // Sign in errors
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed': 'Veuillez confirmer votre email',
  'Invalid credentials': 'Email ou mot de passe incorrect',

  // Token/verification errors
  'Token has expired': 'Le lien a expiré, veuillez en demander un nouveau',
  'Invalid token': 'Lien invalide',
  'Token has expired or is invalid': 'Le lien a expiré ou est invalide',
  'Email link is invalid or has expired': 'Le lien a expiré ou est invalide',

  // Rate limiting
  'Rate limit exceeded': 'Trop de tentatives, veuillez réessayer plus tard',
  'For security purposes, you can only request this after': 'Pour des raisons de sécurité, veuillez réessayer plus tard',

  // Session errors
  'Session not found': 'Session non trouvée',
  'User not found': 'Utilisateur non trouvé',

  // Network/generic errors
  'Network error': 'Erreur de connexion, veuillez réessayer',
  'fetch failed': 'Erreur de connexion, veuillez réessayer',

  // Staff member errors
  'Staff member not found': 'Membre du personnel non trouvé',
  'Failed to create staff member': 'Échec de la création du membre',
  'Failed to update staff member': 'Échec de la mise à jour du membre',
  'Failed to delete staff member': 'Échec de la suppression du membre',
  'Failed to load staff members': 'Échec du chargement des membres',
}

/**
 * Translates an auth error message to French
 * @param error - The error object or message string
 * @returns French error message
 */
export function translateError(error: { message: string } | string | null | undefined): string {
  if (!error) {
    return 'Une erreur est survenue'
  }

  const message = typeof error === 'string' ? error : error.message

  // Check for exact match
  if (errorMessages[message]) {
    return errorMessages[message]
  }

  // Check for partial matches (some errors have dynamic content)
  for (const [key, translation] of Object.entries(errorMessages)) {
    if (message.includes(key)) {
      return translation
    }
  }

  // Log unknown errors for debugging (in development)
  if (import.meta.env.DEV) {
    console.warn('Unknown auth error:', message)
  }

  return 'Une erreur est survenue'
}

/**
 * Password validation constants
 */
export const PASSWORD_MIN_LENGTH = 8

/**
 * Validates password meets minimum requirements
 * @param password - The password to validate
 * @returns Error message in French or null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`
  }
  return null
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates email format
 * @param email - The email to validate
 * @returns Error message in French or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Veuillez entrer votre email'
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Format d'email invalide"
  }
  return null
}

/**
 * Validates optional email format (empty is valid)
 * @param email - The email to validate
 * @returns Error message in French or null if valid
 */
export function validateOptionalEmail(email: string | null | undefined): string | null {
  if (!email || email.trim() === '') {
    return null
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Format d'email invalide"
  }
  return null
}

/**
 * Staff validation error messages
 */
export const staffValidationMessages = {
  firstNameRequired: 'Le prénom est requis',
  lastNameRequired: 'Le nom est requis',
  positionRequired: 'Le poste est requis',
  positionCustomRequired: 'Veuillez préciser le poste',
  invalidEmail: "Format d'email invalide",
  invalidDate: 'Date invalide',
}

/**
 * Validates a required string field
 * @param value - The value to validate
 * @param fieldName - The field name for the error message
 * @returns Error message in French or null if valid
 */
export function validateRequired(value: string | null | undefined, errorMessage: string): string | null {
  if (!value || value.trim() === '') {
    return errorMessage
  }
  return null
}
