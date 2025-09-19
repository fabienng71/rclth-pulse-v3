/**
 * Admin Configuration
 * 
 * Centralized configuration for admin-related settings.
 * This file contains hardcoded admin emails and other admin-specific constants.
 */

export const ADMIN_CONFIG = {
  /**
   * List of emails that have automatic admin privileges
   * These users will be granted admin access regardless of their role in the database
   */
  HARDCODED_ADMIN_EMAILS: [
    'fabien@repertoire.co.th',
    'store@repertoire.co.th'
  ] as const,

  /**
   * Database role that grants admin privileges
   */
  ADMIN_ROLE: 'admin' as const,

  /**
   * Session timeout for admin users (in milliseconds)
   * Default: 8 hours
   */
  ADMIN_SESSION_TIMEOUT: 8 * 60 * 60 * 1000,

  /**
   * Whether to log admin access attempts
   */
  ENABLE_ADMIN_LOGGING: true,

  /**
   * Admin route prefix
   */
  ADMIN_ROUTE_PREFIX: '/admin' as const,
} as const;

/**
 * Utility function to check if an email has hardcoded admin privileges
 */
export const isHardcodedAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_CONFIG.HARDCODED_ADMIN_EMAILS.includes(email as any);
};

/**
 * Utility function to check if a user is admin based on role or hardcoded email
 */
export const isAdminUser = (userRole: string | null | undefined, userEmail: string | null | undefined): boolean => {
  return userRole === ADMIN_CONFIG.ADMIN_ROLE || isHardcodedAdmin(userEmail);
};

/**
 * Get admin configuration for debugging
 */
export const getAdminConfig = () => {
  return {
    adminEmailCount: ADMIN_CONFIG.HARDCODED_ADMIN_EMAILS.length,
    adminRole: ADMIN_CONFIG.ADMIN_ROLE,
    loggingEnabled: ADMIN_CONFIG.ENABLE_ADMIN_LOGGING,
    sessionTimeout: ADMIN_CONFIG.ADMIN_SESSION_TIMEOUT,
  };
};