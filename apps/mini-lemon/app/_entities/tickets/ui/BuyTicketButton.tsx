"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useWriteContract } from "wagmi";

import { Button } from "@mint-up/ui/components/button";

import { abi } from "@/app/_shared/lib/abi";
import {
  BASE_CHAIN_ID,
  MINTUP_FACTORY_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "@/app/_shared/lib/constants";
import { usdcAbi } from "@/app/_shared/lib/usdc_abi";

export type BuyTicketLifecycleStatus =
  | "idle"
  | "approving"
  | "minting"
  | "success"
  | "error";

interface BuyTicketButtonProps {
  handleOnStatus?: (status: BuyTicketLifecycleStatus) => void;
  price: number;
  tokenId: string;
}

export function BuyTicketButton({
  handleOnStatus,
  price,
  tokenId,
}: BuyTicketButtonProps) {
  const { data: session } = useSession();
  const { writeContractAsync } = useWriteContract();
  const [isProcessing, setIsProcessing] = useState(false);

  const emitStatus = useCallback(
    (status: BuyTicketLifecycleStatus) => {
      handleOnStatus?.(status);
    },
    [handleOnStatus],
  );

  const handleBuyClick = useCallback(async () => {
    if (!session) {
      toast.info("Please sign in to buy a ticket");
      return;
    }

    setIsProcessing(true);
    try {
      const approvalAmount = parseUnits(price.toString(), 6);

      emitStatus("approving");
      await writeContractAsync({
        address: USDC_CONTRACT_ADDRESS,
        abi: usdcAbi,
        functionName: "approve",
        args: [MINTUP_FACTORY_CONTRACT_ADDRESS, approvalAmount],
        chainId: BASE_CHAIN_ID,
      });

      emitStatus("minting");
      await writeContractAsync({
        address: MINTUP_FACTORY_CONTRACT_ADDRESS,
        abi,
        functionName: "mintTicket",
        args: [BigInt(tokenId)],
        chainId: BASE_CHAIN_ID,
      });

      emitStatus("success");
      toast.success("Ticket minted successfully");
    } catch (error) {
      console.error("Ticket mint failed", error);
      emitStatus("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete ticket purchase",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [emitStatus, price, tokenId, writeContractAsync, session]);

  if (!session) {
    return (
      <div className="border-border/60 bg-muted/40 text-muted-foreground rounded-2xl border p-4 text-center text-sm">
        Please sign in to buy a ticket.
      </div>
    );
  }

  return (
    <Button
      type="button"
      className="h-12 w-full rounded-xl text-base font-semibold"
      onClick={handleBuyClick}
      disabled={isProcessing || price <= 0}
    >
      {isProcessing ? "Processing..." : "Mint ticket"}
    </Button>
  );
}
