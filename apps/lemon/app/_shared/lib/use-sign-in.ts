import type { Address } from "viem";
import * as React from "react";
import {
  authenticate,
  ChainId,
  TransactionResult,
} from "@lemoncash/mini-app-sdk";

import { authClient } from "@/auth/client";

// type AuthState =
//   | {
//       type: "success";
//       wallet: Address;
//       signature: Hex;
//       message: string;
//     }
//   | {
//       type: "error";
//       error: {
//         message: string;
//         code: string;
//       };
//     }
//   | {
//       type: "canceled";
//     }
//   | {
//       type: "loading";
//     };

export const useSignIn = () => {
  const { data: session } = authClient.useSession();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [wallet, setWallet] = React.useState<Address | null>(null);

  const handleSignIn = React.useCallback(async () => {
    setIsAuthenticating(true);

    try {
      const { data: nonceData, error: nonceError } =
        await authClient.siweWalletAgnostic.getNonce();
      if (!nonceData || nonceError) {
        throw new Error(nonceError?.message ?? "Failed to get nonce");
      }

      const result = await authenticate({
        chainId: ChainId.BASE_SEPOLIA,
        nonce: nonceData.nonce,
      });
      if (result.result === TransactionResult.FAILED) {
        throw new Error("Sign in with Lemon failed", { cause: result.error });
      }
      if (result.result === TransactionResult.CANCELLED) {
        throw new Error("Sign in with Lemon was cancelled by the user");
      }

      const { message, signature, wallet, claims } = result.data;
      console.log("claims", claims);

      const { data, error } = await authClient.siweWalletAgnostic.verify({
        message,
        signature,
      });

      if (!data || error) {
        throw new Error(
          error?.message ?? "Sign in with Lemon verification failed",
        );
      }
      setWallet(wallet);
    } catch (e) {
      if (e instanceof Error) {
        console.error("[NextAuth] Sign in with Lemon failed", { cause: e });
        return;
      }
      console.error("Unexpected error during sign in with Lemon", { error: e });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    signIn: handleSignIn,
    session,
    isSignedIn: !!session,
    isLoading: isAuthenticating,
    wallet,
  };
};
