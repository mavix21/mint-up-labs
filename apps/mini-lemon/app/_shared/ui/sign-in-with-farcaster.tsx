"use client";

import type { StatusAPIResponse } from "@farcaster/auth-kit";
import { useCallback, useState } from "react";
import { SignInButton } from "@farcaster/auth-kit";
import { getCsrfToken, signIn, signOut } from "next-auth/react";

export const SignInWithFarcaster = () => {
  const [error, setError] = useState(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback((res: StatusAPIResponse) => {
    void signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false,
    });
  }, []);

  return (
    <>
      <SignInButton
        onSuccess={handleSuccess}
        onError={() => setError(true)}
        nonce={getNonce}
        onSignOut={() => signOut()}
      />
      {error && <p>Error signing in</p>}
    </>
  );
};
