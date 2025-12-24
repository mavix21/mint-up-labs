"use client";

import type { ReactNode } from "react";

import { truncateAddress } from "@/features/connect-wallet";

export interface UserCardProps {
  /**
   * The user's wallet address.
   */
  address: string;
  /**
   * Optional ENS name or display name.
   */
  displayName?: string | null;
  /**
   * Optional avatar URL.
   */
  avatarUrl?: string | null;
  /**
   * Optional balance to display.
   */
  balance?: string | null;
  /**
   * Optional network/chain name.
   */
  network?: string | null;
  /**
   * Whether to truncate the address.
   * @default true
   */
  truncateAddr?: boolean;
  /**
   * Slot for additional actions (buttons, etc.).
   */
  actions?: ReactNode;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * UserCard - A widget displaying user wallet information.
 *
 * Composes the connect-wallet feature utilities with a card layout.
 * Style this component using your design system's card component.
 *
 * @example
 * ```tsx
 * import { UserCard } from "@myapp/features/widgets/user-card";
 * import { useAccount, useBalance } from "wagmi";
 * import { formatEther } from "viem";
 *
 * function MyUserCard() {
 *   const { address } = useAccount();
 *   const { data: balance } = useBalance({ address });
 *
 *   if (!address) return null;
 *
 *   return (
 *     <UserCard
 *       address={address}
 *       balance={balance ? formatEther(balance.value) : undefined}
 *       actions={<button>View Profile</button>}
 *     />
 *   );
 * }
 * ```
 */
export function UserCard({
  address,
  displayName,
  avatarUrl,
  balance,
  network,
  truncateAddr = true,
  actions,
  className,
}: UserCardProps) {
  const displayAddress = truncateAddr ? truncateAddress(address) : address;

  return (
    <div className={className}>
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName ?? displayAddress}
          style={{ width: 48, height: 48, borderRadius: "50%" }}
        />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {displayAddress.slice(2, 4).toUpperCase()}
        </div>
      )}

      {/* User Info */}
      <div>
        {displayName && <div className="font-semibold">{displayName}</div>}
        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          {displayAddress}
        </div>
        {balance && (
          <div style={{ fontSize: "0.875rem" }}>
            {balance} {network ? `on ${network}` : ""}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && <div>{actions}</div>}
    </div>
  );
}
