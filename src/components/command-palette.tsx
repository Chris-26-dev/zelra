"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthActions } from "@convex-dev/auth/react";
import { format } from "date-fns";
import { HashIcon, LogOutIcon, MoonIcon, PlusIcon, SearchIcon, SlidersHorizontalIcon, SunIcon, UserPlusIcon, ZapIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { MemberAvatar } from "@/components/member-avatar";
import { WorkspaceTile } from "@/components/workspace-tile";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { PaletteScope, useCommandPalette } from "@/features/workspaces/store/use-shell-state";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { clearAllDrafts } from "@/lib/drafts";
import { cn } from "@/lib/utils";

const SCOPES: { key: PaletteScope; label: string; prefix?: string }[] = [
    { key: "all", label: "All" },
    { key: "channels", label: "Channels", prefix: "#" },
    { key: "people", label: "People", prefix: "@" },
    { key: "workspaces", label: "Workspaces" },
    { key: "actions", label: "Actions", prefix: ">" },
];

const PREFIX_SCOPE: Record<string, PaletteScope> = { "#": "channels", "@": "people", ">": "actions" };

type Item =
    | { kind: "channel"; id: string; label: string; created: number }
    | { kind: "person"; id: string; label: string; image?: string; role: string; joined: number; isYou: boolean }
    | { kind: "workspace"; id: string; label: string; current: boolean }
    | { kind: "action"; id: string; label: string; icon: React.ReactNode; run: () => void };

// Jump to any channel, person, workspace or action. Opened with Ctrl/⌘ K or "Jump to…".
export const CommandPalette = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { resolvedTheme, setTheme } = useTheme();
    const { signOut } = useAuthActions();
    const [{ open, scope: chosenScope }, setPalette] = useCommandPalette();
    const [, setChannelOpen] = useCreateChannelModal();
    const [, setWorkspaceOpen] = useCreateWorkspaceModal();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");

    const { data: channels } = useGetChannels({ workspaceId });
    const { data: members } = useGetMembers({ workspaceId });
    const { data: workspaces } = useGetWorkspaces();
    const { data: currentMember } = useCurrentMember({ workspaceId });
    const isAdmin = currentMember?.role === "admin";

    const prefixScope = PREFIX_SCOPE[search.charAt(0)];
    const scope = prefixScope ?? chosenScope;
    const query = (prefixScope ? search.slice(1) : search).trim().toLowerCase();

    const close = () => {
        setPalette({ open: false, scope: "all" });
        setSearch("");
    };

    const items = useMemo<Item[]>(() => {
        const list: Item[] = [];
        channels?.forEach((c) => list.push({ kind: "channel", id: c._id, label: c.name, created: c._creationTime }));
        members?.forEach((m) => list.push({
            kind: "person", id: m._id, label: m.user.name ?? "Member", image: m.user.image, role: m.role,
            joined: m._creationTime, isYou: m._id === currentMember?._id,
        }));
        workspaces?.forEach((w) => list.push({ kind: "workspace", id: w._id, label: w.name, current: w._id === workspaceId }));
        const actions: Item[] = [];
        if (isAdmin) {
            actions.push({ kind: "action", id: "create-channel", label: "Create a channel", icon: <HashIcon />, run: () => setChannelOpen(true) });
            actions.push({ kind: "action", id: "invite", label: "Invite people", icon: <UserPlusIcon />, run: () => router.push(`/workspace/${workspaceId}/settings?tab=invitations`) });
        }
        actions.push(
            { kind: "action", id: "settings", label: "Workspace settings", icon: <SlidersHorizontalIcon />, run: () => router.push(`/workspace/${workspaceId}/settings`) },
            { kind: "action", id: "create-workspace", label: "Create a workspace", icon: <PlusIcon />, run: () => setWorkspaceOpen(true) },
            resolvedTheme === "dark"
                ? { kind: "action", id: "theme", label: "Switch to day theme", icon: <SunIcon />, run: () => setTheme("light") }
                : { kind: "action", id: "theme", label: "Switch to night theme", icon: <MoonIcon />, run: () => setTheme("dark") },
            {
                kind: "action", id: "sign-out", label: "Sign out", icon: <LogOutIcon />, run: async () => {
                    clearAllDrafts();
                    await signOut();
                    window.location.href = "/";
                },
            },
        );
        return [...list, ...actions];
    }, [channels, members, workspaces, currentMember?._id, isAdmin, workspaceId, resolvedTheme, router, setChannelOpen, setWorkspaceOpen, setTheme, signOut]);

    const inScope = (kind: Item["kind"]) =>
        scope === "all" ||
        (scope === "channels" && kind === "channel") ||
        (scope === "people" && kind === "person") ||
        (scope === "workspaces" && kind === "workspace") ||
        (scope === "actions" && kind === "action");

    const visible = items.filter((i) => inScope(i.kind) && (!query || i.label.toLowerCase().includes(query)));
    const groups: { heading: string; kind: Item["kind"] }[] = [
        { heading: "Channels", kind: "channel" },
        { heading: "People", kind: "person" },
        { heading: "Workspaces", kind: "workspace" },
        { heading: "Actions", kind: "action" },
    ];
    const valueOf = (i: Item) => `${i.kind}:${i.id}`;
    const current = visible.find((i) => valueOf(i) === selected) ?? visible[0];

    const run = (item: Item) => {
        close();
        if (item.kind === "channel") router.push(`/workspace/${workspaceId}/channel/${item.id}`);
        if (item.kind === "person") router.push(`/workspace/${workspaceId}/member/${item.id}`);
        if (item.kind === "workspace") router.push(`/workspace/${item.id}`);
        if (item.kind === "action") item.run();
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? setPalette({ open: true, scope: chosenScope }) : close())}>
            <DialogContent
                showCloseButton={false}
                className="cut top-[12%] translate-y-0 gap-0 overflow-hidden rounded-none border-0 p-0 [--cut:16px] sm:max-w-[700px] max-sm:top-0 max-sm:h-dvh max-sm:max-w-none max-sm:[--cut:0px]"
            >
                <DialogTitle className="sr-only">Jump to</DialogTitle>
                <DialogDescription className="sr-only">Search channels, people, workspaces and actions</DialogDescription>
                <Command
                    shouldFilter={false}
                    value={current ? valueOf(current) : ""}
                    onValueChange={setSelected}
                    className="flex h-full max-h-[min(520px,80dvh)] flex-col max-sm:max-h-none"
                    loop
                >
                    <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
                        <SearchIcon className="size-[18px] shrink-0 text-ink-3" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            autoFocus
                            placeholder="Jump to a channel, person or action…"
                            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
                        />
                        <Kbd className="text-ink-3 max-sm:hidden">Esc</Kbd>
                        <button onClick={close} className="text-sm font-medium text-cobalt-ink sm:hidden">Close</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2" role="group" aria-label="Search in">
                        {SCOPES.map((s) => (
                            <button
                                key={s.key}
                                aria-pressed={scope === s.key}
                                onClick={() => {
                                    setPalette({ open: true, scope: s.key });
                                    if (prefixScope) setSearch(search.slice(1));
                                }}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                                    scope === s.key ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-line-2 hover:text-ink"
                                )}
                            >
                                {s.label}
                                {s.prefix && <Kbd className="text-[10px]">{s.prefix}</Kbd>}
                            </button>
                        ))}
                    </div>
                    <div className="grid min-h-0 flex-1 md:grid-cols-[1.25fr_1fr]">
                        <Command.List className="max-h-full overflow-y-auto p-1.5 md:border-r md:border-line messages-scrollbar">
                            <Command.Empty className="px-4 py-10 text-center text-sm text-ink-3">
                                No matches for “{search}”. Try a channel name, a person, or type &gt; for actions.
                            </Command.Empty>
                            {groups.map(({ heading, kind }) => {
                                const group = visible.filter((i) => i.kind === kind);
                                if (group.length === 0) return null;
                                return (
                                    <Command.Group
                                        key={kind}
                                        heading={heading}
                                        className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-[11.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-3"
                                    >
                                        {group.map((item) => (
                                            <Command.Item
                                                key={valueOf(item)}
                                                value={valueOf(item)}
                                                onSelect={() => run(item)}
                                                className="lean flex h-9 cursor-pointer items-center gap-2.5 px-3 text-sm text-ink data-[selected=true]:bg-wash data-[selected=true]:text-cobalt-ink [&_svg]:size-4 [&_svg]:text-ink-3 data-[selected=true]:[&_svg]:text-cobalt-ink"
                                            >
                                                <ItemLead item={item} />
                                                <span className="truncate">{item.label}</span>
                                                <span className="ml-auto shrink-0 text-xs text-ink-3">
                                                    {item.kind === "person" && (item.isYou ? "you" : item.role === "admin" ? "Admin" : "Member")}
                                                    {item.kind === "workspace" && (item.current ? "current" : "switch")}
                                                </span>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                );
                            })}
                        </Command.List>
                        <div className="hidden min-h-0 overflow-y-auto p-5 md:block" aria-live="polite">
                            {current ? <Preview item={current} /> : <p className="text-sm text-ink-3">Nothing selected.</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-[11.5px] text-ink-3 max-sm:hidden">
                        <span>↑ ↓ to move</span>
                        <span>Enter to open</span>
                        <span># channels · @ people · &gt; actions</span>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

const ItemLead = ({ item }: { item: Item }) => {
    if (item.kind === "channel") return <HashIcon />;
    if (item.kind === "person") return <MemberAvatar name={item.label} image={item.image} size="xs" />;
    if (item.kind === "workspace") return <WorkspaceTile name={item.label} size="sm" />;
    return <>{item.icon}</>;
};

const Preview = ({ item }: { item: Item }) => {
    if (item.kind === "channel") {
        return (
            <div className="grid gap-3">
                <div className="cut grid size-11 place-items-center bg-night font-display text-xl font-semibold text-n-ink hatch [--cut:10px]">#</div>
                <h3 className="font-display text-lg font-semibold">#{item.label}</h3>
                <p className="text-[13px] text-ink-2">Created {format(item.created, "MMMM d, yyyy")}</p>
                <p className="text-[13px] text-ink-3">Press Enter to open the channel.</p>
            </div>
        );
    }
    if (item.kind === "person") {
        return (
            <div className="grid gap-3">
                <MemberAvatar name={item.label} image={item.image} size="2xl" />
                <h3 className="font-display text-lg font-semibold">{item.label}</h3>
                <p className="text-[13px] text-ink-2">{item.role === "admin" ? "Admin" : "Member"} · joined {format(item.joined, "MMM d, yyyy")}</p>
                <p className="text-[13px] text-ink-3">{item.isYou ? "Enter opens your notes to self." : "Enter opens your direct messages."}</p>
            </div>
        );
    }
    if (item.kind === "workspace") {
        return (
            <div className="grid gap-3">
                <WorkspaceTile name={item.label} size="xl" />
                <h3 className="font-display text-lg font-semibold">{item.label}</h3>
                <p className="text-[13px] text-ink-3">{item.current ? "You're here." : "Enter switches to this workspace."}</p>
            </div>
        );
    }
    return (
        <div className="grid gap-3">
            <div className="cut grid size-11 place-items-center bg-night text-n-ink hatch [--cut:10px] [&_svg]:size-5"><ZapIcon /></div>
            <h3 className="font-display text-lg font-semibold">{item.label}</h3>
            <p className="text-[13px] text-ink-3">Runs right away. Actions only admins can take are hidden from members.</p>
        </div>
    );
};
