import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireMember } from "./lib/access";

export const generateUploadUrl = mutation({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        //Only signed-in members of the workspace the file is for may upload
        await requireMember(ctx, args.workspaceId);

        return await ctx.storage.generateUploadUrl();
    },
});
