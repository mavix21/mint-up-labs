import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import type { ResolveFarcasterUserResult } from "better-auth-siwf";
import type { Address, Hex } from "viem";
import { betterAuth } from "better-auth";
import { siwf } from "better-auth-siwf";
import { generateRandomString } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { siwe } from "better-auth/plugins";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";

import siweWalletAgnostic from "@mint-up/better-auth-siwe-wallet-agnostic";

export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address?: string;
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: {
      eth_address: `0x${string}`;
      sol_address: string;
    };
  };
}

export interface NeynarBulkUsersResponse {
  users: NeynarUser[];
}

interface InitAuthOptions<
  TExtraPlugins extends BetterAuthPlugin[],
  TDatabase extends BetterAuthOptions["database"],
> {
  baseUrl: string;
  secret: string | undefined;
  optionsOnly?: boolean;
  database?: TDatabase;
  extraPlugins?: TExtraPlugins;
  trustedOrigins?: string[];
  ensLookup?: boolean;
}

const chains: Record<number, string> = {
  // Base mainnet
  8453: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
  // Base Sepolia (testnet)
  84532: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
};

const getPublicClient = (rpcUrl: string | undefined) =>
  createPublicClient({
    transport: http(rpcUrl),
  });

function getHostname(url?: string): string {
  if (!url) return "localhost";
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}

async function lookupEns(address: Address) {
  try {
    const client = createPublicClient({ chain: mainnet, transport: http() });
    const name = await client.getEnsName({ address });
    const avatar = name ? await client.getEnsAvatar({ name }) : null;
    return { name: name ?? address, avatar: avatar ?? "" };
  } catch {
    return { name: address, avatar: "" };
  }
}

const hostname = getHostname(process.env.SITE_URL);

export const betterAuthOptions = <
  TExtraPlugins extends BetterAuthPlugin[],
  TDatabase extends BetterAuthOptions["database"],
>(
  options: InitAuthOptions<TExtraPlugins, TDatabase>,
) =>
  ({
    user: {
      additionalFields: {
        userId: {
          type: "string",
          required: false,
        },
      },
    },
    baseURL: options.baseUrl,
    database: options.database,
    secret: options.secret,
    socialProviders: {
      github: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientId: process.env.AUTH_GITHUB_ID!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
      },
    },
    plugins: [
      siwf({
        hostname,
        allowUserToLink: false,
        resolveFarcasterUser: async ({
          fid,
        }): Promise<ResolveFarcasterUserResult | null> => {
          try {
            const res = await fetch(
              `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${fid}`,
              {
                method: "GET",
                headers: {
                  "x-api-key": process.env.NEYNAR_API_KEY!,
                  "Content-Type": "application/json",
                },
              },
            );
            if (!res.ok) {
              console.error(
                `Failed to fetch Farcaster user: ${res.status} ${res.statusText}`,
              );
              return null;
            }
            const data = (await res.json()) as NeynarBulkUsersResponse;
            const user = data.users[0];
            return {
              fid,
              username: user?.username ?? "anon",
              displayName: user?.display_name ?? "Anonymous",
              avatarUrl: user?.pfp_url ?? "",
              custodyAddress: user?.custody_address ?? "",
              verifiedAddresses: {
                primary: {
                  ethAddress:
                    user?.verified_addresses?.primary.eth_address ?? "",
                  solAddress:
                    user?.verified_addresses?.primary.sol_address ?? "",
                },
                ethAddresses: user?.verified_addresses?.eth_addresses ?? [],
                solAddresses: user?.verified_addresses?.sol_addresses ?? [],
              },
            };
          } catch (e) {
            console.error("Error fetching Farcaster user:", e);
            return null;
          }
        },
      }),
      siwe({
        domain: hostname,
        getNonce: async () => {
          return Promise.resolve(generateRandomString(32, "a-z", "A-Z", "0-9"));
        },
        verifyMessage: async ({ message, signature, address, chainId }) => {
          try {
            const rpcUrl = chains[chainId];
            // Compatible with Smart Contract Accounts & EOA's via ERC-6492
            return await getPublicClient(rpcUrl).verifyMessage({
              address: getAddress(address),
              message,
              signature: signature as Hex,
            });
          } catch (e) {
            console.error("Error verifying SIWE message:", e);
            return false;
          }
        },
        ensLookup: options.ensLookup
          ? ({ walletAddress }) => lookupEns(walletAddress as Address)
          : undefined,
      }),
      siweWalletAgnostic({
        domain: hostname,
        uri: options.baseUrl,
        chains,
      }),
      nextCookies(),
      ...(options.extraPlugins ?? []),
    ],
    trustedOrigins: [
      "expo://",
      ...(process.env.SITE_URL ? [process.env.SITE_URL] : []),
      ...(options.trustedOrigins ?? []),
    ],
    logger: { disabled: options.optionsOnly },
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR:", { error, ctx });
      },
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
  }) satisfies BetterAuthOptions;

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[],
  TDatabase extends BetterAuthOptions["database"],
>(options: InitAuthOptions<TExtraPlugins, TDatabase>) {
  const config = betterAuthOptions(options);

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
