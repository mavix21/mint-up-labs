/**
 * Shared Config
 *
 * Feature flags, constants, and configuration.
 */

/**
 * Feature flags for conditional feature enablement.
 * Override these in your app's environment configuration.
 */
export const featureFlags = {
  /**
   * Enable experimental features.
   */
  enableExperimental: false,
} as const;

/**
 * Common constants used across the application.
 */
export const constants = {
  /**
   * Default pagination page size.
   */
  DEFAULT_PAGE_SIZE: 20,

  /**
   * Maximum file upload size in bytes (10MB).
   */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /**
   * Debounce delay for search inputs in milliseconds.
   */
  SEARCH_DEBOUNCE_MS: 300,
} as const;
