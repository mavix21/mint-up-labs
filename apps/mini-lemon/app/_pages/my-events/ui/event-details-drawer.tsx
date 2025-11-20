"use client";

import type { Route } from "next";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  MapPin,
  MoreVertical,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@mint-up/convex/_generated/api";
import { useMutation, useQuery } from "@mint-up/convex/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";
import { Badge } from "@mint-up/ui/components/badge";
import { Button } from "@mint-up/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@mint-up/ui/components/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mint-up/ui/components/dropdown-menu";
import { Separator } from "@mint-up/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mint-up/ui/components/tabs";

import type { Event } from "@/app/_entities/events/models";
import { EventIntentionsSheet } from "@/app/_entities/tickets/ui/EventIntentionsSheet";
import TicketViewSheet from "@/app/_entities/tickets/ui/ticket-view-sheet";
import TicketsEventSheet from "@/app/_entities/tickets/ui/tickets-event-sheet";
import {
  formatDateWithLogicYear,
  formatTime,
} from "@/app/_shared/lib/date/date-utils";
import { isEventLive } from "@/app/_shared/lib/date/time";
import { getClientTimezone } from "@/app/_shared/lib/date/timezone";
import { useSignIn } from "@/app/_shared/lib/lemon/use-sign-in";
import { env } from "@/src/env";

interface EventDetailsDrawerProps {
  event: Event;
  children: ReactNode;
}

type TabValue = "about" | "attendees";

type ClipboardCapableNavigator = Omit<Navigator, "clipboard"> & {
  clipboard?: Clipboard;
};

interface AttendeeDirectoryData {
  attendees: {
    userId: string;
    name: string;
    avatar?: string | null;
    walletAddress?: string | null;
    worksAt?: string | null;
    role?: string | string[] | null;
    professionalLink?: string | null;
    intentions?: string[] | null;
  }[];
  totalCount: number;
  userHasIntentions: boolean;
}

const getInitial = (value?: string | null) => {
  if (!value) return "?";
  const normalized = value.trim();
  const char = normalized.charAt(0);
  return char ? char.toUpperCase() : "?";
};

