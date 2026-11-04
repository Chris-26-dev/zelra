"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { HashIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { EmptyState } from "@/components/empty-state";
import { PanelHeader } from "@/components/panel-header";
import { ZelraLoader } from "@/components/zelra-loader";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useChannelId } from "@/hooks/use-channel-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface Props {
    onClose: () => void;
}

// About the current channel: when it was made, images shared in it, and admin settings.
export const ChannelDetails = ({ onClose }: Props) => {
    const router = useRouter();
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();

    const { data: channel, isLoading } = useGetChannel({ id: channelId });
    const { data: workspace } = useGetWorkspace({ id: workspaceId });
    const { data: member } = useCurrentMember({ workspaceId });
    const { results } = useGetMessages({ channelId });
    const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel();
    const { mutate: removeChannel, isPending: isRemovingChannel } = useRemoveChannel();

    const [editOpen, setEditOpen] = useState(false);
    const [value, setValue] = useState("");

    const [ConfirmDialog, confirm] = useConfirm(
        `Delete #${channel?.name ?? "channel"}?`,
        "All messages and threads in this channel will be permanently deleted. You can't undo this.",
        { confirmLabel: "Delete channel", tone: "danger" },
    );

    const isAdmin = member?.role === "admin";
    const images = (results ?? []).filter((m) => !!m.image);

    const openRename = () => {
        setValue(channel?.name ?? "");
        setEditOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLocaleLowerCase();
        setValue(value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        updateChannel({ id: channelId, name: value }, {
            onSuccess: () => {
                toast.success("Channel renamed");
                setEditOpen(false);
            },
            onError: () => {
                toast.error("Failed to update channel");
            }
        });
    };

    const handleDelete = async () => {
        const ok = await confirm();

        if (!ok) return;

        removeChannel({ id: channelId }, {
            onSuccess: () => {
                toast.success("Channel deleted");
                onClose();
                router.push(`/workspace/${workspaceId}`)
            },
            onError: () => {
                toast.error("Failed to delete channel")
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-col">
                <PanelHeader title="Details" onClose={onClose} />
                <div className="grid flex-1 place-items-center text-ink-3"><ZelraLoader /></div>
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="flex h-full flex-col">
                <PanelHeader title="Details" onClose={onClose} />
                <EmptyState icon={<HashIcon />} title="Channel not found" description="It may have been deleted or renamed." />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <ConfirmDialog />
            <PanelHeader title={`#${channel.name}`} subtitle="Details" onClose={onClose} />
            <div className="min-h-0 flex-1 overflow-y-auto messages-scrollbar">
                <section className="grid gap-2.5 border-b border-line px-5 py-4">
                    <h3 className="text-xs font-semibold text-ink-3">About</h3>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
                        <dt className="text-ink-3">Created</dt>
                        <dd>{format(channel._creationTime, "MMMM d, yyyy")}</dd>
                        {workspace && (
                            <>
                                <dt className="text-ink-3">Workspace</dt>
                                <dd className="truncate">{workspace.name}</dd>
                            </>
                        )}
                    </dl>
                </section>
                <section className="grid gap-2.5 border-b border-line px-5 py-4">
                    <h3 className="text-xs font-semibold text-ink-3">Images shared here</h3>
                    {images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5">
                            {images.map((m) => (
                                <a
                                    key={m._id}
                                    href={m.image!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cut block aspect-square overflow-hidden bg-hover [--cut:8px]"
                                    aria-label={`Image from ${m.user.name ?? "a member"}`}
                                >
                                    <img src={m.image!} alt="" className="size-full object-cover transition-transform duration-200 hover:scale-105" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[13px] text-ink-3">Images posted in this channel will collect here.</p>
                    )}
                </section>
                {isAdmin && (
                    <section className="grid gap-1 px-3 py-4">
                        <h3 className="px-2 pb-1.5 text-xs font-semibold text-ink-3">Admin</h3>
                        <button onClick={openRename} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-hover">
                            <PencilIcon className="size-4 text-ink-3" />
                            Rename channel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isRemovingChannel}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-wash disabled:opacity-50"
                        >
                            <Trash2Icon className="size-4" />
                            Delete channel
                        </button>
                    </section>
                )}
            </div>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename this channel</DialogTitle>
                        <DialogDescription>Everyone in the workspace will see the new name.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field id="rename-channel" label="Channel name" hint="Lowercase. Spaces become hyphens. 3–80 characters.">
                            <Input
                                value={value}
                                disabled={isUpdatingChannel}
                                onChange={handleChange}
                                required
                                autoFocus
                                minLength={3}
                                maxLength={80}
                                placeholder="e.g travel-to-korea"
                            />
                        </Field>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isUpdatingChannel}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button disabled={isUpdatingChannel}>
                                Save name
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
