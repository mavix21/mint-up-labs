/**
 * Shared Lib
 *
 * Internal libraries and utility functions.
 * These are technical utilities, not domain-specific.
 */

/**
 * Asserts a condition and throws if false.
 * Useful for runtime type narrowing.
 */
export function invariant(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Invariant violation");
  }
}

/**
 * Type guard to check if a value is defined (not null or undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Delay execution for a specified number of milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * No-operation function. Useful as a default callback.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}
