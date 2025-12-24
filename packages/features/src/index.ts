/**
 * @mint-up/features
 *
 * Feature Sliced Design (FSD) package for shared domain-specific components.
 * This package follows the FSD methodology: https://feature-sliced.design
 *
 * Layer Structure (import from top to bottom only):
 * - app/      → Application-wide providers, configs, styles
 * - widgets/  → Large self-contained UI blocks, reusable across pages
 * - features/ → Reusable product features with business value
 * - entities/ → Business entities (user, product, etc.)
 * - shared/   → Reusable foundation: lib, api, config, i18n
 *
 * Segment Naming (purpose-based):
 * - ui/    → UI components
 * - model/ → Business logic, state, types
 * - api/   → API interactions
 * - lib/   → Internal libraries, utilities
 * - config/→ Feature flags, constants
 *
 * Import Rule: A module can only import from layers STRICTLY BELOW it.
 */

// Re-export layers for convenience
export * from "./app";
export * from "./entities";
export * from "./features";
export * from "./widgets";
export * from "./shared";
