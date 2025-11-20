"use client";

import { Check, Copy } from "lucide-react";

import { Skeleton } from "@mint-up/ui/components/skeleton";
import { cn } from "@mint-up/ui/lib/utils";

import { useCopyToClipboard } from "@/app/_shared/hooks/use-copy-to-clipboard";
import { useUSDCBalance } from "@/app/_shared/hooks/use-usdc-balance";
import { useMiniApp } from "@/app/_shared/lib/lemon/mini-app.provider";

interface WalletHeaderProps {
  className?: string;
}

export function WalletHeader({ className }: WalletHeaderProps) {
  const { wallet } = useMiniApp();
  const { formatted, isLoading } = useUSDCBalance();
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="text-muted-foreground flex items-center gap-2">
        <span className="text-sm font-medium">
          {wallet
            ? `${wallet.slice(0, 7)}...${wallet.slice(-5)}`
            : "0x00000...00000"}
        </span>
        {copiedText ? (
          <Check className="h-3 w-3 text-green-500 transition-all" />
        ) : (
          <Copy
            className="hover:text-foreground h-3 w-3 cursor-pointer transition-colors"
            onClick={() => wallet && copyToClipboard(wallet)}
          />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        {isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <span className="text-4xl font-bold tracking-tight">
            ${Number(formatted).toFixed(2)}
          </span>
        )}
        <span className="text-muted-foreground text-lg font-medium">USDC</span>
      </div>
    </div>
  );
}
