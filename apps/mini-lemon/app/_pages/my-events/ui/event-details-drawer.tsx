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
        <DrawerClose className="absolute top-4 left-4 z-20 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/40">
          <ChevronDown className="h-6 w-6" />
        </DrawerClose>

        {/* Scrollable content */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {/* Hero image */}
          <div className="relative aspect-square w-full sm:aspect-[16/10]">
            <Image
              src={event.imageUrl ?? "/placeholder.svg"}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            <div className="to-background/90 absolute inset-0 bg-linear-to-b from-black/30 via-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 -mt-6 px-5 pb-10">
            {/* Title */}
            <h1 className="mb-2 text-[28px] leading-tight font-bold tracking-tight text-white">
              {event.name}
            </h1>

            {/* Date/Time */}
            <p className="mb-4 text-[15px] font-medium tracking-wide text-[#4ADE80]">
              {formattedDate} • {formattedTime} {timezone.offset}
            </p>

            {/* Attendance status */}
            {isAttending && (
              <p className="mb-6 flex items-center gap-2 text-[15px] font-medium text-white/90">
                You&apos;re in! <span className="text-lg">✨</span>
              </p>
            )}

            {/* Action buttons */}
            <div className="mb-8 flex gap-3">
              <Button className="h-12 flex-1 rounded-xl border border-[#5C4018] bg-[#3F2E18] text-[15px] font-semibold text-[#FFD700] hover:bg-[#4F3A20]">
                View Ticket
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-[#1C3A2E] bg-[#0F1F18] px-5 font-medium text-[#4ADE80] hover:bg-[#162B22]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-xl border-[#1C3A2E] bg-[#0F1F18] p-0 text-[#4ADE80] hover:bg-[#162B22]"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Section */}
            <div className="mb-8">
              <h3 className="mb-4 text-[17px] font-bold text-white">
                Location
              </h3>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
                <div className="min-w-0 flex-1">
                  {locationUrl ? (
                    <a
                      href={locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-[15px] leading-relaxed break-all text-white hover:underline"
                    >
                      <span className="line-clamp-2 flex-1">{locationUrl}</span>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                    </a>
                  ) : (
                    <p className="text-[15px] text-white">
                      {locationAddress || "TBD"}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-white/50">
                    {event.location.type === "online"
                      ? "Online Event"
                      : "In Person Event"}
                  </p>
                </div>
              </div>
              <div className="mt-6 h-px w-full bg-white/10" />
            </div>

            {/* Host Section */}
            <div className="mb-8">
              <h3 className="mb-4 text-[17px] font-bold text-white">Host</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-white/10">
                  <AvatarImage
                    src={event.creator.imageUrl || "/placeholder.svg"}
                  />
                  <AvatarFallback>{event.creator.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-[15px] font-bold text-white">
                  {event.creator.name}
                </span>
              </div>
              <div className="mt-6 h-px w-full bg-white/10" />
            </div>

            {/* Attendees Section */}
            {event.registrationCount > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-[17px] font-bold text-white">
                  {event.registrationCount} attendees
                </h3>
                <div className="flex items-center -space-x-3">
                  {event.recentRegistrations.map((attendee, i) => (
                    <Avatar
                      key={attendee.userId || i}
                      className="border-background h-10 w-10 border-2"
                    >
                      <AvatarImage
                        src={attendee.pfpUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback>{attendee.displayName[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="mt-6 h-px w-full bg-white/10" />
              </div>
            )}

            {/* About Event Section */}
            {event.description && (
              <div className="mb-8">
                <h3 className="mb-4 text-[17px] font-bold text-white">
                  About event
                </h3>
                <div className="space-y-1 text-[15px] leading-relaxed text-white/90">
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
