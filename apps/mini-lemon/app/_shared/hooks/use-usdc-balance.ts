import { formatUnits } from "viem";
import { useBalance } from "wagmi";

import { useMiniApp } from "../lib/lemon/mini-app.provider";

// USDC Address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export function useUSDCBalance() {
  const { wallet } = useMiniApp();

  const result = useBalance({
    address: wallet ?? undefined,
    token: USDC_ADDRESS,
  });

  return {
    ...result,
    balance: result.data?.value ?? 0n,
    // formatted: result.data?.formatted ?? "0",
    formatted: formatUnits(
      result.data?.value ?? 0n,
      result.data?.decimals ?? 6,
    ),
    symbol: result.data?.symbol ?? "USDC",
    decimals: result.data?.decimals ?? 6,
  };
}
