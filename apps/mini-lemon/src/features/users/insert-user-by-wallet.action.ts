"use server";

import { api } from "@mint-up/convex/_generated/api";
import { fetchMutation } from "@mint-up/convex/nextjs";

interface InsertUserByFidArgs {
  username: string;
  pfpUrl: string;
  displayName?: string;
  bio?: string;
  currentWalletAddress: string;
  initializedAt?: number | undefined;
}

export async function insertUserByWallet({
  currentWalletAddress,
  username,
  pfpUrl,
  displayName,
  bio,
}: InsertUserByFidArgs) {
  const normalizedCurrentWalletAddress = currentWalletAddress.toLowerCase();

  return await fetchMutation(api.users.insertUserByWallet, {
    currentWalletAddress: normalizedCurrentWalletAddress,
    username,
    pfpUrl,
    displayName,
    bio,
  });
}
