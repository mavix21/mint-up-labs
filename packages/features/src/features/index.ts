/**
 * Features Layer
 *
 * Reusable product features with business value.
 * Each feature is a slice containing: ui/, model/, api/, lib/ segments.
 *
 * Examples: auth, notifications, search, connect-wallet
 *
 * Rules:
 * - Features cannot import from other features on the same layer
 * - Can import from entities/ and shared/ layers below
 */

export * from "./connect-wallet";
