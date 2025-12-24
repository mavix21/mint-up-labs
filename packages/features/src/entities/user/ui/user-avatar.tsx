"use client";

export interface UserAvatarProps {
  /**
   * Avatar image URL.
   */
  src?: string | null;
  /**
   * User's name for alt text.
   */
  name?: string | null;
  /**
   * Avatar size in pixels.
   * @default 40
   */
  size?: number;
  /**
   * Fallback initials to display when no image.
   */
  fallback?: string;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * UserAvatar - Displays a user's avatar with fallback.
 *
 * A simple avatar component that can be styled with your design system.
 * For production, consider using the Avatar component from @myapp/ui.
 *
 * @example
 * ```tsx
 * import { UserAvatar } from "@myapp/features/entities/user";
 *
 * function MyComponent() {
 *   return (
 *     <UserAvatar
 *       src="https://example.com/avatar.jpg"
 *       name="John Doe"
 *       size={48}
 *       fallback="JD"
 *     />
 *   );
 * }
 * ```
 */
export function UserAvatar({
  src,
  name,
  size = 40,
  fallback,
  className,
}: UserAvatarProps) {
  const initials =
    fallback ?? name?.slice(0, 2).toUpperCase() ?? "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={className}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        color: "#374151",
      }}
    >
      {initials}
    </div>
  );
}
