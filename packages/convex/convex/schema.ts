import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { authTables } from "./tables/authTables";
import { connectionsTable } from "./tables/connections";
import { eventCommunicationsTable } from "./tables/eventCommunications";
import { eventsTable } from "./tables/events";
import { linkedAccountsTable } from "./tables/linkedAccounts";
import { notificationTokensTable } from "./tables/notificationTokens";
import { organizationMembersTable } from "./tables/organizationMembers";
import { organizationsTable } from "./tables/organizations";
import { poapTemplatesTable } from "./tables/poapTemplates";
import { registrationsTable } from "./tables/registrations";
import { ticketTemplatesTable } from "./tables/ticketTemplates";
import { usersTable } from "./tables/user";

const schema = defineSchema({
  users: usersTable,
  linkedAccounts: linkedAccountsTable,
  organizations: organizationsTable,
  organizationMembers: organizationMembersTable,
  events: eventsTable,
  eventCommunications: eventCommunicationsTable,
  ticketTemplates: ticketTemplatesTable,
  poapTemplates: poapTemplatesTable,
  registrations: registrationsTable,
  notificationTokens: notificationTokensTable,
  connections: connectionsTable,
  ...authTables,
});

export default schema;

export const vv = typedV(schema);
