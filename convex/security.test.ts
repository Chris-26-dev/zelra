import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  PAGE,
  TestConvex,
  as,
  messageBodiesIn,
  newTest,
  setupWorld,
  storeFile,
  text,
} from "./fixtures.test-helpers";

type GetArgs = {
  channelId?: Id<"channels">;
  conversationId?: Id<"conversations">;
  parentMessageId?: Id<"messages">;
};

async function world() {
  const t = newTest();
  const w = await setupWorld(t);
  return { t, w };
}

/** Texts a user can read through messages.get. */
async function readTexts(t: TestConvex, userId: Id<"users">, args: GetArgs) {
  const result = await as(t, userId).query(api.messages.get, { ...args, paginationOpts: PAGE });
  return result.page.map((m) => text(m.body));
}

describe("SEC-01 messages.get: workspace and conversation isolation", () => {
  test("member of A reads A's channel (authorized baseline)", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberA, { channelId: w.generalA })).toEqual(
      expect.arrayContaining(["secret A channel", "A2 channel post"]),
    );
  });

  test("member of workspace B cannot read workspace A's channel", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberB, { channelId: w.generalA })).toEqual([]);
  });

  test("admin of workspace B cannot read workspace A's channel", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.adminB, { channelId: w.generalA })).toEqual([]);
  });

  test("signed-in non-member cannot read workspace A's channel", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.outsider, { channelId: w.generalA })).toEqual([]);
  });

  test("unauthenticated caller is rejected", async () => {
    const { t, w } = await world();
    await expect(t.query(api.messages.get, { channelId: w.generalA, paginationOpts: PAGE })).rejects.toThrow();
  });

  test("DM participants read their conversation (authorized baseline)", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberA, { conversationId: w.convA })).toEqual(["secret A DM"]);
    expect(await readTexts(t, w.users.adminA, { conversationId: w.convA })).toEqual(["secret A DM"]);
  });

  test("workspace member who is not a DM participant cannot read the DM", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberA2, { conversationId: w.convA })).toEqual([]);
  });

  test("member of workspace B cannot read workspace A's DM", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberB, { conversationId: w.convA })).toEqual([]);
  });

  test("member of B cannot read A's channel thread", async () => {
    const { t, w } = await world();
    expect(
      await readTexts(t, w.users.memberB, { channelId: w.generalA, parentMessageId: w.messages.channelA }),
    ).toEqual([]);
  });

  test("member of B cannot read A's DM thread through parentMessageId alone", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberB, { parentMessageId: w.messages.dmA })).toEqual([]);
  });

  test("non-participant in A cannot read A's DM thread through parentMessageId alone", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.memberA2, { parentMessageId: w.messages.dmA })).toEqual([]);
  });

  test("DM participant reads DM thread through parentMessageId alone (existing UI flow)", async () => {
    const { t, w } = await world();
    expect(await readTexts(t, w.users.adminA, { parentMessageId: w.messages.dmA })).toEqual([
      "secret A DM thread reply",
    ]);
  });

  test("channel thread is readable by members of its workspace (authorized baseline)", async () => {
    const { t, w } = await world();
    expect(
      await readTexts(t, w.users.memberA2, { channelId: w.generalA, parentMessageId: w.messages.channelA }),
    ).toEqual(["secret A thread reply"]);
  });

  test("a parent message from another scope cannot be combined with an allowed channel", async () => {
    const { t, w } = await world();
    // memberA2 may read generalA but not convA: pointing at convA's message must not leak its replies.
    expect(
      await readTexts(t, w.users.memberA2, { channelId: w.generalA, parentMessageId: w.messages.dmA }),
    ).toEqual([]);
  });

  test("authors are returned without private account fields", async () => {
    const { t, w } = await world();
    const result = await as(t, w.users.memberA2).query(api.messages.get, { channelId: w.generalA, paginationOpts: PAGE });
    expect(result.page.length).toBeGreaterThan(0);
    for (const m of result.page) {
      expect(m.user).not.toHaveProperty("email");
      expect(m.user).not.toHaveProperty("emailVerificationTime");
      expect(m.user.name).toEqual(expect.any(String));
    }
  });
});

