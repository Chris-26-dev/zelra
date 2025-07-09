import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Props {
    name: string;
    image?: string;
    joinedAt?: Date; // Optional, can be used to show when the DM was started
}

export const ConversationHero = ({ name, image, joinedAt }: Props) => {
    const avatarFallback = name.charAt(0).toUpperCase();

    return (
        <div className="mt-[88px] mx-6 mb-6">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
            </div>
            <div className="flex p-0 mt-3">
                <p className="font-normal text-slate-800 mb-4">This conversation is just between you and <strong>{name}</strong></p>
            </div>
            {joinedAt && (
                <div className="mt-1 text-sm text-muted-foreground">
                    <p>
                        You started this conversation on{" "}
                        <span className="font-medium text-gray-900">
                            {format(joinedAt, "MMMM do, yyyy")}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};
