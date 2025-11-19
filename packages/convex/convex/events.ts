import { v } from 'convex/values';

import { internal } from './_generated/api';
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
  QueryCtx,
} from './_generated/server';
import { mutation } from './_generated/server';
import { vv } from './schema';
import { omit } from 'convex-helpers';
import { Doc, Id } from './_generated/dataModel';
import { base, baseSepolia } from 'viem/chains'; // Usa la red correcta
import { abi } from '../../app/shared/lib/abi';
import { pinata } from '../../app/shared/lib/pinata.config';

import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, decodeEventLog, http, parseUnits } from 'viem';
import { pick } from 'convex-helpers';

const CHAIN = process.env.ENV === 'production' ? base : baseSepolia;
// const CHAIN = base;

// --- CONSTANTES ---
const CONTRACT_ADDRESS = process.env.MINTUP_FACTORY_CONTRACT_ADDRESS as `0x${string}`;

// --- HELPERS DE VIEM ---
// Creamos los clientes de Viem una sola vez para reutilizarlos.
const account = privateKeyToAccount(process.env.BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(process.env.BASE_RPC_URL),
});

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.BASE_RPC_URL),
});

// Shared helper function to enrich events with common data
async function enrichEventsWithCommonData(
  ctx: QueryCtx,
  events: Doc<'events'>[],
  userId: Id<'users'> | null
) {
  // Get user registrations if userId is provided
  let userRegistrations: Doc<'registrations'>[] = [];
  if (userId) {
    userRegistrations = await ctx.db
      .query('registrations')
      .withIndex('by_user_and_event', (q) => q.eq('userId', userId))
      .collect();
  }

  return Promise.all(
    events.map(async (event) => {
      const user = await ctx.db.get(event.creatorId);
      const imageUrl = (await ctx.storage.getUrl(event.image)) ?? null;

      // Get tickets for this event
      const tickets = await ctx.db
        .query('ticketTemplates')
        .withIndex('by_eventId', (q) => q.eq('eventId', event._id))
        .collect();

      const isHost = userId ? event.creatorId === userId : false;

      // Get user status if userId is provided
      let userStatus = null;
      if (userId && !isHost) {
        const registration = userRegistrations.find((reg) => reg.eventId === event._id);
        if (registration) {
          userStatus = registration.status.type;
        }
      }

      return {
        ...event,
        imageUrl,
        tickets,
        creator: {
          name: user?.displayName ?? 'Anonymous',
          username: user?.username ?? 'Anonymous',
          imageUrl: user?.pfpUrl ?? null,
        },
        isHost,
        userStatus,
      };
    })
  );
}

export const getAllEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query('events').order('desc').collect();
    return enrichEventsWithCommonData(ctx, events, null);
  },
});

export const getUpcomingEvents = query({
  handler: async (ctx) => {
    const today = Date.now();
    const events = await ctx.db
      .query('events')
      .withIndex('by_startDate', (q) => q.gt('startDate', today))
      .order('desc')
      .collect();
    return enrichEventsWithCommonData(ctx, events, null);
  },
});

export const getPastEvents = query({
  handler: async (ctx) => {
    const today = Date.now();
    const events = await ctx.db
      .query('events')
      .withIndex('by_startDate', (q) => q.lte('startDate', today))
      .order('desc')
      .collect();
    return enrichEventsWithCommonData(ctx, events, null);
  },
});

export const getEventById = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      const userId = identity !== null ? (identity.subject as Id<'users'>) : null;

      // Try to get the event by ID, but handle invalid IDs gracefully
      let event = null;
      try {
        event = await ctx.db
          .query('events')
          .withIndex('by_id', (q) => q.eq('_id', args.eventId as Id<'events'>))
          .first();
      } catch (idError) {
        // If the ID is invalid, return null instead of throwing
        console.log('Invalid event ID provided:', args.eventId);
        return null;
      }

      if (!event) {
        return null;
      }

      return enrichEventsWithCommonData(ctx, [event], userId).then((e) => e[0]);
    } catch (error) {
      console.error('Error getting event by id:', error);
      return null;
    }
  },
});

export const getEventMetadata = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Try to get the event by ID, but handle invalid IDs gracefully
      const event = await ctx.db.get(args.eventId as Id<'events'>);
      if (!event) {
        return null;
      }

      return {
        ...event,
        imageUrl: (await ctx.storage.getUrl(event.image)) ?? null,
      };
    } catch (idError) {
      // If the ID is invalid, return null instead of throwing
      console.log('Invalid event ID provided for metadata:', args.eventId);
      return null;
    }
  },
});

