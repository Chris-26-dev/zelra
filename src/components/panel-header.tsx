import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

// Header of the side panel (thread, profile, channel details).
export const PanelHeader = ({ title, subtitle, onClose }: Props) => {
    return (
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line pl-5 pr-2.5 md:h-[58px]">
            <h2 className="truncate font-display text-[15px] font-semibold">{title}</h2>
            {subtitle && <span className="truncate text-[12.5px] text-ink-3">{subtitle}</span>}
            <Button onClick={onClose} size="iconSm" variant="ghost" className="ml-auto" aria-label={`Close ${title.toLowerCase()}`}>
                <XIcon className="size-[18px]" />
            </Button>
        </div>
    );
};
