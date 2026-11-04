"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useTheme } from "next-themes";

import { MemberAvatar } from "@/components/member-avatar";
import { ZelraLoader } from "@/components/zelra-loader";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { usePanel } from "@/hooks/use-panel";
import { clearAllDrafts } from "@/lib/drafts";

interface Props {
    side?: "right" | "top" | "bottom";
}

export const UserButton = ({ side = "right" }: Props) => {
    const { signOut } = useAuthActions();
    const { data, isLoading } = useCurrentUser();
    const { theme, setTheme } = useTheme();
    const workspaceId = useWorkspaceId();
    // Outside a workspace (first run) there is no member profile to open.
    const member = useQuery(api.members.current, workspaceId ? { workspaceId } : "skip");
    const { onOpenProfile } = usePanel();

    if (isLoading) {
        return <ZelraLoader className="text-n-ink-3" label="Loading your account" />
    }

    if (!data) {
        return null;
    }

    const name = data?.name ?? "Member";

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                aria-label="Your account"
                className="rounded-none outline-offset-4 transition-opacity hover:opacity-85"
            >
                <MemberAvatar name={name} image={data.image} size="lg" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={side} className="w-64">
                <div className="flex items-center gap-3 px-2.5 py-2">
                    <MemberAvatar name={name} image={data.image} size="lg" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{name}</p>
                        {data.email && <p className="truncate text-xs text-ink-3">{data.email}</p>}
                    </div>
                </div>
                {member && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onOpenProfile(member._id)}>
                            <UserIcon />
                            Your profile
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="system">Match system</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">Day</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">Night</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                        clearAllDrafts();             // 0. Drafts never outlive the session on this device
                        await signOut();          // 1. Sign out user
                        window.location.href = "/";      // 2. Redirect to home (or sign-in screen)
                    }}
                >
                    <LogOutIcon />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
