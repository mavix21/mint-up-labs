"use client";

import { AuthKitProvider as AuthKitProviderBase } from "@farcaster/auth-kit";

export function AuthKitProvider({ children }: { children: React.ReactNode }) {
  return <AuthKitProviderBase config={{}}>{children}</AuthKitProviderBase>;
}
