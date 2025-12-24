/**
 * Entities Layer
 *
 * Business entities representing core domain concepts.
 * Each entity is a slice containing: ui/, model/, api/, lib/ segments.
 *
 * Examples: user, product, order, wallet, transaction
 *
 * Rules:
 * - Entities cannot import from other entities on the same layer
 * - Can only import from shared/ layer below
 */

export * from "./user";
