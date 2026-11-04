import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";
import { getMessageAccess } from "./lib/access";

export const toggle = mutation({
    args: { messageId: v.id("messages"), value: v.string() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new Error("Message not found");
        }

        //Same rule as reading the message: channel member, or participant for a DM
        const access = await getMessageAccess(ctx, message);

        if (!access) {
            throw new Error("Unauthorized");
        }

        const member = access.member;

        const existingMessageReactionFromUser = await ctx.db
            .query("reactions")
            .filter((q) =>
                q.and(
                    q.eq(q.field("messageId"), args.messageId),
                    q.eq(q.field("memberId"), member._id),
                    q.eq(q.field("value"), args.value),
                )
            )
            .first();

        if (existingMessageReactionFromUser) {
            await ctx.db.delete(existingMessageReactionFromUser._id);

            return existingMessageReactionFromUser._id;
        } else {
            const newReactionId = await ctx.db.insert("reactions", {
                value: args.value,
                memberId: member._id,
                messageId: message._id,
                workspaceId: message.workspaceId
            });

            return newReactionId;
        }
    },
});