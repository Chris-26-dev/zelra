"use client";

// Unsent composer text, saved on this device only.
// Keys are scoped by user and conversation so one person's drafts are never shown to another,
// and everything is cleared on sign-out or when a different account signs in on this browser.

const PREFIX = "zelra:draft:";
const OWNER_KEY = "zelra:draft-owner";
const EVENT = "zelra:drafts-changed";

export type DraftScope = {
    userId: string;
    workspaceId: string;
    // "channel" | "conversation" | "thread" plus the id of that conversation.
    kind: "channel" | "conversation" | "thread";
    id: string;
};

export const draftKey = ({ userId, workspaceId, kind, id }: DraftScope) =>
    `${PREFIX}${userId}:${workspaceId}:${kind}:${id}`;

const storage = (): Storage | null => {
    try {
        return typeof window === "undefined" ? null : window.localStorage;
    } catch {
        return null;
    }
};

const notify = () => {
    try {
        window.dispatchEvent(new Event(EVENT));
    } catch {
        // ignore
    }
};

export const readDraft = (key: string): string | null => {
    try {
        return storage()?.getItem(key) ?? null;
    } catch {
        return null;
    }
};

export const writeDraft = (key: string, value: string | null) => {
    try {
        const s = storage();
        if (!s) return;
        if (value) s.setItem(key, value);
        else s.removeItem(key);
        notify();
    } catch {
        // Storage full or blocked: drafts are a convenience, so fail quietly.
    }
};

const keysWhere = (match: (key: string) => boolean) => {
    const s = storage();
    if (!s) return [] as string[];
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.startsWith(PREFIX) && match(k)) keys.push(k);
    }
    return keys;
};

export const clearAllDrafts = () => {
    try {
        const s = storage();
        if (!s) return;
        keysWhere(() => true).forEach((k) => s.removeItem(k));
        s.removeItem(OWNER_KEY);
        notify();
    } catch {
        // ignore
    }
};

// Called once a user is known: if another account's drafts are on this device, remove them.
export const claimDrafts = (userId: string) => {
    try {
        const s = storage();
        if (!s) return;
        const owner = s.getItem(OWNER_KEY);
        if (owner && owner !== userId) clearAllDrafts();
        s.setItem(OWNER_KEY, userId);
    } catch {
        // ignore
    }
};

export const countDrafts = (userId: string, workspaceId: string) =>
    keysWhere((k) => k.startsWith(`${PREFIX}${userId}:${workspaceId}:`)).length;

export const DRAFTS_EVENT = EVENT;
