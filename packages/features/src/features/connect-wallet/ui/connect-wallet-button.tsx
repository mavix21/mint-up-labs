"use client";

import type { ReactNode } from "react";

export interface ConnectWalletButtonProps {
  /**
   * Whether a wallet is currently connected.
   */
  isConnected: boolean;
  /**
   * Callback when connect button is clicked.
   */
  onConnect: () => void;
  /**
   * Callback when disconnect button is clicked.
   */
  onDisconnect: () => void;
  /**
   * Custom render function for connected state.
   */
  connectedContent?: ReactNode;
  /**
   * Button text when disconnected.
   * @default "Connect Wallet"
   */
  connectText?: string;
  /**
   * Button text when connected.
   * @default "Disconnect"
   */
  disconnectText?: string;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * ConnectWalletButton - Presentational component for wallet connection.
 *
 * This component is framework-agnostic - it receives all state via props.
 * Wire it up with your wallet library (wagmi, ethers, etc.) in your app.
 *
 * @example
 * ```tsx
 * import { ConnectWalletButton } from "@myapp/features/features/connect-wallet";
 * import { useAccount, useConnect, useDisconnect } from "wagmi";
 *
 * function MyConnectButton() {
 *   const { isConnected } = useAccount();
 *   const { connect } = useConnect();
 *   const { disconnect } = useDisconnect();
 *
 *   return (
 *     <ConnectWalletButton
 *       isConnected={isConnected}
 *       onConnect={() => connect()}
 *       onDisconnect={() => disconnect()}
 *     />
 *   );
 * }
 * ```
 */
export function ConnectWalletButton({
  isConnected,
  onConnect,
  onDisconnect,
  connectedContent,
  connectText = "Connect Wallet",
  disconnectText = "Disconnect",
  className,
}: ConnectWalletButtonProps) {
  if (isConnected) {
    return (
      <button type="button" onClick={onDisconnect} className={className}>
        {connectedContent ?? disconnectText}
      </button>
    );
  }

  return (
    <button type="button" onClick={onConnect} className={className}>
      {connectText}
    </button>
  );
}
