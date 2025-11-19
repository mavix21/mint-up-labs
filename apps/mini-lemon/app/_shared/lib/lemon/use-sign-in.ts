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

export const useSignIn = () => {
  const { data: session, status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

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
        console.warn("Sign in with Lemon cancelled");
        return;
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
        console.error("[NextAuth] Sign in with Lemon failed", {
          cause: response?.error,
        });
        throw new Error("[NextAuth] Sign in with Lemon failed", {
          cause: response?.error,
        });
      }
    } catch (e) {
      console.error("[NextAuth] Sign in with Lemon failed", { cause: e });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    signIn: handleSignIn,
    session,
    isSignedIn: status === "authenticated",
    isLoading: isAuthenticating || status === "loading",
  };
};
