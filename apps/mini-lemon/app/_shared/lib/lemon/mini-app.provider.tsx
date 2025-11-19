import type { Address, Hex } from "viem";
import * as React from "react";
import {
  authenticate,
  isWebView,
  TransactionResult,
} from "@lemoncash/mini-app-sdk";

type AuthState =
  | {
      type: "success";
      wallet: Address;
      signature: Hex;
      message: string;
    }
  | {
      type: "error";
      error: {
        message: string;
        code: string;
      };
    }
  | {
      type: "canceled";
    }
  | {
      type: "loading";
    };

interface MiniAppContextType {
  wallet: `0x${string}`;
  authResult: AuthState;
}

const MiniAppContext = React.createContext<MiniAppContextType | undefined>(
  undefined,
);

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = React.useState<string | undefined>(undefined);
  const [authResult, setAuthResult] = React.useState<AuthState>({
    type: "loading",
  });

  const handleAuthentication = React.useCallback(async () => {
    setAuthResult({ type: "loading" });
    const result = await authenticate();

    if (result.result === TransactionResult.FAILED) {
      setAuthResult({
        type: "error",
        error: {
          message: result.error.message,
          code: result.error.code,
        },
      });

      return;
    }

    if (result.result === TransactionResult.CANCELED) {
      setAuthResult({ type: "canceled" });

      return;
    }

    if (result.result === TransactionResult.SUCCESS) {
      setWallet(result.data.wallet);
      setAuthResult({
        type: "success",
        wallet: result.data.wallet,
        signature: result.data.signature,
        message: result.data.message,
      });
    }
  }, []);

  React.useEffect(() => {
    void handleAuthentication();
  }, [handleAuthentication]);

  if (!isWebView()) {
    return (
      <div>
        <p>Not running inside Lemon App!</p>
      </div>
    );
  }

  return (
    <MiniAppContext value={{ wallet, authResult }}>{children}</MiniAppContext>
  );
}
