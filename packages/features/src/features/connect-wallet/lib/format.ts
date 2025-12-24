/**
 * Truncates an Ethereum address for display.
 *
 * @example
 * truncateAddress("0x1234567890abcdef1234567890abcdef12345678")
 * // => "0x1234...5678"
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4,
): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats a chain ID to a human-readable network name.
 */
export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: "Ethereum",
    5: "Goerli",
    10: "Optimism",
    137: "Polygon",
    42161: "Arbitrum",
    8453: "Base",
    84532: "Base Sepolia",
    11155111: "Sepolia",
  };

  return networks[chainId] ?? `Chain ${chainId}`;
}

/**
 * Checks if an address is valid (basic validation).
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
