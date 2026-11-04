import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import {
    getChannelAccess,
    getConversationAccess,
    getCurrentMember,
    getMessageAccess,
    requireUserId,
    unauthorized,
} from "./lib/access";
import { toPublicUser } from "./lib/users";

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
    const messages = await ctx.db
        .query("messages")
        .withIndex("by_parent_message_id", (q) =>
            q.eq("parentMessageId", messageId)
        )
        .collect();

    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

    if (!lastMessageMember) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

    return {
        count: messages.length,
        image: lastMessageUser?.image,
        timestamp: lastMessage._creationTime,
        name: lastMessageUser?.name,
    };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
    return ctx.db
        .query("reactions")
        .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
        .collect();
};

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
    return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
    return ctx.db.get(memberId);
};

/**
 * Resolve which channel or conversation a messages.get call may read.
 * Returns null when the caller is not allowed, or the arguments do not
 * describe one consistent scope.
 */
const getReadScope = async (
    ctx: QueryCtx,
    args: {
        channelId?: Id<"channels">;
        conversationId?: Id<"conversations">;
        parentMessageId?: Id<"messages">;
    },
) => {
    if (args.channelId && args.conversationId) {
        return null;
    }

    const parentMessage = args.parentMessageId ? await ctx.db.get(args.parentMessageId) : null;

    if (args.parentMessageId && !parentMessage) {
        return null;
    }

    if (args.channelId) {
        const access = await getChannelAccess(ctx, args.channelId);

        if (!access || (parentMessage && parentMessage.channelId !== args.channelId)) {
            return null;
        }

        return { channelId: args.channelId, conversationId: undefined };
    }

    if (args.conversationId) {
        const access = await getConversationAccess(ctx, args.conversationId);

        if (!access || (parentMessage && parentMessage.conversationId !== args.conversationId)) {
            return null;
        }

        return { channelId: undefined, conversationId: args.conversationId };
    }

    //Only possible if we are opening a thread in a 1:1 conversation: the parent defines the scope
    if (parentMessage) {
        const access = await getMessageAccess(ctx, parentMessage);

        if (!access) {
            return null;
        }

        return { channelId: parentMessage.channelId, conversationId: parentMessage.conversationId };
    }

    return null;
};

export const remove = mutation({
    args: {
        id: v.id("messages"),
    },
    handler: async (ctx, args) => {
        await requireUserId(ctx);

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found");
        }

        const member = await getCurrentMember(ctx, message.workspaceId);

        if (!member || member._id !== message.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);

        return args.id;
    },
});

export const update = mutation({
    args: {
        id: v.id("messages"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        await requireUserId(ctx);

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found");
        }

        const member = await getCurrentMember(ctx, message.workspaceId);

        if (!member || member._id !== message.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            body: args.body,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

export const getById = query({
    args: { id: v.id("messages") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return null;
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            return null;
        }

        const access = await getMessageAccess(ctx, message);

        if (!access) {
            return null;
        }

        const member = await populateMember(ctx, message.memberId);

        if (!member) {
            return null;
        }

        const user = await populateUser(ctx, member.userId);

        if (!user) {
            return null;
        }

        const reactions = await populateReactions(ctx, message._id);

        const reactionWithCounts = reactions.map((reaction) => {
            return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value).length,
            };
        });


        const dedupedReactions = reactionWithCounts.reduce(
            (acc, reaction) => {
                const existingReaction = acc.find(
                    (r) => r.value === reaction.value,
                );

                if (existingReaction) {
                    existingReaction.memberIds = Array.from(
                        new Set([...existingReaction.memberIds, reaction.memberId])
                    );
                } else {
                    acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }

                return acc;
            },
            [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
            })[]
        );

        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
            ({ memberId, ...rest }) => rest,
        );


        return {
            ...message,
            image: message.image
                ? await ctx.storage.getUrl(message.image)
                : undefined,
            user: toPublicUser(user),
            member,
            reactions: reactionsWithoutMemberIdProperty,
        };
    },
});

export const get = query({
    args: {
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        await requireUserId(ctx);

        const scope = await getReadScope(ctx, args);

        //Not allowed (or not a valid scope): answer like an empty channel instead of failing the page
        if (!scope) {
            return { page: [], isDone: true, continueCursor: "" };
        }

        const results = await ctx.db
            .query("messages")
            .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
                q
                    .eq("channelId", scope.channelId)
                    .eq("parentMessageId", args.parentMessageId)
                    .eq("conversationId", scope.conversationId)
            )
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            ...results,
            page: (
                await Promise.all(
                    results.page.map(async (message) => {
                        const member = await populateMember(ctx, message.memberId);
                        const user = member ? await populateUser(ctx, member.userId) : null;

                        if (!member || !user) {
                            return null;
                        }

                        const reactions = await populateReactions(ctx, message._id);
                        const thread = await populateThread(ctx, message._id);
                        const image = message.image
                            ? await ctx.storage.getUrl(message.image)
                            : undefined;

                        const reactionWithCounts = reactions.map((reaction) => {
                            return {
                                ...reaction,
                                count: reactions.filter((r) => r.value === reaction.value).length,
                            };
                        });

                        const dedupedReactions = reactionWithCounts.reduce(
                            (acc, reaction) => {
                                const existingReaction = acc.find(
                                    (r) => r.value === reaction.value,
                                );

                                if (existingReaction) {
                                    existingReaction.memberIds = Array.from(
                                        new Set([...existingReaction.memberIds, reaction.memberId])
                                    );
                                } else {
                                    acc.push({ ...reaction, memberIds: [reaction.memberId] });
                                }

                                return acc;
                            },
                            [] as (Doc<"reactions"> & {
                                count: number;
                                memberIds: Id<"members">[];
                            })[]
                        );

                        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
                            ({ memberId, ...rest }) => rest,
                        );

                        return {
                            ...message,
                            image,
                            member,
                            user: toPublicUser(user),
                            reactions: reactionsWithoutMemberIdProperty,
                            threadCount: thread.count,
                            threadImage: thread.image,
                            threadName: thread.name,
                            threadTimestamp: thread.timestamp,
                        };
                    })
                )
            ).filter(
                (message): message is NonNullable<typeof message> => message !== null
            )
        };
    },
});

export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        await requireUserId(ctx);

        let channelId = args.channelId;
        let conversationId = args.conversationId;

        if (args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("Parent message not found");
            }

            //Only possible if we are replying in a thread in 1:1 conversation: inherit the parent's scope
            if (!channelId && !conversationId) {
                channelId = parentMessage.channelId;
                conversationId = parentMessage.conversationId;
            }

            if (parentMessage.channelId !== channelId || parentMessage.conversationId !== conversationId) {
                throw new Error("Parent message belongs to a different channel or conversation");
            }
        }

        if (!!channelId === !!conversationId) {
            throw new Error("A message must target exactly one channel or conversation");
        }

        const access = channelId
            ? await getChannelAccess(ctx, channelId)
            : await getConversationAccess(ctx, conversationId!);

        //The workspace comes from the channel/conversation; the client's value must agree with it
        if (!access || access.workspaceId !== args.workspaceId) {
            throw unauthorized();
        }

        if (args.image) {
            const file = await ctx.db.system.get(args.image);

            if (!file || !file.contentType?.startsWith("image/")) {
                throw new Error("Attachment must be an image");
            }
        }

        const messageId = await ctx.db.insert("messages", {
            memberId: access.member._id,
            body: args.body,
            image: args.image,
            channelId,
            conversationId,
            workspaceId: access.workspaceId,
            parentMessageId: args.parentMessageId,
        });

        return messageId;
    },
});