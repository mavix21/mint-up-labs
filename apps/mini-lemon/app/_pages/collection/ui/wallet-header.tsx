"use client";

import { Copy } from "lucide-react";

import { cn } from "@mint-up/ui/lib/utils";

import { useMiniApp } from "@/app/_shared/lib/lemon/mini-app.provider";

interface WalletHeaderProps {
  balance: number;
  className?: string;
}

export function WalletHeader({ balance, className }: WalletHeaderProps) {
  const { wallet } = useMiniApp();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="text-muted-foreground flex items-center gap-2">
        <span className="text-sm font-medium">
          {wallet
            ? `${wallet.slice(0, 7)}...${wallet.slice(-5)}`
            : "0x00000...00000"}
        </span>
        <Copy className="hover:text-foreground h-3 w-3 cursor-pointer transition-colors" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          ${balance.toFixed(2)}
        </span>
        <span className="text-muted-foreground text-lg font-medium">USDC</span>
      </div>
    </div>
  );
}
