"use client";

import { useEffect, useState } from "react";

import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { DraftScope, DRAFTS_EVENT, claimDrafts, countDrafts, draftKey } from "@/lib/drafts";

// The storage key for the composer in one conversation, or null until the user is known.
export const useDraftKey = (scope: Omit<DraftScope, "userId">) => {
    const { data: user } = useCurrentUser();

    useEffect(() => {
        if (user?._id) claimDrafts(user._id);
    }, [user?._id]);

    if (!user?._id || !scope.workspaceId || !scope.id) return null;
    return draftKey({ ...scope, userId: user._id });
};

// Number of unsent drafts the current user has in this workspace, kept live.
export const useDraftCount = (workspaceId: string) => {
    const { data: user } = useCurrentUser();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user?._id) return;
        claimDrafts(user._id);
        const update = () => setCount(countDrafts(user._id, workspaceId));
        update();
        window.addEventListener(DRAFTS_EVENT, update);
        window.addEventListener("storage", update);
        return () => {
            window.removeEventListener(DRAFTS_EVENT, update);
            window.removeEventListener("storage", update);
        };
    }, [user?._id, workspaceId]);

    return count;
};
