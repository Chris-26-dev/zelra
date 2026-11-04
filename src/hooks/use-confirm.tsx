import { JSX, useEffect, useReducer, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface ConfirmOptions {
    confirmLabel?: string;
    // "danger" styles the confirm button as destructive (delete, remove, leave).
    tone?: "default" | "danger";
    // When set, the user must type this exact text before confirming.
    typedConfirmation?: string;
}

interface ViewProps extends ConfirmOptions {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmView = ({ open, title, description, confirmLabel = "Confirm", tone = "default", typedConfirmation, onConfirm, onCancel }: ViewProps) => {
    const [typed, setTyped] = useState("");

    useEffect(() => {
        if (open) setTyped("");
    }, [open]);

    const canConfirm = !typedConfirmation || typed === typedConfirmation;

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={(next) => { if (!next) onCancel(); }}
            title={title}
            description={description}
        >
            {typedConfirmation && (
                <div className="grid gap-1.5 pt-2">
                    <label htmlFor="confirm-typed" className="text-[13px] font-medium text-ink">
                        Type <span className="font-semibold">{typedConfirmation}</span> to confirm
                    </label>
                    <Input
                        id="confirm-typed"
                        autoComplete="off"
                        autoFocus
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                    />
                </div>
            )}
            <div className="pt-4 w-full flex flex-col-reverse gap-y-2 sm:flex-row gap-x-2 items-center justify-end">
                <Button onClick={onCancel} variant="outline" className="w-full sm:w-auto">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant={tone === "danger" ? "destructive" : "default"}
                    disabled={!canConfirm}
                    className="w-full sm:w-auto"
                >
                    {confirmLabel}
                </Button>
            </div>
        </ResponsiveDialog>
    );
};

export const useConfirm = (
    title: string,
    description: string,
    options: ConfirmOptions = {},
): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        });
    };

    const handleCLose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleCLose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleCLose();
    };

    // The dialog component keeps a stable identity so its contents (and the typed-confirmation
    // input's focus) survive re-renders of the caller; it reads the latest state through a ref.
    const latest = useRef<ViewProps>(null as unknown as ViewProps);
    latest.current = { ...options, open: promise !== null, title, description, onConfirm: handleConfirm, onCancel: handleCancel };
    const listeners = useRef(new Set<() => void>());

    useEffect(() => {
        listeners.current.forEach((notify) => notify());
    });

    const [ConfirmationDialog] = useState(() => function ConfirmationDialog() {
        const [, rerender] = useReducer((n: number) => n + 1, 0);

        useEffect(() => {
            const set = listeners.current;
            set.add(rerender);
            return () => { set.delete(rerender); };
        }, []);

        return <ConfirmView {...latest.current} />;
    });

    return [ConfirmationDialog, confirm];
};
