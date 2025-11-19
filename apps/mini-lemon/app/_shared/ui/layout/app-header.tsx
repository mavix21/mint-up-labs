"use client";

import { isWebView } from "@lemoncash/mini-app-sdk";
import { Settings } from "lucide-react";

import { Button } from "@mint-up/ui/components/button";

import { SignInWithFarcaster } from "../sign-in-with-farcaster";
import { ThemeSwitcher } from "../theme-switcher";

export function AppHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 backdrop-blur-xl">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {!isWebView() && <SignInWithFarcaster />}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              size="icon"
              variant="ghost"
              className="bg-card hover:bg-card/80 h-9 w-9 rounded-full"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
