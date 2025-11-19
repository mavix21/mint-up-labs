import "server-only";

import { api } from "@mint-up/convex/_generated/api";
import { fetchQuery } from "@mint-up/convex/nextjs";

export async function getUserByFid(fid: number) {
  return await fetchQuery(api.users.getUserByFid, {
    fid,
  });
}
