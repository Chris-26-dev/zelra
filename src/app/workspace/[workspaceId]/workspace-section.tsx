import { Hint } from "@/components/hint";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useToggle } from "react-use";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface Props {
    children: React.ReactNode;
    label: string;
    hint: string;
    onNew?: () => void;
}

export const WorkspaceSection = ({
    children,
    label,
    hint,
    onNew,
}: Props) => {
    const [on, toggle] = useToggle(true);
    const listId = useId();

    return (
        <div className="mt-3 flex flex-col">
            <div className="flex h-7 items-center pl-1.5 pr-1">
                <button
                    onClick={toggle}
                    aria-expanded={on}
                    aria-controls={listId}
                    className="flex flex-1 items-center gap-1 rounded-md px-1 py-0.5 text-xs font-semibold text-n-ink-3 transition-colors hover:text-n-ink"
                >
                    <ChevronDownIcon className={cn("size-3.5 transition-transform duration-150", !on && "-rotate-90")} />
                    {label}
                </button>
                {onNew && (
                    <Hint label={hint} side="top">
                        <button
                            onClick={onNew}
                            aria-label={hint}
                            className="grid size-6 place-items-center rounded-md text-n-ink-3 transition-colors hover:bg-n-hover hover:text-n-ink"
                        >
                            <PlusIcon className="size-4" />
                        </button>
                    </Hint>
                )}
            </div>
            <div id={listId} hidden={!on} className="flex flex-col gap-px">
                {children}
            </div>
        </div>
    )
}
