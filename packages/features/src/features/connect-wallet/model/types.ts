/**
 * Wallet connection status.
 */
export type WalletConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Wallet type/provider.
 */
export type WalletType =
  | "metamask"
  | "coinbase"
  | "walletconnect"
  | "injected"
  | "unknown";

/**
 * Connected wallet information.
 */
export interface WalletInfo {
  /**
   * The wallet address (checksummed).
   */
  address: string;
  /**
   * The chain ID the wallet is connected to.
   */
  chainId: number;
  /**
   * The type of wallet connector.
   */
  walletType: WalletType;
  /**
   * Optional ENS name if resolved.
   */
  ensName?: string | null;
  /**
   * Optional avatar URL (ENS avatar, etc.).
   */
  avatarUrl?: string | null;
}

/**
 * Wallet connection state.
 */
export interface WalletState {
  /**
   * Current connection status.
   */
  status: WalletConnectionStatus;
  /**
   * Connected wallet info (null if disconnected).
   */
  wallet: WalletInfo | null;
  /**
   * Error message if connection failed.
   */
  error: string | null;
}

/**
 * Initial wallet state (disconnected).
 */
export const initialWalletState: WalletState = {
  status: "disconnected",
  wallet: null,
  error: null,
};
