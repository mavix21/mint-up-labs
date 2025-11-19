/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authAdapter from "../authAdapter.js";
import type * as communities from "../communities.js";
import type * as connections from "../connections.js";
import type * as constants_abi from "../constants/abi.js";
import type * as constants_professionalProfile from "../constants/professionalProfile.js";
import type * as events from "../events.js";
import type * as farcaster from "../farcaster.js";
import type * as http from "../http.js";
import type * as linkedAccounts from "../linkedAccounts.js";
import type * as nextjs from "../nextjs.js";
import type * as notificationTokens from "../notificationTokens.js";
import type * as organizations from "../organizations.js";
import type * as react from "../react.js";
import type * as registrations from "../registrations.js";
import type * as server from "../server.js";
import type * as storage from "../storage.js";
import type * as tables_authTables from "../tables/authTables.js";
import type * as tables_connections from "../tables/connections.js";
import type * as tables_eventCommunications from "../tables/eventCommunications.js";
import type * as tables_events from "../tables/events.js";
import type * as tables_linkedAccounts from "../tables/linkedAccounts.js";
import type * as tables_notificationTokens from "../tables/notificationTokens.js";
import type * as tables_organizationMembers from "../tables/organizationMembers.js";
import type * as tables_organizations from "../tables/organizations.js";
import type * as tables_poapTemplates from "../tables/poapTemplates.js";
import type * as tables_registrations from "../tables/registrations.js";
import type * as tables_sessions from "../tables/sessions.js";
import type * as tables_ticketTemplates from "../tables/ticketTemplates.js";
import type * as tables_user from "../tables/user.js";
import type * as ticketTemplates from "../ticketTemplates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authAdapter: typeof authAdapter;
  communities: typeof communities;
  connections: typeof connections;
  "constants/abi": typeof constants_abi;
  "constants/professionalProfile": typeof constants_professionalProfile;
  events: typeof events;
  farcaster: typeof farcaster;
  http: typeof http;
  linkedAccounts: typeof linkedAccounts;
  nextjs: typeof nextjs;
  notificationTokens: typeof notificationTokens;
  organizations: typeof organizations;
  react: typeof react;
  registrations: typeof registrations;
  server: typeof server;
  storage: typeof storage;
  "tables/authTables": typeof tables_authTables;
  "tables/connections": typeof tables_connections;
  "tables/eventCommunications": typeof tables_eventCommunications;
  "tables/events": typeof tables_events;
  "tables/linkedAccounts": typeof tables_linkedAccounts;
  "tables/notificationTokens": typeof tables_notificationTokens;
  "tables/organizationMembers": typeof tables_organizationMembers;
  "tables/organizations": typeof tables_organizations;
  "tables/poapTemplates": typeof tables_poapTemplates;
  "tables/registrations": typeof tables_registrations;
  "tables/sessions": typeof tables_sessions;
  "tables/ticketTemplates": typeof tables_ticketTemplates;
  "tables/user": typeof tables_user;
  ticketTemplates: typeof ticketTemplates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
