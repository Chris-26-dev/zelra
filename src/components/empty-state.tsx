import { cn } from "@/lib/utils";

interface Props {
    icon?: React.ReactNode;
    title: string;
    description?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

// An empty, error or not-found screen that says what happened and what to do next.
export const EmptyState = ({ icon, title, description, children, className }: Props) => {
    return (
        <div className={cn("flex h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center", className)}>
            {icon && (
                <div className="cut grid size-14 place-items-center bg-night text-n-ink hatch [--cut:12px] [&_svg]:size-6">
                    {icon}
                </div>
            )}
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="max-w-sm text-sm text-ink-2">{description}</p>}
            {children && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{children}</div>}
        </div>
    );
};
