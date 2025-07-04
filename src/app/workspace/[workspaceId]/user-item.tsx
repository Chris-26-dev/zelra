import { Button } from "@/components/ui/button"
import { Id } from "../../../../convex/_generated/dataModel"
import { cva, type VariantProps } from "class-variance-authority";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userItemVariants = cva(
    "flex items-center gap-1.5 justify-start font-normal h-7 text-sm overflow-hidden",
    {
        variants: {
            variant: {
                default: "text-[#f9edffcc]",
                active: "text-blue-600 bg-white/90 hover:bg-white/90",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface Props {
    id: Id<"members">;
    label?: string;
    image?: string;
    variant?: VariantProps<typeof userItemVariants>["variant"];
};

export const UserItem = ({
    id,
    label = "Member",
    image,
    variant,
}:Props) => {
    const workspaceId = useWorkspaceId();
    const avatarFallback = label.charAt(0).toUpperCase();

    return (
        <Button
            variant="transparent"
            className={cn(userItemVariants({ variant: variant}),
         "pl-2 pr-2 py-1 h-7 w-full justify-start"
        )}
            size="sm"
            asChild
        >
            <Link href={`/workspace/${workspaceId}/member/${id}`}>
                <Avatar className="size-5 rounded-md mr-1">
                    <AvatarImage className="rounded-md" src={image}/>
                    <AvatarFallback className="rounded-sm bg-sky-500 text-white text-xs">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{label}</span>
            </Link>
        </Button>
    );
};