"use client";

import type { Address } from "viem";
import * as React from "react";
import { isWebView } from "@lemoncash/mini-app-sdk";

import { useSignIn } from "../lib/use-sign-in";

interface MiniAppContextType {
  wallet: Address | null;
}

const MiniAppContext = React.createContext<MiniAppContextType | undefined>(
  undefined,
);

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const { signIn, wallet } = useSignIn();

  const handleAuthentication = React.useCallback(async () => {
    await signIn();
  }, [signIn]);

  React.useEffect(() => {
    if (isWebView()) {
      void handleAuthentication();
    } else {
      console.warn("Not running inside Lemon app WebView");
    }
  }, [handleAuthentication]);

  return <MiniAppContext value={{ wallet }}>{children}</MiniAppContext>;
}

export function useMiniApp() {
  const context = React.use(MiniAppContext);

  if (!context) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }

  return context;
}
