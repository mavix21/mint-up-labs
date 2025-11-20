"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CardSim, Search, Users } from "lucide-react";

import { Button } from "@mint-up/ui/components/button";
import { cn } from "@mint-up/ui/lib/utils";

import { CreateEventFab } from "./create-event-fab";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "events", icon: Calendar, label: "Mis eventos", href: "/" as const },
    {
      id: "discover",
      icon: Search,
      label: "Descubrir",
      href: "/discover" as const,
    },
    {
      id: "community",
      icon: Users,
      label: "Comunidades",
      href: "/community" as const,
    },
    {
      id: "collection",
      icon: CardSim,
      label: "Colección",
      href: "/collection" as const,
    },
  ];

  return (
    <nav className="border-border/40 pb-safe fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-xl dark:bg-[#111]">
      <div className="relative px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Left items */}
          <div className="flex flex-1 items-center justify-around">
            {navItems.slice(0, 2).map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "flex h-auto min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Spacer for FAB */}
          <div className="w-20 shrink-0" />

          {/* Right items */}
          <div className="flex flex-1 items-center justify-around">
            {navItems.slice(2, 4).map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "flex h-auto min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Centered FAB - positioned at center with negative margin to lift it up */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <CreateEventFab className="border-border/40 size-14 border-t shadow-2xl ring-6 dark:ring-[#111]" />
        </div>
      </div>
    </nav>
  );
}
