"use client";

import type { Route } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { BottomSheet } from "@mint-up/ui/components/bottom-sheet/index";

import { useSheetRoute } from "@/shared/hooks/use-sheet-route";

interface BottomSheetRouteProps {
  route: Route;
  defaultFallback?: Route;
  children: ReactNode;
}

/**
 * Client wrapper for BottomSheet with route handling (donut pattern).
 * Accepts server-rendered children while handling client-side routing.
 */
function BottomSheetRouteInner({
  route,
  defaultFallback,
  children,
}: BottomSheetRouteProps) {
  const { presented, onPresentedChange, onTravelStatusChange } = useSheetRoute({
    route,
    defaultFallback,
  });

  return (
    <BottomSheet.Root
      presented={presented}
      onPresentedChange={onPresentedChange}
    >
      <BottomSheet.Portal>
        <BottomSheet.View
          onTravelStatusChange={onTravelStatusChange}
          onDismissAutoFocus={{ focus: false }}
        >
          <BottomSheet.Backdrop />
          <BottomSheet.Content className="grid">
            <BottomSheet.Handle
              className="mt-2 self-center justify-self-center"
              style={{
                gridArea: "1 / -1",
              }}
            />
            {children}
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
}

export function BottomSheetRoute(props: BottomSheetRouteProps) {
  return (
    <Suspense fallback={null}>
      <BottomSheetRouteInner {...props} />
    </Suspense>
  );
}
