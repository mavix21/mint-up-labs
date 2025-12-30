import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { communitiesTable } from "./tables/communities";
import { eventsTable } from "./tables/events";
import { ticketTemplatesTable } from "./tables/ticketTemplates";
import { usersTable } from "./tables/users";

const schema = defineSchema({
  users: usersTable,
  communities: communitiesTable,
  events: eventsTable,
  ticketTemplates: ticketTemplatesTable,
});

export default schema;
export const vv = typedV(schema);