describe("SEC-01 messages.getById: single-message access", () => {
  test("member of B cannot fetch a message from A", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.memberB).query(api.messages.getById, { id: w.messages.channelA })).toBeNull();
  });

  test("non-participant cannot fetch a DM message", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.memberA2).query(api.messages.getById, { id: w.messages.dmA })).toBeNull();
  });

  test("participant and channel member can fetch (authorized baseline)", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.memberA).query(api.messages.getById, { id: w.messages.dmA })).not.toBeNull();
    expect(await as(t, w.users.memberA2).query(api.messages.getById, { id: w.messages.channelA })).not.toBeNull();
  });
});

describe("SEC-02 messages.create: target must belong to the caller's workspace", () => {
  // Arguments are deliberately loose: attackers call the API directly, not through typed hooks.
  const create = (t: TestConvex, userId: Id<"users">, args: Record<string, unknown>) =>
    as(t, userId).mutation(api.messages.create, {
      body: JSON.stringify({ ops: [{ insert: "injected\n" }] }),
      ...args,
    } as never);

  test("member of A posts to A's channel as themselves (authorized baseline)", async () => {
    const { t, w } = await world();
    const id = await create(t, w.users.memberA, { workspaceId: w.wsA, channelId: w.generalA });
    const stored = await t.run((ctx) => ctx.db.get(id as Id<"messages">));
    expect(stored?.memberId).toBe(w.members.memberA);
    expect(stored?.workspaceId).toBe(w.wsA);
  });

  test("member of B cannot post into A's channel by passing their own workspace", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.memberB, { workspaceId: w.wsB, channelId: w.generalA })).rejects.toThrow();
    expect((await messageBodiesIn(t, { channelId: w.generalA })).map(text)).not.toContain("injected");
  });

  test("member of B cannot post into A's channel by passing A's workspace", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.memberB, { workspaceId: w.wsA, channelId: w.generalA })).rejects.toThrow();
  });

  test("non-member cannot post into A's channel", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.outsider, { workspaceId: w.wsA, channelId: w.generalA })).rejects.toThrow();
  });

  test("unauthenticated caller cannot post", async () => {
    const { t, w } = await world();
    await expect(
      t.mutation(api.messages.create, { body: "{}", workspaceId: w.wsA, channelId: w.generalA }),
    ).rejects.toThrow();
  });

  test("member of A who is not a participant cannot post into A's DM", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.memberA2, { workspaceId: w.wsA, conversationId: w.convA })).rejects.toThrow();
    expect((await messageBodiesIn(t, { conversationId: w.convA })).map(text)).not.toContain("injected");
  });

  test("member of B cannot post into A's DM by passing their own workspace", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.memberB, { workspaceId: w.wsB, conversationId: w.convA })).rejects.toThrow();
  });

  test("member of B cannot reply into A's DM thread through parentMessageId alone", async () => {
    const { t, w } = await world();
    await expect(create(t, w.users.memberB, { workspaceId: w.wsB, parentMessageId: w.messages.dmA })).rejects.toThrow();
    expect((await messageBodiesIn(t, { conversationId: w.convA })).map(text)).not.toContain("injected");
  });

  test("member of B cannot attach a reply to A's message from B's channel", async () => {
    const { t, w } = await world();
    await expect(
      create(t, w.users.memberB, { workspaceId: w.wsB, channelId: w.generalB, parentMessageId: w.messages.channelA }),
    ).rejects.toThrow();
  });

  test("parent message must share the target channel or conversation", async () => {
    const { t, w } = await world();
    await expect(
      create(t, w.users.memberA, { workspaceId: w.wsA, channelId: w.generalA, parentMessageId: w.messages.dmA }),
    ).rejects.toThrow();
  });

  test("a message cannot target both a channel and a conversation, or neither", async () => {
    const { t, w } = await world();
    await expect(
      create(t, w.users.memberA, { workspaceId: w.wsA, channelId: w.generalA, conversationId: w.convA }),
    ).rejects.toThrow();
    await expect(create(t, w.users.memberA, { workspaceId: w.wsA })).rejects.toThrow();
  });

  test("participant replies in a DM thread through parentMessageId alone (existing UI flow)", async () => {
    const { t, w } = await world();
    const id = await create(t, w.users.memberA, { workspaceId: w.wsA, parentMessageId: w.messages.dmA });
    const stored = await t.run((ctx) => ctx.db.get(id as Id<"messages">));
    expect(stored?.conversationId).toBe(w.convA);
    expect(stored?.memberId).toBe(w.members.memberA);
  });

  test("channel thread reply by a workspace member works (existing UI flow)", async () => {
    const { t, w } = await world();
    const id = await create(t, w.users.memberA2, {
      workspaceId: w.wsA,
      channelId: w.generalA,
      parentMessageId: w.messages.channelA,
    });
    const stored = await t.run((ctx) => ctx.db.get(id as Id<"messages">));
    expect(stored?.parentMessageId).toBe(w.messages.channelA);
  });

  test("image attachments must be images", async () => {
    const { t, w } = await world();
    const png = await storeFile(t, "image/png");
    const html = await storeFile(t, "text/html");
    await expect(
      create(t, w.users.memberA, { workspaceId: w.wsA, channelId: w.generalA, image: png }),
    ).resolves.toBeTruthy();
    await expect(
      create(t, w.users.memberA, { workspaceId: w.wsA, channelId: w.generalA, image: html }),
    ).rejects.toThrow();
  });
});

