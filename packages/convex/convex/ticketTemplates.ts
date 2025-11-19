import { v } from 'convex/values';
import { query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const getTicketsByEventId = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Try to get tickets by event ID, but handle invalid IDs gracefully
      const ticketTemplates = await ctx.db
        .query('ticketTemplates')
        .withIndex('by_eventId', (q) => q.eq('eventId', args.eventId as Id<'events'>))
        .collect();

      return ticketTemplates;
    } catch (idError) {
      // If the ID is invalid, return empty array instead of throwing
      console.log('Invalid event ID provided for tickets:', args.eventId);
      return [];
    }
  },
});