export const searchEvents = query({
  args: {
    searchTerm: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity !== null ? (identity.subject as Id<'users'>) : null;

    const now = Date.now();
    let events: Doc<'events'>[];

    // Use search index for efficient full-text search with relevance ranking
    if (args.searchTerm && args.searchTerm.trim() !== '') {
      // Use search index with search expression and category filter
      if (args.category && args.category !== 'All') {
        events = await ctx.db
          .query('events')
          .withSearchIndex('search_events', (q) =>
            q.search('name', args.searchTerm!).eq('category', args.category as any)
          )
          .filter((q) =>
            q.or(
              // Events that haven't started yet
              q.gte(q.field('startDate'), now),
              // Events that are currently happening
              q.and(q.lte(q.field('startDate'), now), q.gte(q.field('endDate'), now))
            )
          )
          .collect();
      } else {
        // Search without category filter
        events = await ctx.db
          .query('events')
          .withSearchIndex('search_events', (q) => q.search('name', args.searchTerm!))
          .filter((q) =>
            q.or(
              // Events that haven't started yet
              q.gte(q.field('startDate'), now),
              // Events that are currently happening
              q.and(q.lte(q.field('startDate'), now), q.gte(q.field('endDate'), now))
            )
          )
          .collect();
      }
    } else {
      // No search term, just filter by category if specified
      let q = ctx.db.query('events');
      if (args.category && args.category !== 'All') {
        q = q.filter((q) => q.eq(q.field('category'), args.category));
      }
      events = await q
        .filter((q) =>
          q.or(
            // Events that haven't started yet
            q.gte(q.field('startDate'), now),
            // Events that are currently happening
            q.and(q.lte(q.field('startDate'), now), q.gte(q.field('endDate'), now))
          )
        )
        .order('desc')
        .collect();
    }

    return enrichEventsWithCommonData(ctx, events, userId);
  },
});

