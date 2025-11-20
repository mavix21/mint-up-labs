import { memo, useCallback, useState } from "react";
import { callSmartContract, TransactionResult } from "@lemoncash/mini-app-sdk";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseUnits } from "viem";

import type { Doc, Id } from "@mint-up/convex/_generated/dataModel";
import { api } from "@mint-up/convex/_generated/api";
import { useMutation } from "@mint-up/convex/react";
import { Button } from "@mint-up/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@mint-up/ui/components/drawer";

import { useMiniApp } from "@/app/_shared/lib/lemon/mini-app.provider";

import { usePendingRegistrationService } from "../models/pending-registration.service";
import {
  isOnchainTicket,
  isTicketFree,
  isTicketPaid,
} from "../utils/ticket-types";
import { EventIntentionsSheet } from "./EventIntentionsSheet";
import { FreeTicketCard } from "./FreeTicketCard";
import { PaidTicketCard } from "./PaidTicketCard";

// Constants
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
// TODO: Ensure this environment variable is set or import from constants file
const MINTUP_FACTORY_CONTRACT_ADDRESS =
  "0x5Bf66d335822BEAD0848AaA92A15fe842b554871" as `0x${string}`; // Placeholder until env is fixed

export interface TicketsEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  ticketList: Doc<"ticketTemplates">[];
}

const TicketsEventSheet = ({
  open,
  onOpenChange,
  eventId,
  ticketList,
}: TicketsEventSheetProps) => {
  const { wallet } = useMiniApp();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIntentionsSheet, setShowIntentionsSheet] = useState(false);

  // Initialize hooks
  const createRegistration = useMutation(api.registrations.createRegistration);
  const { storePendingRegistration } = usePendingRegistrationService();

  // Get selected ticket
  const selectedTicket =
    ticketList.find((ticket) => ticket._id === selectedTicketId) ?? null;

  // Reset local state when sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTicketId(null);
    }
    onOpenChange(isOpen);
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleRegistrationSuccess = useCallback(() => {
    onOpenChange(false);
    // Show intentions sheet after a brief delay for better UX
    setTimeout(() => {
      setShowIntentionsSheet(true);
    }, 300);
  }, [onOpenChange]);

  const handleRegister = useCallback(async () => {
    if (!selectedTicket) {
      return;
    }

    setIsProcessing(true);

    try {
      if (isTicketFree(selectedTicket)) {
        await createRegistration({
          eventId,
          ticketTemplateId: selectedTicket._id,
        });
        toast.success("Registration successful!");
        handleRegistrationSuccess();
      } else if (
        isTicketPaid(selectedTicket) &&
        isOnchainTicket(selectedTicket)
      ) {
        if (!wallet) {
          toast.error("Wallet not connected");
          return;
        }

        const price = selectedTicket.ticketType.price.amount;
        const syncStatus = selectedTicket.ticketType.syncStatus;

        if (syncStatus.status !== "synced") {
          toast.error("Ticket not synced yet");
          return;
        }

        const tokenId = syncStatus.tokenId;

        // Execute batch transaction: Approve + Mint
        const response = await callSmartContract({
          contracts: [
            {
              contractAddress: USDC_ADDRESS,
              functionName: "approve",
              functionParams: [
                MINTUP_FACTORY_CONTRACT_ADDRESS,
                parseUnits(price.toString(), 6).toString(),
              ],
              value: "0",
            },
            {
              contractAddress: MINTUP_FACTORY_CONTRACT_ADDRESS,
              functionName: "mintTicket",
              functionParams: [tokenId],
              value: "0",
            },
          ],
        });

        if (response.result === TransactionResult.SUCCESS) {
          const { txHash } = response.data;

          try {
            await createRegistration({
              eventId,
              ticketTemplateId: selectedTicket._id,
              transactionReceipt: {
                tokenId: tokenId,
                walletAddress: wallet,
                transactionHash: txHash,
              },
            });

            toast.success("Registration successful!");
            handleRegistrationSuccess();
          } catch (error) {
            console.error("Failed to register in Convex:", error);

            // Store pending registration for background sync
            storePendingRegistration({
              eventId,
              ticketTemplateId: selectedTicket._id,
              transactionHash: txHash,
              tokenId: tokenId,
              walletAddress: wallet,
            });

            toast.success("Payment successful! We're syncing your ticket...");
            onOpenChange(false);
          }
        } else if (response.result === TransactionResult.FAILED) {
          console.error("Transaction failed:", response.error);
          toast.error("Transaction failed. Please try again.");
        } else {
          // Cancelled
          console.log("Transaction cancelled");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedTicket,
    eventId,
    createRegistration,
    wallet,
    storePendingRegistration,
    onOpenChange,
    handleRegistrationSuccess,
  ]);

  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    if (!selectedTicket) return "Select a ticket";
    if (isTicketFree(selectedTicket)) return "Register";
    if (isOnchainTicket(selectedTicket)) {
      const { amount, currency } = selectedTicket.ticketType.price;
      return `Buy for ${amount} ${currency}`;
    }
    return "Register";
  };

  const isButtonDisabled = () => {
    if (!selectedTicket || isProcessing) return true;
    if (isTicketPaid(selectedTicket) && isOnchainTicket(selectedTicket)) {
      const status = selectedTicket.ticketType.syncStatus.status;
      return status === "pending" || status === "error";
    }
    return false;
  };

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="flex h-[90vh] flex-col">
          <DrawerHeader>
            <DrawerTitle>Choose the tickets you prefer</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              {ticketList.map((ticket) => {
                const isSelected = selectedTicketId === ticket._id;

                if (isTicketFree(ticket)) {
                  return (
                    <FreeTicketCard
                      key={ticket._id}
                      ticket={ticket}
                      selected={isSelected}
                      onSelect={handleTicketSelect}
                      disabled={isProcessing}
                    />
                  );
                }

                if (isTicketPaid(ticket)) {
                  return (
                    <PaidTicketCard
                      key={ticket._id}
                      ticket={ticket}
                      selected={isSelected}
                      onSelect={handleTicketSelect}
                      disabled={isProcessing}
                      isTransactionPending={isProcessing}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>

          <div className="bg-background border-t p-5">
            <Button
              onClick={handleRegister}
              disabled={isButtonDisabled()}
              className="w-full"
              size="lg"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {getButtonText()}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Event Intentions Sheet - shown after successful registration */}
      <EventIntentionsSheet
        open={showIntentionsSheet}
        onOpenChange={setShowIntentionsSheet}
        eventId={eventId}
      />
    </>
  );
};

export default memo(TicketsEventSheet);
