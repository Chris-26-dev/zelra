import { format } from "date-fns";
import { CopyIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/member-avatar";
import { Doc } from "../../../../../../convex/_generated/dataModel";

interface Props {
    // From members.getById: the same profile fields the profile panel shows.
    member: Doc<"members"> & { user: { name?: string; image?: string; email?: string } };
    onViewProfile: () => void;
}

// Docked beside a DM on wide screens.
export const PersonCard = ({ member, onViewProfile }: Props) => {
    const name = member.user.name ?? "Member";

    const copyEmail = () => {
        if (!member.user.email) return;
        navigator.clipboard
            .writeText(member.user.email)
            .then(() => toast.success("Email copied"))
            .catch(() => toast.error("Couldn't copy the email"));
    };

    return (
        <aside aria-label={`About ${name}`} className="hidden w-72 shrink-0 flex-col border-l border-line min-[1400px]:flex">
            <div className="grid justify-items-center gap-2 px-5 pb-5 pt-8 text-center">
                <MemberAvatar name={name} image={member.user.image} size="3xl" />
                <h2 className="mt-1.5 font-display text-xl font-semibold">{name}</h2>
                <Badge variant={member.role === "admin" ? "default" : "muted"}>{member.role === "admin" ? "Admin" : "Member"}</Badge>
                <p className="text-[12.5px] text-ink-3">Member since {format(member._creationTime, "MMM d, yyyy")}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onViewProfile}>
                    View full profile
                </Button>
            </div>
            {member.user.email && (
                <div className="grid gap-2 border-t border-line px-5 py-4">
                    <h3 className="text-xs font-semibold text-ink-3">Contact</h3>
                    <div className="flex items-center gap-2.5 text-[13px]">
                        <MailIcon className="size-4 shrink-0 text-ink-3" />
                        <span className="truncate">{member.user.email}</span>
                        <Button variant="ghost" size="iconXs" className="ml-auto" onClick={copyEmail} aria-label="Copy email">
                            <CopyIcon className="size-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </aside>
    );
};
