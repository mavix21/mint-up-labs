import "server-only";

import { api } from "@mint-up/convex/_generated/api";
import { fetchQuery } from "@mint-up/convex/nextjs";

export async function getUserByWallet(address: string) {
  return await fetchQuery(api.users.getUserByWallet, {
    address,
  });
}