export function EventDetailsDrawer({
  event,
  children,
}: EventDetailsDrawerProps) {
  const router = useRouter();
  const timezone = getClientTimezone();
  const { session, isSignedIn, signIn } = useSignIn();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabValue>("about");
  const [showTicketsSheet, setShowTicketsSheet] = useState(false);
  const [showTicketViewSheet, setShowTicketViewSheet] = useState(false);
  const [showIntentionsSheet, setShowIntentionsSheet] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const deleteRegistration = useMutation(api.registrations.deleteRegistration);

  const shouldLoadAttendees = isOpen;
  const attendeeData = useQuery(
    api.registrations.getEventAttendeesWithIntentions,
    shouldLoadAttendees ? { eventId: event._id } : "skip",
  ) as AttendeeDirectoryData | undefined;
  const attendeeLoading = shouldLoadAttendees && attendeeData === undefined;

  const eventUrl = useMemo(
    () => `${env.NEXT_PUBLIC_URL}/events/${event._id}`,
    [event._id],
  );

  const scheduleLabel = useMemo(() => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const sameDay = startDate.toDateString() === endDate.toDateString();
    const startString = formatDateWithLogicYear(startDate.toISOString());
    const endString = formatDateWithLogicYear(endDate.toISOString());
    const startTime = formatTime(event.startDate);
    const endTime = formatTime(event.endDate);

    if (sameDay) {
      return `${startString}, ${startTime} - ${endTime} ${timezone.offset}`;
    }

    return `${startString}, ${startTime} → ${endString}, ${endTime} ${timezone.offset}`;
  }, [event.endDate, event.startDate, timezone.offset]);

  const locationSummary =
    event.location.type === "online" ? "Virtual event" : event.location.address;

  const tickets = event.tickets;
  const hasTickets = tickets.length > 0;
  const allTicketsFree =
    hasTickets &&
    tickets.every((ticket) => ticket.ticketType.type === "offchain");

  const isUserHost = event.isHost;
  const isUserRegistered = Boolean(
    event.userStatus && event.userStatus !== "rejected",
  );
  const canRegister = isSignedIn && !isUserHost && !isUserRegistered;
  const needsSignIn = !isSignedIn;
  const canViewTicket = Boolean(session?.user.id) && isUserRegistered;
  const canCancelRegistration =
    isSignedIn && isUserRegistered && event.userStatus !== "minted";

  const eventIsLive = isEventLive(event.startDate, event.endDate);

  const primaryCtaLabel = !hasTickets
    ? "Join waitlist"
    : allTicketsFree
      ? "Register"
      : "Buy tickets";

  const statusChip = useMemo(() => {
    if (isUserHost) {
      return (
        <Badge className="border-purple-500/40 bg-purple-500/10 text-purple-200">
          Hosting
        </Badge>
      );
    }

    if (!event.userStatus) {
      return null;
    }

    const variantMap: Record<NonNullable<Event["userStatus"]>, string> = {
      pending: "bg-amber-500/10 text-amber-200 border-amber-500/40",
      approved: "bg-emerald-500/10 text-emerald-200 border-emerald-500/40",
      minted: "bg-emerald-500/10 text-emerald-200 border-emerald-500/40",
      rejected: "bg-red-500/10 text-red-200 border-red-500/40",
    };

    const labelMap: Record<NonNullable<Event["userStatus"]>, string> = {
      pending: "Pending approval",
      approved: "Approved",
      minted: "Ticket minted",
      rejected: "Registration rejected",
    };

    return (
      <Badge className={variantMap[event.userStatus]}>
        {labelMap[event.userStatus]}
      </Badge>
    );
  }, [event.userStatus, isUserHost]);

  const handleDrawerChange = (openState: boolean) => {
    setIsOpen(openState);
    if (!openState) {
      setCurrentTab("about");
      setShowTicketsSheet(false);
      setShowTicketViewSheet(false);
      setShowIntentionsSheet(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;

    const sharePayload = {
      title: event.name,
      text: `🎉 ${event.name}\n\n${scheduleLabel}\n${locationSummary}`,
      url: eventUrl,
    };

    try {
      const nav = window.navigator;

      if (typeof nav.share === "function") {
        await nav.share(sharePayload);
        return;
      }

      const clipboardNavigator = nav as ClipboardCapableNavigator;

      if (typeof clipboardNavigator.clipboard?.writeText === "function") {
        await clipboardNavigator.clipboard.writeText(
          `${sharePayload.text}\n${sharePayload.url}`,
        );
        toast.success("Event link copied to clipboard");
        return;
      }
    } catch (error) {
      console.error("Failed to share event", error);
      toast.error("Unable to share right now");
      return;
    }

    toast.info("Sharing isn't supported here, copied the link instead.");
  }, [event.name, eventUrl, scheduleLabel, locationSummary]);

  const handleCopyLink = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const nav = window.navigator;
      const clipboardNavigator = nav as ClipboardCapableNavigator;

      if (typeof clipboardNavigator.clipboard?.writeText === "function") {
        await clipboardNavigator.clipboard.writeText(eventUrl);
        toast.success("Event link copied to clipboard");
        return;
      }

      toast.error("Clipboard is not available in this context");
    } catch (error) {
      console.error("Failed to copy link", error);
      toast.error("Unable to copy event link");
    }
  }, [eventUrl]);

  const handleCancelRegistration = useCallback(async () => {
    if (!canCancelRegistration) return;

    setIsCancelling(true);
    try {
      await deleteRegistration({ eventId: event._id });
      toast.success("Registration cancelled");
    } catch (error) {
      console.error("Failed to cancel registration", error);
      toast.error("Something went wrong, please try again");
    } finally {
      setIsCancelling(false);
    }
  }, [canCancelRegistration, deleteRegistration, event._id]);

  const handleManageEvent = useCallback(() => {
    const manageRoute = `/events/${event._id}/manage` as Route;
    router.push(manageRoute);
  }, [event._id, router]);

  const handleOpenTicketsSheet = () => {
    if (!hasTickets) {
      toast.info("Tickets will be available soon");
      return;
    }
    setShowTicketsSheet(true);
  };

  const locationIcon =
    event.location.type === "online" ? (
      <Globe className="text-muted-foreground mt-0.5 h-5 w-5" />
    ) : (
      <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
    );

  const locationPrimary =
    event.location.type === "online"
      ? event.location.url
      : event.location.address;

  const locationInstructions =
    event.location.type === "in-person" ? event.location.instructions : null;

  return (
    <>
      <Drawer
        open={isOpen}
        onOpenChange={handleDrawerChange}
        snapPoints={[0.96]}
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="bg-background mt-0 flex h-[96vh] max-h-[96vh] flex-col rounded-t-[20px] border-none outline-none [&>div.bg-muted]:hidden">
          <div className="relative flex h-full flex-col">
            <div className="sr-only">
              <DrawerTitle>{event.name}</DrawerTitle>
              <DrawerDescription>
                Event details for {event.name}
              </DrawerDescription>
            </div>

            <DrawerClose className="bg-overlay text-foreground hover:bg-overlay-hover absolute top-4 left-4 z-20 rounded-full p-2 backdrop-blur-md transition-colors">
              <ChevronDown className="h-6 w-6" />
            </DrawerClose>

            <div className="no-scrollbar flex-1 overflow-y-auto">
              <div className="relative aspect-square w-full sm:aspect-16/10">
                <Image
                  src={event.imageUrl ?? "/placeholder.svg"}
                  alt={event.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="to-background/90 from-overlay absolute inset-0 bg-linear-to-b via-transparent" />
              </div>

              <div className="relative z-10 -mt-8 px-5 pb-24">
                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {eventIsLive && (
                      <Badge className="border-orange-400/50 bg-orange-500/20 text-orange-200">
                        Live now
                      </Badge>
                    )}
                    {statusChip}
                  </div>
                  <h1 className="text-foreground text-3xl leading-tight font-bold tracking-tight">
                    {event.name}
                  </h1>
                  <p className="text-success text-sm font-medium tracking-wide uppercase">
                    {scheduleLabel}
                  </p>
                </div>

                {isUserRegistered && (
                  <p className="text-foreground/90 mb-4 flex items-center gap-2 text-base font-medium">
                    You&apos;re in! <span className="text-lg">✨</span>
                  </p>
                )}

                <div className="mb-8 space-y-3">
                  {needsSignIn && (
                    <Button
                      className="h-12 w-full rounded-xl text-base font-semibold"
                      onClick={signIn}
                    >
                      Sign in to register
                    </Button>
                  )}

                  {canRegister && (
                    <Button
                      className="h-12 w-full rounded-xl text-base font-semibold"
                      onClick={handleOpenTicketsSheet}
                      disabled={!hasTickets}
                    >
                      {primaryCtaLabel}
                    </Button>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {isUserHost && (
                      <Button
                        variant="secondary"
                        className="h-12 flex-1 rounded-xl text-base font-semibold"
                        onClick={handleManageEvent}
                      >
                        Manage
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}

                    {canViewTicket && (
                      <Button
                        variant="secondary"
                        className="h-12 flex-1 rounded-xl text-base font-semibold"
                        onClick={() => setShowTicketViewSheet(true)}
                      >
                        View ticket
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="border-success/30 bg-success/10 text-success hover:bg-success/20 h-12 flex-1 rounded-xl text-base font-semibold"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>

                    <AdditionalActionsMenu
                      canCancelRegistration={canCancelRegistration}
                      isCancelling={isCancelling}
                      onCancelRegistration={handleCancelRegistration}
                      onCopyLink={handleCopyLink}
                    />
                  </div>
                </div>

                <Tabs
                  value={currentTab}
                  onValueChange={(value) => setCurrentTab(value as TabValue)}
                  className="space-y-5"
                >
                  <TabsList className="bg-muted/20 grid grid-cols-2 rounded-2xl p-1">
                    <TabsTrigger value="about" className="rounded-xl text-sm">
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="attendees"
                      className="rounded-xl text-sm"
                    >
                      Attendees
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-8">
                    <section>
                      <h3 className="text-lg font-semibold">Location</h3>
                      <Separator className="my-3" />
                      <div className="flex items-start gap-3">
                        {locationIcon}
                        <div className="flex-1 space-y-1">
                          {locationPrimary ? (
                            <p className="text-base font-medium wrap-break-word">
                              {locationPrimary}
                            </p>
                          ) : (
                            <p className="text-base font-medium">
                              Location TBD
                            </p>
                          )}
                          <p className="text-muted-foreground text-sm">
                            {event.location.type === "online"
                              ? "Online event"
                              : "In-person event"}
                          </p>
                          {locationInstructions && (
                            <p className="text-muted-foreground text-sm">
                              {locationInstructions}
                            </p>
                          )}
                          {event.location.type === "online" &&
                            locationPrimary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-0 text-sm"
                                asChild
                              >
                                <a
                                  href={locationPrimary}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Join call
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            )}
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold">Host</h3>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-3">
                        <Avatar className="border-border h-12 w-12 border">
                          <AvatarImage
                            src={event.creator.imageUrl ?? "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {getInitial(event.creator.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base font-semibold">
                            {event.creator.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            @{event.creator.username}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {event.registrationCount} attendee
                          {event.registrationCount === 1 ? "" : "s"}
                        </h3>
                      </div>
                      <Separator className="my-3" />
                      {event.registrationCount > 0 ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex -space-x-3">
                            {event.recentRegistrations.map((attendee) => (
                              <Avatar
                                key={attendee.userId}
                                className="border-background h-10 w-10 border-2"
                              >
                                <AvatarImage
                                  src={attendee.pfpUrl ?? "/placeholder.svg"}
                                />
                                <AvatarFallback>
                                  {getInitial(attendee.displayName)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {event.registrationCount >
                            event.recentRegistrations.length && (
                            <span className="text-muted-foreground text-sm">
                              +
                              {event.registrationCount -
                                event.recentRegistrations.length}{" "}
                              more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Be the first to join this event.
                        </p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold">About event</h3>
                      <Separator className="my-3" />
                      {event.description ? (
                        <div className="text-foreground/90 space-y-3 text-base leading-relaxed">
                          {event.description
                            .split("\n")
                            .map((paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No description available yet.
                        </p>
                      )}
                    </section>
                  </TabsContent>

                  <TabsContent value="attendees">
                    <AttendeeDirectorySection
                      data={attendeeData ?? null}
                      isLoading={attendeeLoading}
                      isSignedIn={isSignedIn}
                      isUserRegistered={isUserRegistered}
                      isUserHost={isUserHost}
                      onAddIntentions={() => setShowIntentionsSheet(true)}
                      onRequestSignIn={signIn}
                      onManageEvent={handleManageEvent}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {hasTickets && canRegister && (
        <TicketsEventSheet
          open={showTicketsSheet}
          onOpenChange={setShowTicketsSheet}
          eventId={event._id}
          ticketList={tickets}
        />
      )}

      {canViewTicket && session?.user.id && (
        <TicketViewSheet
          open={showTicketViewSheet}
          onOpenChange={setShowTicketViewSheet}
          eventId={event._id}
          userId={session.user.id}
        />
      )}

      {isUserRegistered && (
        <EventIntentionsSheet
          open={showIntentionsSheet}
          onOpenChange={setShowIntentionsSheet}
          eventId={event._id}
          onComplete={() => setCurrentTab("attendees")}
        />
      )}
    </>
  );
}

interface AdditionalActionsMenuProps {
  canCancelRegistration: boolean;
  isCancelling: boolean;
  onCancelRegistration: () => void;
  onCopyLink: () => void;
}

function AdditionalActionsMenu({
  canCancelRegistration,
  isCancelling,
  onCancelRegistration,
  onCopyLink,
}: AdditionalActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 w-12 rounded-xl p-0"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onCopyLink}>
          Copy event link
        </DropdownMenuItem>
        {canCancelRegistration && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onCancelRegistration}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel registration"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AttendeeDirectorySectionProps {
  data: AttendeeDirectoryData | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isUserRegistered: boolean;
  isUserHost: boolean;
  onAddIntentions: () => void;
  onRequestSignIn: () => void;
  onManageEvent: () => void;
}

function AttendeeDirectorySection({
  data,
  isLoading,
  isSignedIn,
  isUserRegistered,
  isUserHost,
  onAddIntentions,
  onRequestSignIn,
  onManageEvent,
}: AttendeeDirectorySectionProps) {
  if (isUserHost) {
    return (
      <div className="border-border/70 bg-muted/20 rounded-2xl border border-dashed p-6">
        <p className="text-base font-semibold">Manage attendees</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Hosts can review registrations and intentions from the event
          management view.
        </p>
        <Button className="mt-4" onClick={onManageEvent}>
          Open manage view
        </Button>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="border-border/70 bg-muted/20 rounded-2xl border border-dashed p-6 text-center">
        <p className="text-base font-semibold">Sign in to explore attendees</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Share your intentions and unlock who else is going.
        </p>
        <Button className="mt-4" onClick={onRequestSignIn}>
          Sign in
        </Button>
      </div>
    );
  }

  if (!isUserRegistered) {
    return (
      <div className="border-border/70 bg-muted/20 rounded-2xl border border-dashed p-6 text-center">
        <p className="text-base font-semibold">Register to unlock</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Secure your spot first to see who&apos;s attending.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border-border/70 bg-muted/20 flex items-center justify-center rounded-2xl border p-6">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        <span className="text-muted-foreground ml-3 text-sm">
          Loading attendees...
        </span>
      </div>
    );
  }

  if (!data?.userHasIntentions) {
    return (
      <div className="border-border/70 bg-muted/20 rounded-2xl border border-dashed p-6 text-center">
        <Lock className="mx-auto h-6 w-6" />
        <p className="mt-3 text-base font-semibold">
          Share your intentions to unlock the directory
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Tell others why you&apos;re attending to discover aligned people.
        </p>
        <Button className="mt-4" onClick={onAddIntentions}>
          Share my intentions
        </Button>
      </div>
    );
  }

  if (data.attendees.length === 0) {
    return (
      <div className="border-border/70 bg-muted/20 rounded-2xl border border-dashed p-6 text-center">
        <p className="text-base font-semibold">No shared intentions yet</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Be the first to share yours and start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.attendees.map((attendee) => {
        const roleLabel = Array.isArray(attendee.role)
          ? attendee.role.filter(Boolean).join(", ")
          : (attendee.role ?? "");

        return (
          <div
            key={attendee.userId}
            className="border-border/60 bg-background/80 rounded-2xl border p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={attendee.avatar ?? "/placeholder.svg"} />
                  <AvatarFallback>{getInitial(attendee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{attendee.name}</p>
                  {(attendee.worksAt ?? roleLabel) && (
                    <p className="text-muted-foreground text-sm">
                      {[attendee.worksAt, roleLabel]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              {attendee.professionalLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="ml-auto w-fit"
                >
                  <a
                    href={attendee.professionalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Connect
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {attendee.intentions && attendee.intentions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {attendee.intentions.map((intention) => (
                  <Badge
                    key={`${attendee.userId}-${intention}`}
                    variant="outline"
                    className="border-border/60 text-xs"
                  >
                    {intention}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
