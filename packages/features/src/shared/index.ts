/**
 * Shared Layer
 *
 * Reusable foundation that all other layers can import from.
 * Contains: lib/, api/, config/, i18n/ segments.
 *
 * This layer should be domain-agnostic and purely technical.
 * Domain-agnostic UI components belong in @myapp/ui package.
 */

export * from "./lib";
export * from "./api";
export * from "./config";
// i18n is exported separately via @myapp/features/shared/i18n
