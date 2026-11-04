import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

// A password field with a show/hide toggle and a Caps Lock warning.
export const PasswordInput = (props: React.ComponentProps<"input">) => {
    const [visible, setVisible] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLock(e.getModifierState?.("CapsLock") ?? false);
    };

    return (
        <div className="grid gap-1.5">
            <div className="relative">
                <Input
                    {...props}
                    type={visible ? "text" : "password"}
                    className="pr-11"
                    onKeyDown={(e) => { checkCaps(e); props.onKeyDown?.(e); }}
                    onKeyUp={(e) => { checkCaps(e); props.onKeyUp?.(e); }}
                    onBlur={(e) => { setCapsLock(false); props.onBlur?.(e); }}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                >
                    {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
            </div>
            <p aria-live="polite" className="text-xs font-medium text-cobalt-ink empty:hidden">
                {capsLock ? "Caps Lock is on" : ""}
            </p>
        </div>
    );
};