describe("SEC-03 members.remove: only admins (or the member themselves) can remove", () => {
  const memberExists = (t: TestConvex, id: Id<"members">) => t.run(async (ctx) => (await ctx.db.get(id)) !== null);
  const messageExists = (t: TestConvex, id: Id<"messages">) => t.run(async (ctx) => (await ctx.db.get(id)) !== null);

  test("regular member cannot remove another member, and no messages are deleted", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.memberA).mutation(api.members.remove, { id: w.members.memberA2 })).rejects.toThrow();
    expect(await memberExists(t, w.members.memberA2)).toBe(true);
    expect(await messageExists(t, w.messages.channelA2)).toBe(true);
  });

  test("admin of another workspace cannot remove a member of A", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.adminB).mutation(api.members.remove, { id: w.members.memberA2 })).rejects.toThrow();
    expect(await memberExists(t, w.members.memberA2)).toBe(true);
  });

  test("non-member and unauthenticated callers cannot remove members", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.outsider).mutation(api.members.remove, { id: w.members.memberA2 })).rejects.toThrow();
    await expect(t.mutation(api.members.remove, { id: w.members.memberA2 })).rejects.toThrow();
    expect(await memberExists(t, w.members.memberA2)).toBe(true);
  });

  test("regular member cannot remove an admin", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.memberA).mutation(api.members.remove, { id: w.members.adminA })).rejects.toThrow();
    expect(await memberExists(t, w.members.adminA)).toBe(true);
  });

  test("admin cannot remove themselves (existing rule: admins cannot be removed)", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.adminA).mutation(api.members.remove, { id: w.members.adminA })).rejects.toThrow();
    expect(await memberExists(t, w.members.adminA)).toBe(true);
  });

  test("member can leave the workspace (existing flow)", async () => {
    const { t, w } = await world();
    await as(t, w.users.memberA2).mutation(api.members.remove, { id: w.members.memberA2 });
    expect(await memberExists(t, w.members.memberA2)).toBe(false);
  });

  test("admin can remove a member, and the existing content cascade still runs", async () => {
    const { t, w } = await world();
    await as(t, w.users.adminA).mutation(api.members.remove, { id: w.members.memberA2 });
    expect(await memberExists(t, w.members.memberA2)).toBe(false);
    expect(await messageExists(t, w.messages.channelA2)).toBe(false);
    expect(await messageExists(t, w.messages.channelA)).toBe(true);
  });
});

describe("Role enforcement on other membership mutations (regression)", () => {
  test("regular member cannot change roles", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.memberA).mutation(api.members.update, { id: w.members.memberA2, role: "admin" }),
    ).rejects.toThrow();
  });

  test("admin of B cannot change roles in A", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.adminB).mutation(api.members.update, { id: w.members.memberA, role: "admin" }),
    ).rejects.toThrow();
  });

  test("regular member cannot rotate the join code or create channels", async () => {
    const { t, w } = await world();
    await expect(as(t, w.users.memberA).mutation(api.workspaces.newJoinCode, { workspaceId: w.wsA })).rejects.toThrow();
    await expect(
      as(t, w.users.memberA).mutation(api.channels.create, { workspaceId: w.wsA, name: "x" }),
    ).rejects.toThrow();
  });
});

