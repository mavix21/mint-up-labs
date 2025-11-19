import type { AuthOptions } from "next-auth";
import { importPKCS8, SignJWT } from "jose";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { parseSiweMessage } from "viem/siwe";

import type { Id } from "@mint-up/convex/_generated/dataModel";

import { env } from "./src/env";
import { insertUserByWallet } from "./src/features/users/insert-user-by-wallet.action";

declare module "next-auth" {
  interface Session {
    convexToken: string;
    user: {
      id: Id<"users">;
      username: string;
      image: string;
      currentWalletAddress: `0x${string}`;
    };
  }

  interface User {
    id: Id<"users">;
    username: string;
    image: string;
    currentWalletAddress: `0x${string}`;
  }

  interface JWT {
    user: {
      id: Id<"users">;
      username: string;
      image: string;
      currentWalletAddress: `0x${string}`;
    };
  }
}

const CONVEX_SITE_URL = env.NEXT_PUBLIC_CONVEX_URL.replace(/.cloud$/, ".site");

function getDomainFromUrl(urlString: string | undefined): string {
  if (!urlString) {
    console.warn("NEXTAUTH_URL is not set, using localhost:3000 as fallback");
    return "localhost:3000";
  }
  try {
    const url = new URL(urlString);
    return url.host;
  } catch (error) {
    console.error("Invalid NEXTAUTH_URL:", urlString, error);
    console.warn("Using localhost:3000 as fallback");
    return "localhost:3000";
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in with Farcaster",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        name: {
          label: "Name",
          type: "text",
          placeholder: "0x0",
        },
        pfp: {
          label: "Pfp",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        const csrfToken = req?.body?.csrfToken;
        if (!csrfToken) {
          console.error("CSRF token is missing from request");
          return null;
        }
        const message = credentials?.message;
        if (!message) {
          console.error("Message is missing from request");
          return null;
        }
        const { address } = parseSiweMessage(message);

        const appClient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        if (!address) {
          console.error("Address is missing from request");
          return null;
        }

        const isValid = await appClient.verifyMessage({
          address,
          message,
          signature: credentials.signature as `0x${string}`,
        });

        if (!isValid) {
          console.error("Invalid signature");
          return null;
        }

        try {
          // const existingUser = await getUserByWallet(address);

          // // If user exists, return existing data
          // if (existingUser) {
          //   console.warn("User already linked, returning existing data", {
          //     address,
          //   });
          //   return {
          //     id: existingUser.userId,
          //     fid,
          //     name: existingUser.username,
          //     username: existingUser.username,
          //     image: existingUser.pfpUrl,
          //     currentWalletAddress:
          //       existingUser.currentWalletAddress !== undefined
          //         ? (existingUser.currentWalletAddress as `0x${string}`)
          //         : (address ?? "0x0"),
          //   };
          // }

          // // Fetch fresh data from Neynar ONLY FOR NEW USERS
          // const neynarUser = await getNeynarUser(fid);
          // if (!neynarUser) {
          //   console.error("Failed to get Neynar user", { fid });
          // }

          // const userData = {
          //   username: neynarUser?.username ?? credentials?.name ?? "",
          //   pfpUrl: neynarUser?.pfp_url ?? credentials?.pfp ?? "",
          //   bio: neynarUser?.profile.bio.text ?? "",
          //   displayName: neynarUser?.display_name ?? "",
          //   currentWalletAddress: address ?? "0x0",
          // };

          // Create user idempotently
          const userId = await insertUserByWallet({
            initializedAt: Date.now(),
            currentWalletAddress: address,
            username: credentials?.name ?? "",
            pfpUrl: credentials?.pfp ?? "",
          });

          return {
            id: userId,
            image: "",
            username: credentials?.name ?? "",
            currentWalletAddress: address,
          };
        } catch (error) {
          console.error("Error getting user", { address, error });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user = token.user as typeof session.user;
      }

      try {
        const privateKey = await importPKCS8(
          env.CONVEX_AUTH_PRIVATE_KEY,
          "RS256",
        );
        const convexToken = await new SignJWT({
          sub: session.user.id,
        })
          .setProtectedHeader({ alg: "RS256" })
          .setIssuedAt()
          .setIssuer(CONVEX_SITE_URL)
          .setAudience("convex")
          .setExpirationTime("1h")
          .sign(privateKey);

        session.convexToken = convexToken;
      } catch (error) {
        console.error("Error generating convex token", { error });
      }

      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
        token.name = user.name;
        token.id = user.id;
      }
      return token;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

export const getSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
};
