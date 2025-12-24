import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { siweWalletAgnosticClient } from "@mint-up/better-auth-siwe-wallet-agnostic/client";

export const authClient = createAuthClient({
  plugins: [siweWalletAgnosticClient(), convexClient()],
  fetchOptions: {
    credentials: "include",
  },
});
