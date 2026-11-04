import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { getCurrentMember, requireAdmin } from "./lib/access";

export const remove = mutation({
    args: {
        id: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const channel = await ctx.db.get(args.id);
        
        if (!channel) {
            throw new Error("Channel not found")
        }

        await requireAdmin(ctx, channel.workspaceId);

        const [messages] = await Promise.all([
            ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
                .collect(),
        ]);

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        await ctx.db.delete(args.id);

        return args.id;
    },
});

export const update = mutation({
    args: {
        id: v.id("channels"),
        name: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const channel = await ctx.db.get(args.id);
        
        if (!channel) {
            throw new Error("Channel not found")
        }

        await requireAdmin(ctx, channel.workspaceId);

        await ctx.db.patch(args.id, {
            name: args.name,
        });

        return args.id;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        await requireAdmin(ctx, args.workspaceId);

        const parsedName = args.name
            .replace(/\s+/g, "-")
            .toLowerCase();

        const channelId = await ctx.db.insert("channels", {
            name: parsedName,
            workspaceId: args.workspaceId,
        });


        return channelId;
    },
});

export const getById = query({
    args: {
        id: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return null;
        }

        const channel = await ctx.db.get(args.id);

        if (!channel) {
            return null;
        }

        const member = await getCurrentMember(ctx, channel.workspaceId);

        if (!member) {
            return null;
        }

        return channel;
    },
});

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return [];
        }

        const member = await getCurrentMember(ctx, args.workspaceId);

        if (!member) {
            return [];
        }

        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) =>
                q.eq("workspaceId", args.workspaceId),
            )
            .collect();

        return channels;
    },
});