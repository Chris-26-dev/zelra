import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    // Assemble the three strokes once on mount (auth and first run only).
    animated?: boolean;
    accent?: boolean;
}

// The Zelra mark: three angular strokes interlocking into a Z.
export const LogoMark = ({ className, animated, accent = true }: Props) => {
    return (
        <svg viewBox="0 0 50 40" aria-hidden="true" className={cn("h-8 w-10 fill-current", className)}>
            <path
                className={cn(animated && "motion-safe:animate-[mark-a_.7s_cubic-bezier(.2,.8,.2,1)_both]")}
                d="M43 5L38 9H21L18 5L10 29L5 33H0L7 9L19 0H45L43 5Z"
            />
            <path
                className={cn(animated && "motion-safe:animate-[mark-b_.7s_.12s_cubic-bezier(.2,.8,.2,1)_both]")}
                d="M43 31L31 40H5L7 35L12 31H29L32 35L40 11L45 7H50L43 31Z"
            />
            <path
                className={cn(accent && "fill-spark", animated && "motion-safe:animate-[mark-c_.5s_.32s_ease-out_both]")}
                d="M24 13H35L29 31L26 27H15L21 9L24 13Z"
            />
        </svg>
    );
};
