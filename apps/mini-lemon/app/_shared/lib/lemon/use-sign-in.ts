import type { Address } from "viem";
import * as React from "react";
import {
  authenticate,
  ChainId,
  TransactionResult,
} from "@lemoncash/mini-app-sdk";
import {
  getCsrfToken,
  signIn as nextAuthSignIn,
  useSession,
} from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [wallet, setWallet] = React.useState<Address | null>(null);

  const handleSignIn = React.useCallback(async () => {
    setIsAuthenticating(true);

    try {
      const nonce = await getCsrfToken();
      if (!nonce) {
        throw new Error("Could not get CSRF token");
      }

      const result = await authenticate({
        chainId: ChainId.BASE_SEPOLIA,
        nonce,
      });
      if (result.result === TransactionResult.FAILED) {
        throw new Error("Sign in with Lemon failed", { cause: result.error });
      }
      if (result.result === TransactionResult.CANCELLED) {
        throw new Error("Sign in with Lemon was cancelled by the user");
      }

      const { message, signature, wallet, claims } = result.data;
      console.log("claims", claims);

      const response = await nextAuthSignIn("credentials", {
        message,
        signature,
        wallet,
        redirect: false,
      });

      if (!response?.ok) {
        throw new Error("[NextAuth] Sign in with Lemon failed", {
          cause: response?.error,
        });
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
    isSignedIn: status === "authenticated",
    isLoading: isAuthenticating || status === "loading",
    wallet,
  };
};
