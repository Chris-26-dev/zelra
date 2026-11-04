import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { ChevronDownIcon, CopyIcon, LogOutIcon, MailIcon, MessageSquareTextIcon, UserXIcon } from "lucide-react";
import { useGetMember } from "../api/use-get-member";
import Link from "next/link";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useCurrentMember } from "../api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useMemberId } from "@/hooks/use-member-id";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/member-avatar";
import { PanelHeader } from "@/components/panel-header";
import { EmptyState } from "@/components/empty-state";
import { ZelraLoader } from "@/components/zelra-loader";

interface Props {
    memberId: Id<"members">;
    onClose: () => void;
};

export const Profile = ({ memberId, onClose }: Props) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const routeMemberId = useMemberId();

    const [LeaveDialog, confirmLeave] = useConfirm(
        "Leave this workspace?",
        "You'll lose access to its channels and messages. You'll need a new invite to rejoin.",
        { confirmLabel: "Leave workspace", tone: "danger" },
    );

    const [RemoveDialog, confirmRemove] = useConfirm(
        "Remove this member?",
        "They'll lose access to the workspace and its channels. You can invite them again later.",
        { confirmLabel: "Remove member", tone: "danger" },
    );

    const [UpdateDialog, confirmUpdate] = useConfirm(
        "Change role?",
        "Admins can create and delete channels, change roles, remove members and manage invites.",
        { confirmLabel: "Change role" },
    );

    const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({ workspaceId });
    const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });

    const { mutate: updateMember } = useUpdateMember();
    const { mutate: removeMember } = useRemoveMember();

    const onRemove = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        removeMember({ id: memberId }, {
            onSuccess: () => {
                toast.success("Member removed");
                onClose();
            },
            onError: () => {
                toast.error("Failed to remove member")
            }
        })
    };

    const onLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;

        removeMember({ id: memberId }, {
            onSuccess: () => {
                router.replace("/");
                toast.success("You left the workspace");
                onClose();
            },
            onError: () => {
                toast.error("Failed to leave the workspace")
            }
        })
    };

    const onUpdate = async (role: "admin" | "member") => {
        const ok = await confirmUpdate();

        if (!ok) return;

        updateMember({ id: memberId, role }, {
            onSuccess: () => {
                toast.success("Role changed");
                onClose();
            },
            onError: () => {
                toast.error("Failed to change role")
            }
        })
    };

    const copyEmail = (email: string) => {
        navigator.clipboard
            .writeText(email)
            .then(() => toast.success("Email copied"))
            .catch(() => toast.error("Couldn't copy the email"));
    };

    if (isLoadingMember || isLoadingCurrentMember) {
        return (
            <div className="h-full flex flex-col">
                <PanelHeader title="Profile" onClose={onClose} />
                <div className="grid flex-1 place-items-center text-ink-3">
                    <ZelraLoader label="Loading profile" />
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="h-full flex flex-col">
                <PanelHeader title="Profile" onClose={onClose} />
                <EmptyState
                    icon={<UserXIcon />}
                    title="Profile not found"
                    description="This person may have left the workspace."
                />
            </div>
        );
    }

    const name = member.user.name ?? "Member";
    const isSelf = currentMember?._id === memberId;
    const canManage = currentMember?.role === "admin" && !isSelf;
    const canLeave = isSelf && currentMember?.role !== "admin";

    return (
        <>
            <UpdateDialog />
            <RemoveDialog />
            <LeaveDialog />
            <div className="h-full flex flex-col">
                <PanelHeader title="Profile" onClose={onClose} />
                <div className="min-h-0 flex-1 overflow-y-auto messages-scrollbar">
                    <div className="grid justify-items-center gap-2 px-5 pb-5 pt-7 text-center">
                        <MemberAvatar name={name} image={member.user.image} size="3xl" />
                        <h2 className="mt-1.5 font-display text-xl font-semibold">{name}</h2>
                        <Badge variant={member.role === "admin" ? "default" : "muted"}>
                            {member.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                        <p className="text-[12.5px] text-ink-3">Member since {format(member._creationTime, "MMM d, yyyy")}</p>
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                            {routeMemberId !== memberId && (
                                <Button asChild size="sm">
                                    <Link href={`/workspace/${workspaceId}/member/${memberId}`}>
                                        <MessageSquareTextIcon />
                                        {isSelf ? "Notes to self" : "Message"}
                                    </Link>
                                </Button>
                            )}
                            {member.user.email && (
                                <Button size="sm" variant="outline" onClick={() => copyEmail(member.user.email!)}>
                                    <CopyIcon />
                                    Copy email
                                </Button>
                            )}
                        </div>
                    </div>
                    <section className="grid gap-2.5 border-t border-line px-5 py-4">
                        <h3 className="text-xs font-semibold text-ink-3">Contact information</h3>
                        <div className="flex items-center gap-3">
                            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-hover text-ink-2">
                                <MailIcon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-ink-3">Email address</p>
                                <Link
                                    href={`mailto:${member.user.email}`}
                                    className="block truncate text-sm text-cobalt-ink hover:underline"
                                >
                                    {member.user.email}
                                </Link>
                            </div>
                        </div>
                    </section>
                    {canManage && (
                        <section className="grid gap-3 border-t border-line px-5 py-4">
                            <h3 className="text-xs font-semibold text-ink-3">Manage member</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="capitalize" aria-label={`Role: ${member.role}`}>
                                            Role: {member.role} <ChevronDownIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                        <DropdownMenuRadioGroup
                                            value={member.role}
                                            onValueChange={(role) => onUpdate(role as "admin" | "member")}
                                        >
                                            <DropdownMenuRadioItem value="admin">
                                                Admin
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="member">
                                                Member
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={onRemove} size="sm" variant="destructive-outline">
                                    <UserXIcon />
                                    Remove from workspace
                                </Button>
                            </div>
                        </section>
                    )}
                    {canLeave && (
                        <section className="border-t border-line px-5 py-4">
                            <Button onClick={onLeave} size="sm" variant="destructive-outline">
                                <LogOutIcon />
                                Leave workspace
                            </Button>
                        </section>
                    )}
                </div>
            </div>
        </>
    )
};
