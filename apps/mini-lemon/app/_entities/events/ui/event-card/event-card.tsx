"use client";

import * as React from "react";
import Image from "next/image";

import { Card } from "@mint-up/ui/components/card";
import { cn } from "@mint-up/ui/lib/utils";

const EventCardContext = React.createContext<{
  variant?: "primary" | "secondary" | "accent";
}>({});

interface EventCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent";
  children: React.ReactNode;
}

const EventCardRoot = React.forwardRef<HTMLDivElement, EventCardRootProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <EventCardContext.Provider value={{ variant }}>
        <Card
          ref={ref}
          className={cn(
            "gap-0 border-0 bg-[#161618] p-3 shadow-none",
            className,
          )}
          {...props}
        >
          <div className="flex gap-3">{children}</div>
        </Card>
      </EventCardContext.Provider>
    );
  },
);
EventCardRoot.displayName = "EventCard.Root";

const EventCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 flex-1 flex-col justify-between gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
EventCardContent.displayName = "EventCard.Content";

const EventCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-[10px] font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
EventCardHeader.displayName = "EventCard.Header";

const EventCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "line-clamp-2 text-base leading-tight font-bold tracking-tight text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});
EventCardTitle.displayName = "EventCard.Title";

const EventCardMeta = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "text-muted-foreground/80 flex flex-col gap-1 text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
EventCardMeta.displayName = "EventCard.Meta";

const EventCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-0.5 flex items-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
});
EventCardFooter.displayName = "EventCard.Footer";

interface EventCardImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const EventCardImage = React.forwardRef<HTMLDivElement, EventCardImageProps>(
  ({ src, alt, className, ...props }, ref) => {
    return (
      <div ref={ref} className="shrink-0">
        {/* Reduced rounded-lg to rounded-md to match the sharper design */}
        <div
          className={cn(
            "bg-muted/20 relative h-20 w-20 overflow-hidden rounded-md",
            className,
          )}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={alt || "Event image"}
            fill
            className="object-cover"
          />
        </div>
      </div>
    );
  },
);
EventCardImage.displayName = "EventCard.Image";

export const EventCard = {
  Root: EventCardRoot,
  Content: EventCardContent,
  Header: EventCardHeader,
  Title: EventCardTitle,
  Meta: EventCardMeta,
  Footer: EventCardFooter,
  Image: EventCardImage,
};
