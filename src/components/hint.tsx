"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";

interface Props {
    label: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end",
    shortcut?: string;
};

export const Hint = ({
    label,
    children,
    side,
    align,
    shortcut,
}:Props) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} align={align}>
                <p className="flex items-center gap-2">
                    {label}
                    {shortcut && (
                        <span className="font-mono text-[10.5px] opacity-70">{shortcut}</span>
                    )}
                </p>
            </TooltipContent>
        </Tooltip>
    )
}
