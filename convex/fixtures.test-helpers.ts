/// <reference types="vite/client" />
// Test-only fixtures. The double extension keeps the Convex bundler from
// deploying this file (it skips file names containing more than one dot).

import { convexTest } from "convex-test";
import schema from "./schema";
import { Id } from "./_generated/dataModel";

export const modules = import.meta.glob("./**/*.ts");

export const PAGE = { numItems: 50, cursor: null };

export const newTest = () => convexTest(schema, modules);

export type TestConvex = ReturnType<typeof newTest>;

/** Act as a user the same way @convex-dev/auth does: subject = "<userId>|<sessionId>". */
export const as = (t: TestConvex, userId: Id<"users">) =>
  t.withIdentity({ subject: `${userId}|test-session-${userId}` });

const body = (text: string) => JSON.stringify({ ops: [{ insert: `${text}\n` }] });

/**
 * Two isolated workspaces.
 *
 * Workspace A: adminA (admin), memberA (member), memberA2 (member)
 * Workspace B: adminB (admin), memberB (member)
 * outsider: signed-in user with no membership anywhere
 */
export async function setupWorld(t: TestConvex) {
  return await t.run(async (ctx) => {
    const user = (name: string, extra: Record<string, unknown> = {}) =>
      ctx.db.insert("users", {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, "-")}@test.local`,
        ...extra,
      });

    const users = {
      adminA: await user("Admin A"),
      memberA: await user("Member A", { emailVerificationTime: 1, image: "https://img.test/a.png" }),
      memberA2: await user("Member A2"),
      adminB: await user("Admin B"),
      memberB: await user("Member B"),
      outsider: await user("Outsider"),
    };

    const wsA = await ctx.db.insert("workspaces", { name: "Workspace A", userId: users.adminA, joinCode: "aaaaaa" });
    const wsB = await ctx.db.insert("workspaces", { name: "Workspace B", userId: users.adminB, joinCode: "bbbbbb" });

    const members = {
      adminA: await ctx.db.insert("members", { userId: users.adminA, workspaceId: wsA, role: "admin" }),
      memberA: await ctx.db.insert("members", { userId: users.memberA, workspaceId: wsA, role: "member" }),
      memberA2: await ctx.db.insert("members", { userId: users.memberA2, workspaceId: wsA, role: "member" }),
      adminB: await ctx.db.insert("members", { userId: users.adminB, workspaceId: wsB, role: "admin" }),
      memberB: await ctx.db.insert("members", { userId: users.memberB, workspaceId: wsB, role: "member" }),
    };

    const generalA = await ctx.db.insert("channels", { name: "general", workspaceId: wsA });
    const generalB = await ctx.db.insert("channels", { name: "general", workspaceId: wsB });

    // DM between adminA and memberA; memberA2 is NOT a participant.
    const convA = await ctx.db.insert("conversations", {
      workspaceId: wsA,
      memberOneId: members.adminA,
      memberTwoId: members.memberA,
    });
    const convB = await ctx.db.insert("conversations", {
      workspaceId: wsB,
      memberOneId: members.adminB,
      memberTwoId: members.memberB,
    });

    const msg = (fields: {
      text: string;
      memberId: Id<"members">;
      workspaceId: Id<"workspaces">;
      channelId?: Id<"channels">;
      conversationId?: Id<"conversations">;
      parentMessageId?: Id<"messages">;
    }) => {
      const { text, ...rest } = fields;
      return ctx.db.insert("messages", { body: body(text), ...rest });
    };

    const messages = {
      channelA: await msg({ text: "secret A channel", memberId: members.memberA, workspaceId: wsA, channelId: generalA }),
      channelA2: await msg({ text: "A2 channel post", memberId: members.memberA2, workspaceId: wsA, channelId: generalA }),
      dmA: await msg({ text: "secret A DM", memberId: members.adminA, workspaceId: wsA, conversationId: convA }),
      channelB: await msg({ text: "secret B channel", memberId: members.memberB, workspaceId: wsB, channelId: generalB }),
      dmB: await msg({ text: "secret B DM", memberId: members.adminB, workspaceId: wsB, conversationId: convB }),
    };
    const replies = {
      channelThreadA: await msg({
        text: "secret A thread reply",
        memberId: members.adminA,
        workspaceId: wsA,
        channelId: generalA,
        parentMessageId: messages.channelA,
      }),
      dmThreadA: await msg({
        text: "secret A DM thread reply",
        memberId: members.memberA,
        workspaceId: wsA,
        conversationId: convA,
        parentMessageId: messages.dmA,
      }),
    };

    return { users, wsA, wsB, members, generalA, generalB, convA, convB, messages, replies };
  });
}

export type World = Awaited<ReturnType<typeof setupWorld>>;

/** Store a blob and record a content type, as a real HTTP upload would. */
export async function storeFile(t: TestConvex, contentType: string) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["fake-bytes"], { type: contentType }));
    // convex-test does not record the upload Content-Type; set it like production does.
    await ctx.db.patch(storageId as unknown as Id<"messages">, { contentType } as never);
    return storageId;
  });
}

export async function messageBodiesIn(t: TestConvex, filter: { channelId?: Id<"channels">; conversationId?: Id<"conversations"> }) {
  return await t.run(async (ctx) => {
    const all = await ctx.db.query("messages").collect();
    return all
      .filter((m) =>
        (filter.channelId === undefined || m.channelId === filter.channelId) &&
        (filter.conversationId === undefined || m.conversationId === filter.conversationId))
      .map((m) => m.body);
  });
}

export const text = (bodyJson: string) => (JSON.parse(bodyJson).ops as { insert: string }[]).map((o) => o.insert).join("").trim();
