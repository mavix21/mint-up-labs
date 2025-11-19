import { defineSchema } from 'convex/server';

import { eventCommunicationsTable } from './tables/eventCommunications';
import { eventsTable } from './tables/events';
import { linkedAccountsTable } from './tables/linkedAccounts';
import { organizationMembersTable } from './tables/organizationMembers';
import { organizationsTable } from './tables/organizations';
import { usersTable } from './tables/user';
import { ticketTemplatesTable } from './tables/ticketTemplates';
import { registrationsTable } from './tables/registrations';
import { poapTemplatesTable } from './tables/poapTemplates';
import { notificationTokensTable } from './tables/notificationTokens';
import { connectionsTable } from './tables/connections';
import { typedV } from 'convex-helpers/validators';
import { authTables } from './tables/authTables';

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
