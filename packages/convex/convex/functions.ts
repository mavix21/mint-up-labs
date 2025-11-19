// start using Triggers, with table types from schema.ts
// const triggers = new Triggers<DataModel>();

// // Register trigger for registrations table to automatically update event metadata
// triggers.register('registrations', async (ctx, change) => {
//   console.log('Registration changed:', change);

//   // Get the eventId from the registration change
//   const eventId = change.newDoc?.eventId || change.oldDoc?.eventId;
//   if (!eventId) return;

//   const event = await ctx.db.get(eventId);
//   if (!event) throw new Error('Event not found');

//   const registrationCount = event.registrationCount + 1;

//   const registrations = await ctx.db
//     .query('registrations')
//     .withIndex('by_event', (q) => q.eq('eventId', eventId))
//     .collect();

//   // Get recent registrations (last 5) with user details
//   const recentRegistrations = await Promise.all(
//     registrations
//       .slice(-5)
//       .reverse()
//       .map(async (registration) => {
//         const user = await ctx.db.get(registration.userId);
//         return {
//           userId: registration.userId,
//           pfpUrl: user?.pfpUrl ?? undefined,
//           displayName: user?.displayName ?? 'Anonymous',
//           registrationTime: registration._creationTime,
//         };
//       })
//   );

//   // Update the event with new metadata
//   await ctx.db.patch(eventId, {
//     registrationCount: event.registrationCount++,
//     recentRegistrations,
//   });
// });

// create wrappers that replace the built-in `mutation` and `internalMutation`
// the wrappers override `ctx` so that `ctx.db.insert`, `ctx.db.patch`, etc. run registered trigger functions
// export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
// export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
