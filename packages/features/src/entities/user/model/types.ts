/**
 * User entity types.
 */

/**
 * Base user information.
 */
export interface User {
  /**
   * Unique user identifier.
   */
  id: string;
  /**
   * User's display name.
   */
  name?: string | null;
  /**
   * User's email address.
   */
  email?: string | null;
  /**
   * User's avatar URL.
   */
  avatarUrl?: string | null;
  /**
   * User's primary wallet address.
   */
  walletAddress?: string | null;
  /**
   * Timestamp when the user was created.
   */
  createdAt: Date;
  /**
   * Timestamp when the user was last updated.
   */
  updatedAt: Date;
}

/**
 * User with additional profile information.
 */
export interface UserProfile extends User {
  /**
   * User's bio or description.
   */
  bio?: string | null;
  /**
   * User's website URL.
   */
  website?: string | null;
  /**
   * User's social handles.
   */
  socials?: {
    twitter?: string | null;
    farcaster?: string | null;
    lens?: string | null;
  } | null;
}
