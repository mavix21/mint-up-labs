import type { ReactNode } from "react";

import { cn } from "@mint-up/ui/lib/utils";

interface EventCardContentProps {
  children: ReactNode;
  className?: string;
}

export function EventCardContent({
  children,
  className,
}: EventCardContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-2", className)}>
      {children}
    </div>
  );
}
