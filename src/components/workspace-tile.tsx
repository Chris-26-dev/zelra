import { workspaceHue } from "@/lib/identity";
import { cn } from "@/lib/utils";

const SIZES = {
    sm: "size-5 text-[10px] [--cut:4px]",
    md: "size-7 text-xs [--cut:6px]",
    lg: "size-10 text-base [--cut:9px]",
    xl: "size-13 text-[22px] [--cut:12px]",
};

interface Props {
    name: string;
    size?: keyof typeof SIZES;
    className?: string;
}

// A workspace, drawn with the Z-cut and a colour picked from its name.
export const WorkspaceTile = ({ name, size = "lg", className }: Props) => {
    return (
        <span
            aria-hidden="true"
            className={cn("cut grid shrink-0 place-items-center font-display font-semibold text-white", SIZES[size], className)}
            style={{ background: workspaceHue(name) }}
        >
            {name.charAt(0).toUpperCase()}
        </span>
    );
};
