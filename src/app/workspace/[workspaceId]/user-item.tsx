import { Id } from "../../../../convex/_generated/dataModel"
import { type VariantProps } from "class-variance-authority";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { MemberAvatar } from "@/components/member-avatar";
import { navRowVariants } from "./sidebar-item";

interface Props {
    id: Id<"members">;
    label?: string;
    image?: string;
    isYou?: boolean;
    variant?: VariantProps<typeof navRowVariants>["variant"];
    onNavigate?: () => void;
};

export const UserItem = ({
    id,
    label = "Member",
    image,
    isYou,
    variant,
    onNavigate,
}:Props) => {
    const workspaceId = useWorkspaceId();

    return (
        <Link
            href={`/workspace/${workspaceId}/member/${id}`}
            onClick={onNavigate}
            aria-current={variant === "active" ? "page" : undefined}
            className={cn(navRowVariants({ variant }), "pl-2.5")}
        >
            <MemberAvatar name={label} image={image} size="xs" />
            <span className="truncate">{label}</span>
            {isYou && <span className="text-xs opacity-70">you</span>}
        </Link>
    );
};
