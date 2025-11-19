"use client";

import type * as React from "react";
import Image from "next/image";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  MoreVertical,
  Share2,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";
import { Button } from "@mint-up/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@mint-up/ui/components/drawer";

import type { Event } from "@/app/_entities/events/models";
import {
  formatDateWithLogicYear,
  formatTime,
} from "@/app/_shared/lib/date/date-utils";
import { getClientTimezone } from "@/app/_shared/lib/date/timezone";

interface EventDetailsDrawerProps {
  event: Event;
  children: React.ReactNode;
}

export function EventDetailsDrawer({
  event,
  children,
}: EventDetailsDrawerProps) {
  const timezone = getClientTimezone();
  const formattedDate = formatDateWithLogicYear(
    new Date(event.startDate).toISOString(),
  );
  const formattedTime = formatTime(event.startDate);

  const isAttending = event.userStatus === "minted";

  const locationUrl =
    event.location.type === "online" ? event.location.url : null;
  const locationAddress =
    event.location.type === "in-person" ? event.location.address : null;

  return (
    <Drawer snapPoints={[0.96]}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-background mt-0 h-[96vh] max-h-[96vh] rounded-t-[20px] border-none outline-none [&>div.bg-muted]:hidden">
        <div className="sr-only">
          <DrawerTitle>{event.name}</DrawerTitle>
          <DrawerDescription>Event details for {event.name}</DrawerDescription>
        </div>

        {/* Close button */}
        <DrawerClose className="bg-overlay text-foreground hover:bg-overlay-hover absolute top-4 left-4 z-20 rounded-full p-2 backdrop-blur-md transition-colors">
          <ChevronDown className="h-6 w-6" />
        </DrawerClose>

        {/* Scrollable content */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {/* Hero image */}
          <div className="relative aspect-square w-full sm:aspect-16/10">
            <Image
              src={event.imageUrl ?? "/placeholder.svg"}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            <div className="to-background/90 from-overlay absolute inset-0 bg-linear-to-b via-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 -mt-6 px-5 pb-10">
            {/* Title */}
            <h1 className="text-foreground mb-2 text-[28px] leading-tight font-bold tracking-tight">
              {event.name}
            </h1>

            {/* Date/Time */}
            <p className="text-success mb-4 text-[15px] font-medium tracking-wide">
              {formattedDate} • {formattedTime} {timezone.offset}
            </p>

            {/* Attendance status */}
            {isAttending && (
              <p className="text-foreground/90 mb-6 flex items-center gap-2 text-[15px] font-medium">
                You&apos;re in! <span className="text-lg">✨</span>
              </p>
            )}

            {/* Action buttons */}
            <div className="mb-8 flex gap-3">
              <Button className="border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 h-12 flex-1 rounded-xl border text-[15px] font-semibold">
                View Ticket
              </Button>
              <Button
                variant="outline"
                className="border-success/30 bg-success/10 text-success hover:bg-success/20 h-12 rounded-xl px-5 font-medium"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                className="border-success/30 bg-success/10 text-success hover:bg-success/20 h-12 w-12 rounded-xl p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Section */}
            <div className="mb-8">
              <h3 className="text-foreground mb-4 text-[17px] font-bold">
                Location
              </h3>
              <div className="flex items-start gap-3">
                <Globe className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  {locationUrl ? (
                    <a
                      href={locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground flex items-start gap-2 text-[15px] leading-relaxed break-all hover:underline"
                    >
                      <span className="line-clamp-2 flex-1">{locationUrl}</span>
                      <ExternalLink className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-foreground text-[15px]">
                      {locationAddress ?? "TBD"}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-sm">
                    {event.location.type === "online"
                      ? "Online Event"
                      : "In Person Event"}
                  </p>
                </div>
              </div>
              <div className="bg-border mt-6 h-px w-full" />
            </div>

            {/* Host Section */}
            <div className="mb-8">
              <h3 className="text-foreground mb-4 text-[17px] font-bold">
                Host
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="border-border h-12 w-12 border">
                  <AvatarImage
                    src={event.creator.imageUrl ?? "/placeholder.svg"}
                  />
                  <AvatarFallback>{event.creator.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-foreground text-[15px] font-bold">
                  {event.creator.name}
                </span>
              </div>
              <div className="bg-border mt-6 h-px w-full" />
            </div>

            {/* Attendees Section */}
            {event.registrationCount > 0 && (
              <div className="mb-8">
                <h3 className="text-foreground mb-4 text-[17px] font-bold">
                  {event.registrationCount} attendees
                </h3>
                <div className="flex items-center -space-x-3">
                  {event.recentRegistrations.map((attendee, i) => (
                    <Avatar
                      key={attendee.userId || i}
                      className="border-background h-10 w-10 border-2"
                    >
                      <AvatarImage
                        src={attendee.pfpUrl ?? "/placeholder.svg"}
                      />
                      <AvatarFallback>{attendee.displayName[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="bg-border mt-6 h-px w-full" />
              </div>
            )}

            {/* About Event Section */}
            {event.description && (
              <div className="mb-8">
                <h3 className="text-foreground mb-4 text-[17px] font-bold">
                  About event
                </h3>
                <div className="text-foreground/90 space-y-1 text-[15px] leading-relaxed">
                  {event.description.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
