import dynamic from "next/dynamic";
import type { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

import { ZelraLoader } from "./zelra-loader";

// The picker is large: load it only when someone opens it.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
    loading: () => (
        <div className="grid h-[420px] w-[340px] place-items-center text-ink-3">
            <ZelraLoader label="Loading emoji" />
        </div>
    ),
});

interface Props {
    children: React.ReactNode;
    hint?: string;
    onEmojiSelect: (value: string) => void;
};

export const EmojiPopover = ({
    children,
    hint = "Emoji",
    onEmojiSelect,
}: Props) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { resolvedTheme } = useTheme();

    const onSelect = (value: EmojiClickData) => {
        onEmojiSelect(value.emoji);
        setPopoverOpen(false);

        setTimeout(() => {
            setTooltipOpen(false);
        }, 500);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Tooltip
                open={tooltipOpen}
                onOpenChange={setTooltipOpen}
            >
                <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                    <p>{hint}</p>
                </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto overflow-hidden border-line p-0 shadow-pop">
                {popoverOpen && (
                    <EmojiPicker
                        onEmojiClick={onSelect}
                        theme={(resolvedTheme === "dark" ? "dark" : "light") as Theme}
                        lazyLoadEmojis
                    />
                )}
            </PopoverContent>
        </Popover>
    );
};
