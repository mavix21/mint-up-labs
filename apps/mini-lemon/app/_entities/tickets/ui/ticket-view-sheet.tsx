import { memo } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { Id } from "@mint-up/convex/_generated/dataModel";
import { api } from "@mint-up/convex/_generated/api";
import { useQuery } from "@mint-up/convex/react";
import { Button } from "@mint-up/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@mint-up/ui/components/drawer";

import { formatRelativeDate } from "@/app/_shared/lib/date/date-utils";

const FullscreenSpinner = () => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
  </div>
);

const NftTicket = dynamic(
  () =>
    import("../../events/ui/nft-ticket/nft-ticket").then((mod) => mod.default),
  {
    loading: () => <FullscreenSpinner />,
    ssr: false,
  },
);

export interface TicketViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  userId: Id<"users">;
}

const TicketViewSheet = ({
  open,
  onOpenChange,
  eventId,
  userId,
}: TicketViewSheetProps) => {
  // Reset local state when sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const registration = useQuery(
    api.registrations.getRegistrationTicketByEventIdUserId,
    {
      eventId,
      userId,
    },
  );

  if (!registration) {
    return <FullscreenSpinner />;
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `https://mint-up-mini.vercel.app/events/${registration.eventId}`,
  )}`;

  const handleTicketShare = () => {
    console.log("Share ticket functionality to be implemented");
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex h-[90vh] flex-col gap-5">
        <DrawerTitle className="sr-only">Ticket View</DrawerTitle>
        <div className="flex-1 overflow-y-auto">
          <NftTicket
            eventName={registration.eventName}
            eventImageUrl={registration.eventImageUrl}
            startDate={new Date(formatRelativeDate(registration.startDate))}
            ticketName={registration.ticketName}
            location={registration.location}
            locationDetails={registration.locationDetails}
            ticketHolderName={registration.ticketHolder.name}
            ticketHolderUsername={registration.ticketHolder.username}
            ticketHolderAvatar={registration.ticketHolder.avatar}
            organizerName={registration.organizer.name}
            organizerEmail={registration.organizer.email}
            organizerAvatar={registration.organizer.avatar}
            tokenId={registration.tokenId}
            qrCodeData={qrUrl}
            style="silver"
          />
        </div>

        <div className="px-4 pb-8">
          <Button onClick={handleTicketShare} className="w-full">
            Share my ticket
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default memo(TicketViewSheet);
