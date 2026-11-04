import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, personHue } from "@/lib/identity";
import { cn } from "@/lib/utils";

const SIZES = {
    xs: "size-5 text-[9.5px] [--cut:4px]",
    sm: "size-6 text-[10.5px] [--cut:5px]",
    md: "size-8 text-xs [--cut:7px]",
    lg: "size-9 text-[13px] [--cut:8px]",
    xl: "size-10 text-sm [--cut:9px]",
    "2xl": "size-14 text-xl [--cut:12px]",
    "3xl": "size-22 text-[32px] [--cut:18px]",
};

interface Props {
    name?: string;
    image?: string;
    size?: keyof typeof SIZES;
    className?: string;
}

// A person, drawn with the Z-cut silhouette shared by every identity object.
export const MemberAvatar = ({ name = "Member", image, size = "lg", className }: Props) => {
    return (
        <Avatar className={cn("cut rounded-none", SIZES[size], className)}>
            <AvatarImage src={image} alt="" className="rounded-none" />
            <AvatarFallback
                className="rounded-none font-display font-semibold text-white"
                style={{ background: personHue(name), fontSize: "inherit" }}
            >
                {initials(name)}
            </AvatarFallback>
        </Avatar>
    );
};
