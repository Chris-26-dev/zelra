import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { auth } from "../auth";

// Shared authorization helpers. Every check derives the caller from the auth
// identity and the workspace from stored documents, never from client input.
//
// `get*` helpers return null when access is denied (for queries that return
// empty results); `require*` helpers throw (for mutations).

export const unauthorized = () => new Error("Unauthorized");

export const requireUserId = async (ctx: QueryCtx) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
        throw unauthorized();
    }

    return userId;
};

export const getMembership = (
    ctx: QueryCtx,
    workspaceId: Id<"workspaces">,
    userId: Id<"users">,
) => {
    return ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
            q.eq("workspaceId", workspaceId).eq("userId", userId),
        )
        .unique();
};

/** The caller's membership in a workspace, or null if signed out or not a member. */
export const getCurrentMember = async (ctx: QueryCtx, workspaceId: Id<"workspaces">) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
        return null;
    }

    return getMembership(ctx, workspaceId, userId);
};

export const requireMember = async (ctx: QueryCtx, workspaceId: Id<"workspaces">) => {
    const member = await getCurrentMember(ctx, workspaceId);

    if (!member) {
        throw unauthorized();
    }

    return member;
};

export const requireAdmin = async (ctx: QueryCtx, workspaceId: Id<"workspaces">) => {
    const member = await requireMember(ctx, workspaceId);

    if (member.role !== "admin") {
        throw unauthorized();
    }

    return member;
};

export const isParticipant = (conversation: Doc<"conversations">, memberId: Id<"members">) =>
    conversation.memberOneId === memberId || conversation.memberTwoId === memberId;

export type ScopeAccess =
    | { kind: "channel"; workspaceId: Id<"workspaces">; member: Doc<"members">; channel: Doc<"channels"> }
    | { kind: "conversation"; workspaceId: Id<"workspaces">; member: Doc<"members">; conversation: Doc<"conversations"> };

/** Caller may read and post in the channel: member of the channel's workspace. */
export const getChannelAccess = async (
    ctx: QueryCtx,
    channelId: Id<"channels">,
): Promise<ScopeAccess | null> => {
    const channel = await ctx.db.get(channelId);

    if (!channel) {
        return null;
    }

    const member = await getCurrentMember(ctx, channel.workspaceId);

    if (!member) {
        return null;
    }

    return { kind: "channel", workspaceId: channel.workspaceId, member, channel };
};

/** Caller may read and post in the DM: member of its workspace and one of its two participants. */
export const getConversationAccess = async (
    ctx: QueryCtx,
    conversationId: Id<"conversations">,
): Promise<ScopeAccess | null> => {
    const conversation = await ctx.db.get(conversationId);

    if (!conversation) {
        return null;
    }

    const member = await getCurrentMember(ctx, conversation.workspaceId);

    if (!member || !isParticipant(conversation, member._id)) {
        return null;
    }

    return { kind: "conversation", workspaceId: conversation.workspaceId, member, conversation };
};

/**
 * Caller may see the message: authorized for the channel or conversation it
 * lives in. The message's own `workspaceId` is not trusted, because older rows
 * could have been written with a mismatched workspace.
 */
export const getMessageAccess = async (ctx: QueryCtx, message: Doc<"messages">) => {
    if (message.channelId && !message.conversationId) {
        return getChannelAccess(ctx, message.channelId);
    }

    if (message.conversationId && !message.channelId) {
        return getConversationAccess(ctx, message.conversationId);
    }

    return null;
};
