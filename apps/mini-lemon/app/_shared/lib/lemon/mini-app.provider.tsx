import type { Address, Hex } from "viem";
import * as React from "react";
import {
  authenticate,
  isWebView,
  TransactionResult,
} from "@lemoncash/mini-app-sdk";
import { baseSepolia } from "viem/chains";

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
  authResult: AuthState;
}

const MiniAppContext = React.createContext<MiniAppContextType | undefined>(
  undefined,
);

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const [authResult, setAuthResult] = React.useState<AuthState>({
    type: "loading",
  });

  const handleAuthentication = React.useCallback(async () => {
    setAuthResult({ type: "loading" });
    const result = await authenticate({ chainId: baseSepolia.id });

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

    if (result.result === TransactionResult.CANCELLED) {
      setAuthResult({ type: "canceled" });

      return;
    }

    setAuthResult({
      type: "success",
      wallet: result.data.wallet,
      signature: result.data.signature,
      message: result.data.message,
    });
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

  return <MiniAppContext value={{ authResult }}>{children}</MiniAppContext>;
}

export function useMiniApp() {
  const context = React.use(MiniAppContext);

  if (!context) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }

  return context;
}
