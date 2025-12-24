"use client";

import type { Route } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { LongSheet } from "@myapp/ui/components/long-sheet/index";

import { useSheetRoute } from "@/shared/hooks/use-sheet-route";

interface LongSheetRouteProps {
  route: Route;
  defaultFallback?: Route;
  children: ReactNode;
}

/**
 * Client wrapper for LongSheet with route handling (donut pattern).
 * Accepts server-rendered children while handling client-side routing.
 */
function LongSheetRouteInner({
  route,
  defaultFallback,
  children,
}: LongSheetRouteProps) {
  const { presented, onPresentedChange, onTravelStatusChange } = useSheetRoute({
    route,
    defaultFallback,
  });

  return (
    <LongSheet.Root presented={presented} onPresentedChange={onPresentedChange}>
      <LongSheet.Portal>
        <LongSheet.View
          onTravelStatusChange={onTravelStatusChange}
          onDismissAutoFocus={{ focus: false }}
        >
          <LongSheet.Backdrop />
          <LongSheet.Content>{children}</LongSheet.Content>
        </LongSheet.View>
      </LongSheet.Portal>
    </LongSheet.Root>
  );
}

export function LongSheetRoute(props: LongSheetRouteProps) {
  return (
    <Suspense fallback={null}>
      <LongSheetRouteInner {...props} />
    </Suspense>
  );
}
