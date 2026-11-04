"use client";

import { useEffect, useRef, useState } from "react";

import { MemberAvatar } from "@/components/member-avatar";
import { WorkspaceTile } from "@/components/workspace-tile";
import { ZelraLoader } from "@/components/zelra-loader";
import { cn } from "@/lib/utils";

type Reaction = { emoji: string; count: number; mine: boolean };
type DemoMessage = { name: string; time: string; text: string; reactions?: Reaction[]; replies?: number };
type Demo = { workspace: string; channel: string; messages: DemoMessage[] };

// Illustrative content for the sign-in preview. Nothing here comes from real workspaces.
const DEMOS: Demo[] = [
    {
        workspace: "Harbor Labs",
        channel: "design-review",
        messages: [
            { name: "Maya Chen", time: "9:41 AM", text: "Uploaded the revised onboarding flow. One step indicator instead of five dots.", reactions: [{ emoji: "👍", count: 3, mine: true }, { emoji: "👀", count: 1, mine: false }] },
            { name: "Daniel Okafor", time: "9:43 AM", text: "Engineering is fine with it. Ship it Thursday?", replies: 2 },
            { name: "Priya Raman", time: "9:44 AM", text: "Copy is frozen. Translations start tomorrow." },
        ],
    },
    {
        workspace: "Northwind Studio",
        channel: "client-acme",
        messages: [
            { name: "Lena Fischer", time: "2:10 PM", text: "Acme approved the second round of renders.", reactions: [{ emoji: "🎉", count: 4, mine: false }] },
            { name: "Sam Whitfield", time: "2:12 PM", text: "Sending the final files tonight." },
            { name: "Lena Fischer", time: "2:13 PM", text: "Perfect. Invoice goes out on Friday." },
        ],
    },
    {
        workspace: "Pine & Co",
        channel: "ops",
        messages: [
            { name: "Priya Raman", time: "10:02 AM", text: "Quarterly review notes are in the shared drive.", reactions: [{ emoji: "✅", count: 2, mine: false }] },
            { name: "Alex Rivera", time: "10:05 AM", text: "Thanks. I'll book the follow-up.", replies: 1 },
            { name: "Priya Raman", time: "10:06 AM", text: "Thursday at 10 works for everyone." },
        ],
    },
];

const SLOT = 48;
const CYCLE_MS = 6500;
const TYPING_MS = 1300;

