"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CopyIcon, LogOutIcon, MessageSquareTextIcon, RefreshCcwIcon, SearchIcon, Trash2Icon, TriangleAlertIcon, UserPlusIcon, UserXIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";
import { EmptyState } from "@/components/empty-state";
import { MemberAvatar } from "@/components/member-avatar";
import { WorkspaceTile } from "@/components/workspace-tile";
import { ZelraLoader } from "@/components/zelra-loader";
import { ConversationHeader } from "@/components/conversation-header";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { SettingsTab, resolveTab, settingsTabs } from "./settings-tabs";

// Workspace management: name, members and roles, invitations, and the danger zone.
// Replaces the Preferences and Invite dialogs; every action calls the same mutations they did.
const SettingsPage = () => {
    const workspaceId = useWorkspaceId();
    const searchParams = useSearchParams();

    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });

    if (workspaceLoading || memberLoading) {
        return (
            <div className="grid h-full place-items-center text-ink-3">
                <ZelraLoader label="Loading settings" />
            </div>
        );
    }

    if (!workspace || !member) {
        return (
            <EmptyState icon={<TriangleAlertIcon />} title="Workspace not found" description="You may no longer be a member of this workspace.">
                <Button asChild variant="outline"><Link href="/">Go to my workspaces</Link></Button>
            </EmptyState>
        );
    }

    const isAdmin = member.role === "admin";
    const tab = resolveTab(searchParams.get("tab"), isAdmin);

    return (
        <div className="flex h-full flex-col">
            <ConversationHeader context={workspace.name}>
                <span className="font-display text-base font-semibold md:text-lg">Workspace settings</span>
            </ConversationHeader>
            {/* Section tabs for phones; larger screens use the settings sidebar. */}
            <nav aria-label="Settings sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-line px-3 [scrollbar-width:none] md:hidden">
                {settingsTabs(isAdmin).map((t) => (
                    <Link
                        key={t.key}
                        href={`/workspace/${workspaceId}/settings?tab=${t.key}`}
                        aria-current={tab === t.key ? "page" : undefined}
                        className={cn(
                            "relative shrink-0 px-3 py-3 text-[13px] font-medium",
                            tab === t.key
                                ? "text-ink after:absolute after:inset-x-2.5 after:bottom-0 after:h-[3px] after:bg-cobalt after:lean-both after:[--lean:3px]"
                                : "text-ink-2"
                        )}
                    >
                        {t.label}
                    </Link>
                ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto messages-scrollbar">
                <div className="grid max-w-4xl content-start gap-6 px-4 py-6 md:px-10 md:py-8">
                    <Section tab={tab} workspace={workspace} currentMember={member} isAdmin={isAdmin} />
                </div>
            </div>
        </div>
    );
};

interface SectionProps {
    tab: SettingsTab;
    workspace: Doc<"workspaces">;
    currentMember: Doc<"members">;
    isAdmin: boolean;
}

const Section = ({ tab, ...props }: SectionProps) => {
    if (tab === "general") return <General {...props} />;
    if (tab === "invitations") return <Invitations {...props} />;
    if (tab === "danger") return <DangerZone {...props} />;
    return <Members {...props} />;
};

const SectionHeading = ({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) => (
    <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-[26px]">{title}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-ink-2">{description}</p>
        </div>
        {children}
    </div>
);

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("grid max-w-2xl gap-4 rounded-xl border border-line bg-card p-5", className)}>{children}</div>
);

// ---------- General (admin) ----------
const General = ({ workspace }: Omit<SectionProps, "tab">) => {
    const [value, setValue] = useState(workspace.name);
    const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace();

    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        updateWorkspace({
            id: workspace._id,
            name: value,
        }, {
            onSuccess: () => {
                toast.success("Workspace updated");
            },
            onError: () => {
                toast.error("Failed to update workspace");
            },
        })
    };

    return (
        <>
            <SectionHeading title="General" description={`How ${workspace.name} appears to its members.`} />
            <Card>
                <div className="flex items-center gap-4">
                    <WorkspaceTile name={value || workspace.name} size="xl" />
                    <div className="min-w-0">
                        <p className="truncate font-display font-semibold">{value || workspace.name}</p>
                        <p className="text-xs text-ink-3">The tile colour is picked from the name.</p>
                    </div>
                </div>
                <form className="grid gap-4" onSubmit={handleEdit}>
                    <Field id="workspace-name" label="Workspace name" hint="3–80 characters. Members see it in the switcher and in invites.">
                        <Input
                            value={value}
                            disabled={isUpdatingWorkspace}
                            onChange={(e) => setValue(e.target.value)}
                            required
                            minLength={3}
                            maxLength={80}
                            placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                        />
                    </Field>
                    <div className="flex gap-2">
                        <Button disabled={isUpdatingWorkspace || value === workspace.name}>
                            {isUpdatingWorkspace ? "Saving…" : "Save name"}
                        </Button>
                        {value !== workspace.name && (
                            <Button type="button" variant="ghost" onClick={() => setValue(workspace.name)} disabled={isUpdatingWorkspace}>
                                Reset
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </>
    );
};

// ---------- Members ----------
const Members = ({ workspace, currentMember, isAdmin }: Omit<SectionProps, "tab">) => {
    const { data: members, isLoading } = useGetMembers({ workspaceId: workspace._id });
    const [query, setQuery] = useState("");
    const { mutate: updateMember } = useUpdateMember();
    const { mutate: removeMember } = useRemoveMember();

    const [UpdateDialog, confirmUpdate] = useConfirm(
        "Change role?",
        "Admins can create and delete channels, change roles, remove members and manage invites.",
        { confirmLabel: "Change role" },
    );
    const [RemoveDialog, confirmRemove] = useConfirm(
        "Remove this member?",
        "They'll lose access to the workspace and its channels. You can invite them again later.",
        { confirmLabel: "Remove member", tone: "danger" },
    );

    const onUpdate = async (id: Id<"members">, role: "admin" | "member") => {
        const ok = await confirmUpdate();
        if (!ok) return;
        updateMember({ id, role }, {
            onSuccess: () => toast.success("Role changed"),
            onError: () => toast.error("Failed to change role"),
        });
    };

    const onRemove = async (id: Id<"members">) => {
        const ok = await confirmRemove();
        if (!ok) return;
        removeMember({ id }, {
            onSuccess: () => toast.success("Member removed"),
            onError: () => toast.error("Failed to remove member"),
        });
    };

    const rows = (members ?? []).filter((m) => (m.user.name ?? "").toLowerCase().includes(query.trim().toLowerCase()));

    return (
        <>
            <UpdateDialog />
            <RemoveDialog />
            <SectionHeading
                title="Members"
                description={`${members?.length ?? "…"} ${members?.length === 1 ? "person" : "people"} in ${workspace.name}.${isAdmin ? " Admins can change roles and remove members." : ""}`}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64 max-w-full">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search members"
                            aria-label="Search members"
                            className="pl-9"
                        />
                    </div>
                    {isAdmin && (
                        <Button asChild>
                            <Link href={`/workspace/${workspace._id}/settings?tab=invitations`}>
                                <UserPlusIcon />
                                Invite people
                            </Link>
                        </Button>
                    )}
                </div>
            </SectionHeading>
            <div className="overflow-hidden rounded-xl border border-line bg-card">
                {isLoading ? (
                    <div className="grid place-items-center py-10 text-ink-3"><ZelraLoader label="Loading members" /></div>
                ) : rows.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-ink-3">No members match “{query}”.</p>
                ) : (
                    <ul role="list" className="divide-y divide-line">
                        {rows.map((m) => {
                            const isSelf = m._id === currentMember._id;
                            const name = m.user.name ?? "Member";
                            return (
                                <li key={m._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-hover md:flex-nowrap">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <MemberAvatar name={name} image={m.user.image} size="md" />
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-2 truncate text-sm font-medium">
                                                <span className="truncate">{name}</span>
                                                {isSelf && <Badge variant="muted">You</Badge>}
                                            </p>
                                            <p className="text-xs text-ink-3">Joined {format(m._creationTime, "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isAdmin && !isSelf ? (
                                            <select
                                                value={m.role}
                                                onChange={(e) => onUpdate(m._id, e.target.value as "admin" | "member")}
                                                aria-label={`Role for ${name}`}
                                                className="h-8 rounded-lg border border-line-2 bg-card px-2 text-[13px] text-ink outline-none focus-visible:border-cobalt focus-visible:ring-[3px] focus-visible:ring-wash"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
                                        ) : (
                                            <Badge variant={m.role === "admin" ? "default" : "muted"}>{m.role === "admin" ? "Admin" : "Member"}</Badge>
                                        )}
                                        <div className="ml-2 flex items-center gap-0.5">
                                            <Hint label={isSelf ? "Notes to self" : `Message ${name}`}>
                                                <Button asChild variant="ghost" size="iconSm" aria-label={isSelf ? "Notes to self" : `Message ${name}`}>
                                                    <Link href={`/workspace/${workspace._id}/member/${m._id}`}>
                                                        <MessageSquareTextIcon />
                                                    </Link>
                                                </Button>
                                            </Hint>
                                            {isAdmin && !isSelf && (
                                                <Hint label={`Remove ${name}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="iconSm"
                                                        onClick={() => onRemove(m._id)}
                                                        aria-label={`Remove ${name}`}
                                                        className="text-danger hover:bg-danger-wash hover:text-danger"
                                                    >
                                                        <UserXIcon />
                                                    </Button>
                                                </Hint>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
};

// ---------- Invitations (admin) ----------
const Invitations = ({ workspace }: Omit<SectionProps, "tab">) => {
    const { mutate, isPending } = useNewJoinCode();
    const [ConfirmDialog, confirm] = useConfirm(
        "Generate a new invite code?",
        "The current code and link will stop working. Anyone who hasn't joined yet will need the new one.",
        { confirmLabel: "Generate new code" },
    );

    const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/join/${workspace._id}` : "";

    const handleNewCode = async () => {
        const ok = await confirm();

        if (!ok) return;

        mutate({ workspaceId: workspace._id }, {
            onSuccess: () => {
                toast.success("Invite code regenerated");
            },
            onError: () => {
                toast.error("Failed to regenerate invite code");
            }
        });
    };

    const handleCopy = () => {
        navigator.clipboard
            .writeText(inviteLink)
            .then(() => toast.success("Invite link copied to clipboard"))
            .catch(() => toast.error("Couldn't copy the link. Select it and copy it manually."));
    }

    return (
        <>
            <ConfirmDialog />
            <SectionHeading
                title="Invitations"
                description={`Anyone with the link and this code can join ${workspace.name} as a member.`}
            />
            <Card>
                <div className="grid gap-2">
                    <p className="text-[13px] font-medium">Invite code</p>
                    <div className="flex flex-wrap gap-1.5" aria-label={`Invite code ${workspace.joinCode.split("").join(" ")}`}>
                        {workspace.joinCode.split("").map((char, i) => (
                            <span key={i} aria-hidden="true" className="cut grid h-14 w-11 place-items-center bg-night font-mono text-2xl font-medium uppercase text-n-ink hatch [--cut:10px]">
                                {char}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="grid gap-1.5">
                    <label htmlFor="invite-link" className="text-[13px] font-medium">Invite link</label>
                    <div className="flex gap-2">
                        <Input id="invite-link" readOnly value={inviteLink} onFocus={(e) => e.currentTarget.select()} className="font-mono text-[12.5px] text-ink-2" />
                        <Button variant="outline" onClick={handleCopy}>
                            <CopyIcon />
                            Copy link
                        </Button>
                    </div>
                    <p className="text-xs text-ink-3">People open the link, then enter the code above.</p>
                </div>
                <div>
                    <Button variant="outline" disabled={isPending} onClick={handleNewCode}>
                        <RefreshCcwIcon />
                        Generate new code
                    </Button>
                </div>
            </Card>
        </>
    );
};

// ---------- Danger zone ----------
const DangerZone = ({ workspace, currentMember, isAdmin }: Omit<SectionProps, "tab">) => {
    const router = useRouter();
    const { mutate: removeWorkspace, isPending: isRemovingWorkspace } = useRemoveWorkspace();
    const { mutate: removeMember, isPending: isLeaving } = useRemoveMember();

    const [DeleteDialog, confirmDelete] = useConfirm(
        `Delete ${workspace.name}?`,
        "This permanently deletes every channel, message and membership in this workspace.",
        { confirmLabel: "Delete workspace", tone: "danger", typedConfirmation: workspace.name },
    );
    const [LeaveDialog, confirmLeave] = useConfirm(
        `Leave ${workspace.name}?`,
        "You'll lose access to its channels and messages. You'll need a new invite to rejoin.",
        { confirmLabel: "Leave workspace", tone: "danger" },
    );

    const handleRemove = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        removeWorkspace({
            id: workspace._id
        }, {
            onSuccess: () => {
                toast.success("Workspace removed");
                router.replace("/");
            },
            onError: () => {
                toast.error("Failed to remove workspace");
            },
        })
    };

    const handleLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;

        removeMember({ id: currentMember._id }, {
            onSuccess: () => {
                router.replace("/");
                toast.success("You left the workspace");
            },
            onError: () => {
                toast.error("Failed to leave the workspace")
            }
        })
    };

    return (
        <>
            <DeleteDialog />
            <LeaveDialog />
            <SectionHeading
                title={isAdmin ? "Danger zone" : "Leave workspace"}
                description={isAdmin ? "These actions can't be undone." : "Leaving removes you from every channel in this workspace."}
            />
            <Card className="border-danger/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-md">
                        <p className="font-semibold">{isAdmin ? "Delete workspace" : `Leave ${workspace.name}`}</p>
                        <p className="mt-1 text-[13px] text-ink-2">
                            {isAdmin
                                ? `Permanently deletes ${workspace.name}, its channels, messages and members.`
                                : "You'll need a new invite to rejoin."}
                        </p>
                    </div>
                    {isAdmin ? (
                        <Button variant="destructive" disabled={isRemovingWorkspace} onClick={handleRemove}>
                            <Trash2Icon />
                            Delete workspace
                        </Button>
                    ) : (
                        <Button variant="destructive-outline" disabled={isLeaving} onClick={handleLeave}>
                            <LogOutIcon />
                            Leave workspace
                        </Button>
                    )}
                </div>
            </Card>
        </>
    );
};

export default SettingsPage;
