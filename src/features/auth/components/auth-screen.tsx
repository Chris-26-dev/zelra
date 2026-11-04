"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { SignInFlow } from "../types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";
import { AuthShowcase } from "./auth-showcase";
import { LogoMark } from "@/components/logo-mark";
import { cn } from "@/lib/utils";

// Split stage: the night pane assembles the mark once and hosts a small working preview of Zelra;
// the form sits on paper. The seam between them leans at the logo's 18°.
export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

    return (
        <div className="relative min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[1.1fr_1fr]">
            <ThemeToggle />
            <section className="relative flex flex-col gap-4 overflow-hidden bg-night px-6 pb-16 pt-8 text-n-ink hatch lg:gap-10 lg:py-12 lg:pl-12 lg:pr-28 lg:[clip-path:polygon(0_0,100%_0,calc(100%-104px)_100%,0_100%)]">
                <div className="flex items-center gap-3 font-display text-[22px] font-semibold tracking-[0.01em]">
                    <LogoMark animated className="h-8 w-10" />
                    Zelra
                </div>
                <div className="max-w-md lg:mt-auto">
                    <h1 className="font-display text-[26px] font-semibold leading-[1.08] tracking-[-0.025em] text-balance lg:text-[40px]">
                        Every workspace, one place to talk.
                    </h1>
                    <p className="mt-3 max-w-sm text-sm text-n-ink-2 lg:text-base">
                        Channels, direct messages and threads for teams that span several workspaces. Switch between them in one click.
                    </p>
                </div>
                <div className="hidden xl:mb-auto xl:block">
                    <AuthShowcase />
                </div>
            </section>
            <section className="relative -mt-10 flex justify-center px-3.5 pb-10 lg:mt-0 lg:items-center lg:px-10 lg:py-10">
                <div className="cut w-full max-w-[400px] bg-card p-6 [--cut:16px] lg:bg-transparent lg:p-0 lg:[--cut:0px]">
                    <Tabs state={state} setState={setState} />
                    <div key={state} className="mt-6 motion-safe:animate-rise">
                        {state === "signIn" ? <SignInCard setState={setState}/> : <SignUpCard setState={setState}/> }
                    </div>
                </div>
            </section>
        </div>
    )
}

const Tabs = ({ state, setState }: { state: SignInFlow; setState: (s: SignInFlow) => void }) => (
    <div role="tablist" aria-label="Account" className="relative grid grid-cols-2 rounded-lg bg-hover p-[3px]">
        <span
            aria-hidden="true"
            className={cn(
                "lean-both absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] bg-cobalt transition-transform duration-[260ms] ease-[cubic-bezier(.3,.7,.2,1)]",
                state === "signUp" && "translate-x-full"
            )}
        />
        {(["signIn", "signUp"] as const).map((flow) => (
            <button
                key={flow}
                role="tab"
                type="button"
                aria-selected={state === flow}
                onClick={() => setState(flow)}
                className={cn(
                    "relative z-10 h-8 text-[13px] font-semibold transition-colors duration-200",
                    state === flow ? "text-on-cobalt" : "text-ink-2 hover:text-ink"
                )}
            >
                {flow === "signIn" ? "Sign in" : "Create account"}
            </button>
        ))}
    </div>
);

// Day/Night before sign-in, since the account menu isn't available yet.
const ThemeToggle = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isNight = resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isNight ? "light" : "dark")}
            aria-label={isNight ? "Switch to day theme" : "Switch to night theme"}
            title={isNight ? "Day theme" : "Night theme"}
            className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-lg text-n-ink-2 transition-colors hover:bg-n-hover hover:text-n-ink lg:right-5 lg:top-5 lg:text-ink-2 lg:hover:bg-hover lg:hover:text-ink"
        >
            {isNight ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
        </button>
    );
};
