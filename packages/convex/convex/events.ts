import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { query, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

type EventUserStatus =
  | {
      type: "unauthenticated";
    }
  | {
      type: "host";
    }
  | {
      type: "registered";
      status: Doc<"registrations">["status"]["type"];
    }
  | {
      type: "not_registered";
    };

/**
 * Filter expression for active or upcoming events.
 * Returns true if the event hasn't started yet OR is currently happening.
 */
const isActiveOrUpcomingEvent = <
  T extends { startDate: number; endDate: number },
>(
  q: {
    or: (...args: any[]) => any;
    and: (...args: any[]) => any;
    gte: (field: any, value: number) => any;
    lte: (field: any, value: number) => any;
    field: (name: keyof T) => any;
  },
  now: number,
) =>
  q.or(
    // Events that haven't started yet
    q.gte(q.field("startDate"), now),
    // Events that are currently happening
    q.and(q.lte(q.field("startDate"), now), q.gte(q.field("endDate"), now)),
  );

async function enrichEventsWithCommonData(
  ctx: QueryCtx,
  events: Doc<"events">[],
  userId: Id<"users"> | null,
) {
  return Promise.all(
    events.map(async (event) => {
      const user = await ctx.db.get(event.creatorId);
      if (!user) {
        throw new Error("Event creator not found");
      }
      const imageUrl = await ctx.storage.getUrl(event.image);
      const authUser = await authComponent.getAnyUserById(ctx, user.authId);

      const tickets = await ctx.db
        .query("ticketTemplates")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      const isHost = userId ? event.creatorId === userId : false;

      let userStatus: EventUserStatus;

      if (!userId) {
        userStatus = { type: "unauthenticated" };
      } else if (isHost) {
        userStatus = { type: "host" };
      } else {
        const registration = await ctx.db
          .query("registrations")
          .withIndex("by_user_and_event", (q) =>
            q.eq("userId", userId).eq("eventId", event._id),
          )
          .first();
        if (registration) {
          userStatus = { type: "registered", status: registration.status.type };
        } else {
          userStatus = { type: "not_registered" };
        }
      }

      return {
        ...event,
        imageUrl,
        tickets,
        creator: {
          name: authUser?.name ?? "Unknown",
          imageUrl: authUser?.image ?? null,
        },
        userStatus,
      };
    }),
  );
}

export const getUpcomingEvents = query({
  handler: async (ctx) => {
    const today = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_startDate", (q) => q.gt("startDate", today))
      .collect();

    return enrichEventsWithCommonData(ctx, events, null);
  },
});

export const searchEvents = query({
  args: {
    searchTerm: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { searchTerm, category }) => {
    const currentAuthUser = await authComponent.getAuthUser(ctx);
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", currentAuthUser?._id || ""))
      .first();

    const now = Date.now();
    let events: Doc<"events">[];

    const hasSearchTerm = searchTerm && searchTerm.trim() !== "";
    const hasCategory = category && category !== "all" && category !== "All";

    if (hasSearchTerm) {
      const searchQuery = hasCategory
        ? ctx.db
            .query("events")
            .withSearchIndex("search_events", (q) =>
              q.search("name", searchTerm).eq("category", category as any),
            )
        : ctx.db
            .query("events")
            .withSearchIndex("search_events", (q) =>
              q.search("name", searchTerm),
            );

      events = await searchQuery
        .filter((q) => isActiveOrUpcomingEvent(q, now))
        .collect();
    } else {
      const baseQuery = ctx.db.query("events");

      events = await (
        hasCategory
          ? baseQuery.filter((q) =>
              q.and(
                q.eq(q.field("category"), category),
                isActiveOrUpcomingEvent(q, now),
              ),
            )
          : baseQuery.filter((q) => isActiveOrUpcomingEvent(q, now))
      )
        .order("desc")
        .collect();
    }

    return enrichEventsWithCommonData(ctx, events, currentUser?._id || null);
  },
});
