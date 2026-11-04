import { format } from "date-fns";

import { MemberAvatar } from "@/components/member-avatar";
import { useCurrentUser } from "@/features/auth/api/use-current-user";

interface Props {
    name: string;
    image?: string;
    joinedAt?: Date; // Optional, can be used to show when the DM was started
}

export const ConversationHero = ({ name, image, joinedAt }: Props) => {
    const { data: me } = useCurrentUser();

    return (
        <div className="mx-5 mb-4 mt-12 grid justify-items-center gap-2.5 text-center">
            <div className="flex gap-1.5">
                {me && <MemberAvatar name={me.name ?? "You"} image={me.image} size="xl" />}
                <MemberAvatar name={name} image={image} size="xl" />
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">You and {name}</h1>
            <p className="text-sm text-ink-2">This conversation is just between you and {name}.</p>
            {joinedAt && (
                <p className="text-xs text-ink-3">
                    You started this conversation on {format(joinedAt, "MMMM do, yyyy")}
                </p>
            )}
        </div>
    );
};
