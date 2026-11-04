"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo-mark";
import { UserButton } from "@/features/auth/components/user-button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { cn } from "@/lib/utils";

// Shown when someone belongs to no workspace yet. Step 1 creates the workspace (with #general);
// steps 2 and 3 describe what happens next, inside the new workspace.
export const FirstRun = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const { mutate, isPending } = useCreateWorkspace();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ name }, {
            onSuccess(id) {
                toast.success("Workspace created");
                router.push(`/workspace/${id}`);
            },
            onError() {
                toast.error("Failed to create workspace");
            },
        });
    };

    const steps = [
        {
            title: "Name your workspace",
            body: "Usually your team or company name. You can change it later.",
            current: true,
        },
        {
            title: "Start in #general",
            body: "Every new workspace comes with a #general channel. Add more channels for each topic.",
        },
        {
            title: "Invite your team",
            body: "Share the invite link and code from Workspace settings. People join as members, and you can make them admins later.",
        },
    ];

    return (
        <div className="flex min-h-dvh bg-night text-n-ink hatch">
            <aside className="hidden w-[68px] shrink-0 flex-col items-center py-3 md:flex">
                <div className="mt-auto">
                    <UserButton />
                </div>
            </aside>
            <main className="min-w-0 flex-1 md:py-2 md:pr-2">
                <div className="h-full min-h-dvh overflow-y-auto bg-paper text-ink md:min-h-0 md:cut md:[--cut:16px]">
                    <div className="flex justify-end px-4 pt-4 md:hidden">
                        <UserButton side="bottom" />
                    </div>
                    <div className="mx-auto grid max-w-2xl content-start gap-7 px-5 pb-10 pt-4 md:px-10 md:py-14">
                        <div className="grid gap-4">
                            <div className="cut grid size-14 place-items-center bg-night text-n-ink hatch [--cut:12px]">
                                <LogoMark animated className="h-7 w-9" />
                            </div>
                            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">
                                Set up your first workspace
                            </h1>
                            <p className="max-w-xl text-[15px] text-ink-2">
                                A workspace is where your team&apos;s channels and conversations live. Have an invite link instead? Open it and you&apos;ll join that workspace directly.
                            </p>
                        </div>
                        <ol className="grid gap-3">
                            {steps.map((step, i) => (
                                <li
                                    key={step.title}
                                    aria-current={step.current ? "step" : undefined}
                                    className={cn(
                                        "grid grid-cols-[36px_1fr] items-start gap-4 rounded-xl border bg-card p-4 md:p-5",
                                        step.current ? "border-cobalt shadow-[0_0_0_3px_var(--wash)]" : "border-line"
                                    )}
                                >
                                    <span className={cn(
                                        "cut grid size-9 place-items-center font-display text-sm font-semibold [--cut:8px]",
                                        step.current ? "bg-cobalt text-on-cobalt" : "bg-hover text-ink-2"
                                    )}>
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-semibold">{step.title}</h2>
                                        <p className="mt-0.5 text-[13px] text-ink-2">{step.body}</p>
                                        {step.current && (
                                            <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                                                <label htmlFor="first-workspace-name" className="sr-only">Workspace name</label>
                                                <Input
                                                    id="first-workspace-name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    disabled={isPending}
                                                    required
                                                    autoFocus
                                                    minLength={3}
                                                    placeholder="e.g. Harbor Labs"
                                                    className="sm:max-w-xs"
                                                />
                                                <Button disabled={isPending || name.trim().length < 3}>
                                                    {isPending ? "Creating…" : "Create workspace"}
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <p className="flex items-center gap-2 text-[13px] text-ink-3">
                            <LinkIcon className="size-4" />
                            Invite links look like <span className="font-mono text-ink-2">/join/…</span> and ask for a 6-character code.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};