export const createEvent = mutation({
  args: {
    event: v.object(
      omit(vv.doc('events').fields, [
        '_id',
        '_creationTime',
        'creatorId',
        'registrationCount',
        'recentRegistrations',
      ])
    ),
    tickets: v.array(
      v.object({
        ...pick(vv.doc('ticketTemplates').fields, [
          'name',
          'description',
          'totalSupply',
          'isApprovalRequired',
        ]),
        ticketType: v.union(
          v.object({ type: v.literal('offchain') }),
          v.object({
            type: v.literal('onchain'),
            price: v.object({
              amount: v.number(),
              currency: v.union(v.literal('USDC')),
            }),
            imageUrl: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(identity.subject as Id<'users'>);
    if (!user) {
      throw new Error('User not found');
    }
    const eventId = await ctx.db.insert('events', {
      ...args.event,
      creatorId: user._id,
      hosts: [
        ...args.event.hosts,
        {
          userId: user._id,
          role: 'creator',
        },
      ],
      registrationCount: 0,
      recentRegistrations: [],
    });

    const onchainTickets = args.tickets.filter(
      (
        ticket
      ): ticket is Doc<'ticketTemplates'> & {
        ticketType: {
          type: 'onchain';
          price: { amount: number; currency: string };
          imageUrl: string;
        };
      } => ticket.ticketType.type === 'onchain'
    );
    const offchainTickets = args.tickets.filter(
      (ticket): ticket is Doc<'ticketTemplates'> & { ticketType: { type: 'offchain' } } =>
        ticket.ticketType.type === 'offchain'
    );

    await Promise.all(
      offchainTickets.map((ticket) =>
        ctx.db.insert('ticketTemplates', {
          ...ticket,
          eventId,
        })
      )
    );

    const onchainTicketTemplateIds = await Promise.all(
      onchainTickets.map((ticket) =>
        ctx.db.insert('ticketTemplates', {
          ...ticket,
          eventId,
          ticketType: {
            type: 'onchain',
            price: ticket.ticketType.price,
            syncStatus: { status: 'pending' },
          },
        })
      )
    );

    if (onchainTickets.length === 0) return eventId;

    await ctx.scheduler.runAfter(0, internal.events.createEventOnchain, {
      convexEventId: eventId,
      convexTicketTemplateIds: onchainTicketTemplateIds,
      organizerAddress: user.currentWalletAddress ?? '',
      ticketsData: onchainTickets,
    });

    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id('events'),
    event: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      category: v.optional(vv.doc('events').fields.category),
      location: v.optional(
        v.union(
          v.object({
            type: v.literal('online'),
            url: v.string(),
          }),
          v.object({
            type: v.literal('in-person'),
            address: v.string(),
            instructions: v.optional(v.string()),
          })
        )
      ),
      visibility: v.optional(v.union(v.literal('public'), v.literal('unlisted'))),
      theme: v.optional(v.string()),
      image: v.optional(v.id('_storage')),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const existing = await ctx.db.get(args.eventId);
    if (!existing) throw new Error('Event not found');

    // Optionally restrict to creator/hosts; for now, allow creator only
    if (existing.creatorId !== (identity.subject as Id<'users'>)) {
      throw new Error('Forbidden');
    }

    await ctx.db.patch(args.eventId, {
      ...args.event,
    });

    return args.eventId;
  },
});

export const getUserEvents = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject as Id<'users'>;

    // Get events where user is creator/host
    const hostedEvents = await ctx.db
      .query('events')
      .withIndex('by_creatorId', (q) => q.eq('creatorId', userId))
      .collect();

    // Get events where user has registered
    const userRegistrations = await ctx.db
      .query('registrations')
      .withIndex('by_user_and_event', (q) => q.eq('userId', userId))
      .collect();

    const registeredEventIds = userRegistrations.map((reg) => reg.eventId);

    // Get registered events (excluding already fetched hosted events)
    const registeredEvents = await Promise.all(
      registeredEventIds
        .filter((eventId) => !hostedEvents.some((event) => event._id === eventId))
        .map(async (eventId) => {
          return await ctx.db.get(eventId);
        })
    );

    // Combine and deduplicate events
    const allEvents = [...hostedEvents, ...registeredEvents.filter(Boolean)].filter(
      (event) => event !== null
    );

    // Enrich events with common data (including isHost and userStatus)
    return enrichEventsWithCommonData(ctx, allEvents, userId);
  },
});

export const createEventOnchain = internalAction({
  args: {
    convexEventId: v.id('events'),
    convexTicketTemplateIds: v.array(v.id('ticketTemplates')),
    organizerAddress: v.string(),
    ticketsData: v.array(
      v.object({
        ...pick(vv.doc('ticketTemplates').fields, [
          'name',
          'description',
          'totalSupply',
          'isApprovalRequired',
        ]),
        ticketType: v.object({
          type: v.literal('onchain'),
          price: v.object({
            amount: v.number(),
            currency: v.union(v.literal('USDC')),
          }),
          imageUrl: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (!process.env.BACKEND_SIGNER_PRIVATE_KEY || !process.env.BASE_RPC_URL || !CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables for on-chain interaction.');
    }

    try {
      // Upload metadata for each ticket
      const ticketParams = await Promise.all(
        args.ticketsData.map(async (t) => {
          let metadataURI = '';
          try {
            const upload = await pinata.upload.public.json({
              name: t.name,
              description: t.description,
              image: t.ticketType.imageUrl,
              attributes: [
                {
                  trait_type: 'Type',
                  value: t.name,
                },
              ],
            });
            metadataURI = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${upload.cid}`;
          } catch (error) {
            console.error('Error uploading metadata to Pinata:', error);
            metadataURI = t.ticketType.imageUrl;
          }

          return {
            priceETH: 0n,
            priceUSDC:
              t.ticketType.price.currency === 'USDC'
                ? parseUnits(t.ticketType.price.amount.toString(), 6)
                : 0n,
            maxSupply: BigInt(t.totalSupply || 0),
            mintsPerWallet: 1n, // TODO: organizer should be able to set this
            metadataURI,
          };
        })
      );

      console.log(`[Event: ${args.convexEventId}] Simulating contract call...`);
      const { request } = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: 'createEventWithTickets',
        args: [args.organizerAddress as `0x${string}`, ticketParams],
      });

      console.log(`[Event: ${args.convexEventId}] Sending transaction...`);
      const txHash = await walletClient.writeContract(request);
      console.log(
        `[Event: ${args.convexEventId}] Transaction sent with hash: ${txHash}. Waiting for receipt...`
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted.');
      }

      let onchainEventId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({ abi: abi, data: log.data, topics: log.topics });
          if (decodedLog.eventName === 'EventCreated') {
            onchainEventId = (decodedLog.args as any).eventId.toString();
            break;
          }
        } catch {
          throw new Error('Error inside trying read receipt.log');
        }
      }

      if (!onchainEventId) {
        throw new Error('Could not find EventCreated log in transaction receipt');
      }

      console.log(
        `[Event: ${args.convexEventId}] On-chain event created with ID: ${onchainEventId}.`
      );

      const ticketUpdates = args.convexTicketTemplateIds.map((templateId, index) => {
        const ticketIndex = BigInt(index);
        const tokenId = (BigInt(onchainEventId as string) << 128n) | ticketIndex;
        return {
          templateId: templateId,
          tokenId: tokenId.toString(),
          metadataURI: ticketParams[index].metadataURI,
        };
      });

      await ctx.runMutation(internal.events.finalizeOnchainSync, {
        convexEventId: args.convexEventId,
        onchainEventId: onchainEventId,
        contractAddress: CONTRACT_ADDRESS,
        chainId: CHAIN.id,
        ticketUpdates,
      });

      console.log(`[Event: ${args.convexEventId}] Successfully synced on-chain data to Convex.`);
    } catch (error) {
      console.error(`[Event: ${args.convexEventId}] On-chain sync failed:`, error);
      throw error;
    }
  },
});

export const finalizeOnchainSync = internalMutation({
  args: {
    convexEventId: v.id('events'),
    onchainEventId: v.string(),
    contractAddress: v.string(),
    chainId: v.number(),
    ticketUpdates: v.array(
      v.object({
        templateId: v.id('ticketTemplates'),
        tokenId: v.string(),
        metadataURI: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.convexEventId, {
      onchainData: {
        status: 'synced',
        eventId: args.onchainEventId,
        contractAddress: args.contractAddress,
        chainId: args.chainId,
      },
    });

    await Promise.all(
      args.ticketUpdates.map(async (update) => {
        const currentTemplate = await ctx.db.get(update.templateId);
        if (currentTemplate && currentTemplate.ticketType.type === 'onchain') {
          return ctx.db.patch(update.templateId, {
            ticketType: {
              ...currentTemplate.ticketType,
              syncStatus: {
                status: 'synced',
                tokenId: update.tokenId,
                contractAddress: args.contractAddress,
                chainId: args.chainId,
                nft: {
                  metadataURI: update.metadataURI,
                },
              },
            },
          });
        }
      })
    );
  },
});

// Query interna para obtener eventos próximos (sin cambios)
export const getUpcoming = internalQuery({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('events')
      .withIndex('by_startDate', (q) =>
        q.gte('startDate', args.startTime).lte('startDate', args.endTime)
      )
      .collect();
  },
});

// La función principal que se ejecuta con el Cron Job
export const sendReminderNotification = internalAction({
  args: {
    registrationId: v.id('registrations'),
    eventId: v.id('events'),
    userId: v.id('users'),
  },
  handler: async (ctx, { registrationId, eventId, userId }) => {
    // 1. Verificación de Seguridad: ¿El usuario sigue registrado?
    const registration = await ctx.runQuery(internal.registrations.get, { registrationId });
    if (!registration) {
      console.log(
        `Cancelando notificación: El usuario (ID: ${userId}) ya no está registrado en el evento (ID: ${eventId}).`
      );
      return; // El usuario canceló, no se envía nada.
    }

    // 2. Obtener la información necesaria para la notificación
    const event = await ctx.runQuery(internal.events.get, { eventId });
    const user = await ctx.runQuery(internal.users.get, { userId });
    const fid = await ctx.runQuery(internal.linkedAccounts.getFidByUserId, { userId });

    if (!event || !user || !fid) {
      console.error('No se pudo obtener la información completa del evento o del usuario.');
      return;
    }

    const tokenData = await ctx.runQuery(internal.notificationTokens.get, { fid: fid.toString() });

    if (!tokenData) {
      console.log(`No se encontró token de notificación para el usuario con FID: ${fid}`);
      return;
    }

    // 3. Enviar la notificación
    const { notificationUrl, token } = tokenData;
    const title = `Reminder! "${event.name}" starts soon ✨`;
    const body = `Your event starts in 30 minutes. See you there!`;

    console.log(`Enviando recordatorio a FID: ${fid} para el evento: ${event.name}`);

    try {
      const response = await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          body,
          notificationId: crypto.randomUUID(),
          targetUrl: 'https://mint-up-mini.vercel.app',
          tokens: [token],
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al enviar la notificación: ${response.status} - ${errorText}`);
      } else {
        console.log('Notificación de recordatorio enviada exitosamente.');
      }
    } catch (error) {
      console.error('Error en la llamada fetch para la notificación:', error);
    }
  },
});

export const get = internalQuery({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => await ctx.db.get(args.eventId),
});
