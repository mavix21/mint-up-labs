"use client";

export interface WalletStatusProps {
  /**
   * Whether a wallet is connected.
   */
  isConnected: boolean;
  /**
   * The connected wallet address (full or truncated).
   */
  address?: string | null;
  /**
   * Optional ENS name or other identity.
   */
  ensName?: string | null;
  /**
   * Whether wallet data is loading.
   */
  isLoading?: boolean;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * WalletStatus - Displays current wallet connection status.
 *
 * @example
 * ```tsx
 * import { WalletStatus } from "@mint-up/features/features/connect-wallet";
 * import { useAccount } from "wagmi";
 * import { truncateAddress } from "@mint-up/features/features/connect-wallet";
 *
 * function MyWalletStatus() {
 *   const { address, isConnected } = useAccount();
 *
 *   return (
 *     <WalletStatus
 *       isConnected={isConnected}
 *       address={address ? truncateAddress(address) : null}
 *     />
 *   );
 * }
 * ```
 */
export function WalletStatus({
  isConnected,
  address,
  ensName,
  isLoading,
  className,
}: WalletStatusProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={className}>
        <span>Not connected</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span>{ensName ?? address ?? "Connected"}</span>
    </div>
  );
}
