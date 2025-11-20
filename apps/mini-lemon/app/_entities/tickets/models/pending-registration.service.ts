import type { Id } from "@mint-up/convex/_generated/dataModel";
import { api } from "@mint-up/convex/_generated/api";
import { useMutation } from "@mint-up/convex/react";

interface PendingRegistration {
  eventId: Id<"events">;
  ticketTemplateId: Id<"ticketTemplates">;
  transactionHash: string;
  tokenId: string;
  walletAddress: string;
  timestamp: number;
}

const PENDING_REGISTRATIONS_KEY = "mintup_pending_registrations";

export const usePendingRegistrationService = () => {
  const createRegistration = useMutation(api.registrations.createRegistration);

  const storePendingRegistration = (
    registration: Omit<PendingRegistration, "timestamp">,
  ) => {
    try {
      const pending = getPendingRegistrations();
      const newPending: PendingRegistration = {
        ...registration,
        timestamp: Date.now(),
      };

      // Check if already exists to avoid duplicates
      const exists = pending.some(
        (p) =>
          p.eventId === registration.eventId &&
          p.ticketTemplateId === registration.ticketTemplateId &&
          p.transactionHash === registration.transactionHash,
      );

      if (!exists) {
        pending.push(newPending);
        localStorage.setItem(
          PENDING_REGISTRATIONS_KEY,
          JSON.stringify(pending),
        );
      }
    } catch (error) {
      console.error("Failed to store pending registration:", error);
    }
  };

  const getPendingRegistrations = (): PendingRegistration[] => {
    try {
      const stored = localStorage.getItem(PENDING_REGISTRATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get pending registrations:", error);
      return [];
    }
  };

  const removePendingRegistration = (
    eventId: Id<"events">,
    ticketTemplateId: Id<"ticketTemplates">,
    transactionHash: string,
  ) => {
    try {
      const pending = getPendingRegistrations();
      const filtered = pending.filter(
        (p) =>
          !(
            p.eventId === eventId &&
            p.ticketTemplateId === ticketTemplateId &&
            p.transactionHash === transactionHash
          ),
      );
      localStorage.setItem(PENDING_REGISTRATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove pending registration:", error);
    }
  };

  const retryPendingRegistration = async (
    registration: PendingRegistration,
  ) => {
    try {
      await createRegistration({
        eventId: registration.eventId,
        ticketTemplateId: registration.ticketTemplateId,
        transactionReceipt: {
          tokenId: registration.tokenId,
          walletAddress: registration.walletAddress,
          transactionHash: registration.transactionHash,
        },
      });

      removePendingRegistration(
        registration.eventId,
        registration.ticketTemplateId,
        registration.transactionHash,
      );
      return true;
    } catch (error) {
      console.error("Failed to retry pending registration:", error);
      return false;
    }
  };

  const syncAllPendingRegistrations = async () => {
    const pending = getPendingRegistrations();
    const results = await Promise.allSettled(
      pending.map((registration) => retryPendingRegistration(registration)),
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length;
    const failed = results.length - successful;

    if (successful > 0) {
      console.log(`Successfully synced ${successful} pending registrations`);
    }
    if (failed > 0) {
      console.log(`${failed} pending registrations failed to sync`);
    }

    return { successful, failed };
  };

  return {
    storePendingRegistration,
    getPendingRegistrations,
    removePendingRegistration,
    retryPendingRegistration,
    syncAllPendingRegistrations,
  };
};