// A small working mock of Zelra on the sign-in stage: switch workspaces, watch a message arrive, toggle reactions.
// It cycles on its own until someone interacts, pauses on hover, and stays still for reduced motion.
export const AuthShowcase = () => {
    const [active, setActive] = useState(0);
    const [phase, setPhase] = useState<"typing" | "arrived">("arrived");
    const [reactions, setReactions] = useState(() => DEMOS.map((d) => d.messages.map((m) => m.reactions ?? [])));
    const [popped, setPopped] = useState<string | null>(null);
    const [autoplay, setAutoplay] = useState(true);
    const [hovered, setHovered] = useState(false);
    const reducedMotion = useRef(false);

    useEffect(() => {
        reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion.current) setAutoplay(false);
    }, []);

    // Each switch: show the earlier messages, "type" for a moment, then the last message arrives.
    useEffect(() => {
        if (reducedMotion.current) {
            setPhase("arrived");
            return;
        }
        setPhase("typing");
        const t = setTimeout(() => setPhase("arrived"), TYPING_MS);
        return () => clearTimeout(t);
    }, [active]);

    useEffect(() => {
        if (!autoplay || hovered) return;
        const t = setTimeout(() => {
            if (document.visibilityState === "visible") setActive((a) => (a + 1) % DEMOS.length);
        }, CYCLE_MS);
        return () => clearTimeout(t);
    }, [active, autoplay, hovered]);

    const choose = (i: number) => {
        setAutoplay(false);
        if (i !== active) setActive(i);
    };

    const toggleReaction = (msg: number, emoji: string) => {
        setAutoplay(false);
        setPopped(`${active}-${msg}-${emoji}`);
        setReactions((all) => all.map((ws, w) => w !== active ? ws : ws.map((rs, m) => m !== msg ? rs : rs.map((r) =>
            r.emoji !== emoji ? r : { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
        ))));
    };

    const demo = DEMOS[active];
    const visible = phase === "typing" ? demo.messages.slice(0, -1) : demo.messages;
    const typist = demo.messages[demo.messages.length - 1].name;

    return (
        <div className="grid gap-3">
            <div
                role="group"
                aria-label="Zelra preview"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="cut flex h-[318px] w-full max-w-[480px] overflow-hidden bg-paper text-ink shadow-pop [--cut:18px]"
            >
                {/* Workspace rail */}
                <div className="relative flex w-14 shrink-0 flex-col items-center bg-night-2 py-2.5">
                    <span
                        aria-hidden="true"
                        className="stroke-mark absolute left-0 top-[23px] h-[22px] w-3 bg-n-ink transition-transform duration-[240ms] ease-[cubic-bezier(.3,.7,.2,1)]"
                        style={{ transform: `translateY(${active * SLOT}px)` }}
                    />
                    {DEMOS.map((d, i) => (
                        <button
                            key={d.workspace}
                            type="button"
                            onClick={() => choose(i)}
                            aria-label={`Preview ${d.workspace}`}
                            aria-pressed={i === active}
                            className="group grid h-12 w-14 place-items-center outline-offset-[-2px]"
                        >
                            <WorkspaceTile
                                name={d.workspace}
                                size="md"
                                className={cn(
                                    "size-8 transition-[filter,transform] duration-150 [--cut:7px] group-hover:-translate-y-px",
                                    i !== active && "saturate-[.5] brightness-90 group-hover:saturate-100 group-hover:brightness-110"
                                )}
                            />
                        </button>
                    ))}
                </div>
                {/* Channel */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div key={`h-${active}`} className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-4 motion-safe:animate-swap">
                        <span className="truncate font-display text-[13px] font-semibold">
                            <span className="text-ink-3">#</span>{demo.channel}
                        </span>
                        <span className="truncate text-[11px] text-ink-3">{demo.workspace}</span>
                    </div>
                    <div key={`m-${active}`} className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-4 pb-3 pt-2">
                        {visible.map((m, i) => {
                            const isLast = i === demo.messages.length - 1;
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "-mx-2 flex gap-2.5 px-2 py-1",
                                        isLast && phase === "arrived" ? "motion-safe:animate-fresh" : "motion-safe:animate-rise"
                                    )}
                                    style={{ animationDelay: isLast ? "0ms" : `${i * 90}ms`, animationFillMode: "both" }}
                                >
                                    <MemberAvatar name={m.name} size="md" className="size-7 text-[11px] [--cut:6px]" />
                                    <div className="min-w-0 text-[12.5px] leading-[18px]">
                                        <p>
                                            <span className="font-display font-semibold">{m.name}</span>{" "}
                                            <span className="text-[11px] text-ink-3">{m.time}</span>
                                        </p>
                                        <p className="text-ink">{m.text}</p>
                                        {reactions[active][i].length > 0 && (
                                            <div className="mt-1 flex gap-1">
                                                {reactions[active][i].map((r) => (
                                                    <button
                                                        key={r.emoji}
                                                        type="button"
                                                        onClick={() => toggleReaction(i, r.emoji)}
                                                        onAnimationEnd={() => setPopped(null)}
                                                        aria-pressed={r.mine}
                                                        aria-label={`${r.emoji} ${r.count}`}
                                                        className={cn(
                                                            "flex h-[22px] items-center gap-1 rounded-md border px-1.5 text-[11px] font-semibold transition-colors",
                                                            r.mine ? "border-cobalt bg-wash text-cobalt-ink" : "border-line bg-card text-ink-2 hover:border-line-2",
                                                            popped === `${active}-${i}-${r.emoji}` && "motion-safe:animate-pop"
                                                        )}
                                                    >
                                                        <span className="text-xs leading-none">{r.emoji}</span>
                                                        {r.count}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {m.replies && (
                                            <p className="mt-0.5 text-[11px] font-semibold text-cobalt-ink">
                                                {m.replies} {m.replies === 1 ? "reply" : "replies"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {phase === "typing" && (
                            <p className="flex items-center gap-2 px-0.5 text-[11.5px] text-ink-3" aria-live="polite">
                                <ZelraLoader className="scale-75 text-cobalt" label={`${typist} is typing`} />
                                {typist} is typing…
                            </p>
                        )}
                    </div>
                    <div className="mx-3 mb-3 flex h-8 shrink-0 items-center rounded-md border border-line-2 px-2.5 text-[11.5px] text-ink-3">
                        Message #{demo.channel}
                    </div>
                </div>
            </div>
            <p className="text-xs text-n-ink-3">
                Try it: pick a workspace or tap a reaction. The content is only an example.
            </p>
        </div>
    );
};