describe("reactions.toggle follows message access", () => {
  const reactionCount = (t: TestConvex, messageId: Id<"messages">) =>
    t.run(async (ctx) => (await ctx.db.query("reactions").collect()).filter((r) => r.messageId === messageId).length);

  test("member of B cannot react to a message in A", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.memberB).mutation(api.reactions.toggle, { messageId: w.messages.channelA, value: "👍" }),
    ).rejects.toThrow();
    expect(await reactionCount(t, w.messages.channelA)).toBe(0);
  });

  test("non-participant cannot react to a DM message", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.memberA2).mutation(api.reactions.toggle, { messageId: w.messages.dmA, value: "👍" }),
    ).rejects.toThrow();
    expect(await reactionCount(t, w.messages.dmA)).toBe(0);
  });

  test("channel member and DM participant can react (authorized baseline)", async () => {
    const { t, w } = await world();
    await as(t, w.users.memberA2).mutation(api.reactions.toggle, { messageId: w.messages.channelA, value: "👍" });
    await as(t, w.users.memberA).mutation(api.reactions.toggle, { messageId: w.messages.dmA, value: "👍" });
    expect(await reactionCount(t, w.messages.channelA)).toBe(1);
    expect(await reactionCount(t, w.messages.dmA)).toBe(1);
  });
});

describe("SEC-04 member privacy", () => {
  test("member of B cannot look up a member of A", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.memberB).query(api.members.getById, { id: w.members.memberA })).toBeNull();
  });

  test("signed-in non-member cannot look up a member of A", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.outsider).query(api.members.getById, { id: w.members.memberA })).toBeNull();
  });

  test("unauthenticated caller gets nothing", async () => {
    const { t, w } = await world();
    expect(await t.query(api.members.getById, { id: w.members.memberA })).toBeNull();
  });

  test("co-member sees profile contact fields only (existing profile shows email)", async () => {
    const { t, w } = await world();
    const member = await as(t, w.users.memberA2).query(api.members.getById, { id: w.members.memberA });
    expect(member?._id).toBe(w.members.memberA);
    expect(member?.user.name).toBe("Member A");
    expect(member?.user.email).toBe("member-a@test.local");
    expect(member?.user).not.toHaveProperty("emailVerificationTime");
  });

  test("member list exposes public fields only", async () => {
    const { t, w } = await world();
    const list = await as(t, w.users.memberA2).query(api.members.get, { workspaceId: w.wsA });
    expect(list).toHaveLength(3);
    for (const m of list) {
      expect(m.user).not.toHaveProperty("email");
      expect(m.user).not.toHaveProperty("emailVerificationTime");
    }
  });

  test("member list of another workspace is empty", async () => {
    const { t, w } = await world();
    expect(await as(t, w.users.memberB).query(api.members.get, { workspaceId: w.wsA })).toEqual([]);
  });
});

describe("SEC-05 upload URL generation", () => {
  test("unauthenticated caller cannot get an upload URL", async () => {
    const { t, w } = await world();
    await expect(t.mutation(api.upload.generateUploadUrl, { workspaceId: w.wsA } as never)).rejects.toThrow();
  });

  test("signed-in non-member cannot get an upload URL for a workspace", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.outsider).mutation(api.upload.generateUploadUrl, { workspaceId: w.wsA } as never),
    ).rejects.toThrow();
  });

  test("member of B cannot get an upload URL for A", async () => {
    const { t, w } = await world();
    await expect(
      as(t, w.users.memberB).mutation(api.upload.generateUploadUrl, { workspaceId: w.wsA } as never),
    ).rejects.toThrow();
  });

  test("member gets an upload URL for their workspace (authorized baseline)", async () => {
    const { t, w } = await world();
    const url = await as(t, w.users.memberA).mutation(api.upload.generateUploadUrl, { workspaceId: w.wsA } as never);
    expect(url).toEqual(expect.any(String));
  });
});
