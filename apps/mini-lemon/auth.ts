import type { AuthOptions } from "next-auth";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { importPKCS8, SignJWT } from "jose";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { parseSiweMessage } from "viem/siwe";

import type { Id } from "@mint-up/convex/_generated/dataModel";

import { env } from "./src/env";
import { getUserByFid } from "./src/features/users/get-user-by-fid";
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
        method: {
          label: "Method",
          type: "text",
          placeholder: "farcaster",
        },
      },
      async authorize(credentials, req) {
        const csrfToken = req.body?.csrfToken as string | undefined;
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

        if (credentials?.method === "farcaster") {
          console.log("Using Farcaster authentication method");
          const appClient = createAppClient({
            ethereum: viemConnector(),
          });

          const domain = getDomainFromUrl(env.NEXTAUTH_URL);

          const verifyResponse = await appClient.verifySignInMessage({
            message,
            signature: credentials?.signature as `0x${string}`,
            domain,
            nonce: csrfToken,
          });
          const { success, fid, error } = verifyResponse;

          if (!success) {
            console.error("Failed to verify sign in message", {
              error,
            });
            return null;
          }

          const existingUser = await getUserByFid(fid);
          if (!existingUser) {
            console.error("No user found for given FID", { fid });
            return null;
          }

          return {
            id: existingUser.userId,
            image: existingUser.pfpUrl,
            currentWalletAddress:
              existingUser.currentWalletAddress as `0x${string}`,
            username: existingUser.username,
          };
        }

        const appClient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        if (!address) {
          console.error("Address is missing from the message");
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
          // Create user idempotently
          const userId = await insertUserByWallet({
            initializedAt: Date.now(),
            currentWalletAddress: address,
            username: credentials?.name ?? "Anon",
            pfpUrl: credentials?.pfp ?? "",
          });

          return {
            id: userId,
            image: "",
            username: credentials?.name ?? "Anon",
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
