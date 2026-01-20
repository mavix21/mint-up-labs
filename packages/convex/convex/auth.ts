import type { AuthFunctions } from "@convex-dev/better-auth";
import { createClient, GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, BetterAuthOptions } from "better-auth";

import { betterAuthOptions } from "@mint-up/auth";

import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/generatedSchema";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth as any,
  {
    authFunctions,
    local: {
      schema: authSchema,
    },
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          // Create app user linked to auth user
          const userId = await ctx.db.insert("users", {
            authId: authUser._id,
          });
          await ctx.runMutation(components.betterAuth.auth.setUserId, {
            authId: authUser._id,
            userId: userId,
          });
        },
      },
    },
  },
);

// Export trigger handlers - required for triggers to work
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  opts?: { optionsOnly?: boolean },
) => {
  return betterAuthOptions({
    baseUrl: siteUrl,
    database: authComponent.adapter(ctx),
    secret: process.env.BETTER_AUTH_SECRET,
    optionsOnly: opts?.optionsOnly ?? false,
    extraPlugins: [
      convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
    ],
  }) satisfies BetterAuthOptions;
};

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  opts?: { optionsOnly?: boolean },
) => {
  return betterAuth(createAuthOptions(ctx, opts));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
