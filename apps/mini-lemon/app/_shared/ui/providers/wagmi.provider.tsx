"use client";

import type { ReactNode } from "react";
import type { State } from "wagmi";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { getConfig } from "../../lib/wagmi";

interface Props {
  children: ReactNode;
  initialState: State | undefined;
}

export function WagmiClientProvider({ children, initialState }: Props) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
