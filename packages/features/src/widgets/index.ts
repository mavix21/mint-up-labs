/**
 * Widgets Layer
 *
 * Large self-contained UI blocks, compositions of features and entities.
 * Widgets are reusable across pages and apps.
 *
 * Examples: header, footer, sidebar, auth-panel, user-profile-card
 *
 * Rules:
 * - Widgets cannot import from other widgets on the same layer
 * - Can import from features/, entities/, and shared/ layers below
 */

export * from "./user-card";
