import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    label?: string;
}

// Three leaning strokes from the logo, pulsing in sequence. Replaces bare spinners.
export const ZelraLoader = ({ className, label = "Loading" }: Props) => {
    return (
        <span role="status" aria-label={label} className={cn("inline-flex items-center gap-[3px]", className)}>
            {[0, 150, 300].map((delay) => (
                <i
                    key={delay}
                    className="block h-4 w-[5px] -skew-x-[18deg] bg-current opacity-25 animate-stroke"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </span>
    );
};
