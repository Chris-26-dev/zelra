"use client";

import { Button } from "@/components/ui/button";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useJoin } from "@/features/workspaces/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

import { LogoMark } from "@/components/logo-mark";
import { WorkspaceTile } from "@/components/workspace-tile";
import { ZelraLoader } from "@/components/zelra-loader";

const JoinPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [failed, setFailed] = useState(false);

    const { mutate, isPending } = useJoin();
    const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });

    const isMember = useMemo(() => data?.isMember, [data?.isMember]);

    useEffect(() => {
        if (isMember) {
            router.push(`/workspace/${workspaceId}`)
        }
    }, [isMember, router, workspaceId]);

    const handleComplete = (value: string) => {
        setFailed(false);
        mutate({ workspaceId, joinCode: value }, {
            onSuccess: (id) => {
                router.replace(`/workspace/${id}`)
                toast.success("Workspace joined");
            },
            onError: () => {
                setFailed(true);
                toast.error("Failed to join workspace")
            }
        })
    };

    if (isLoading) {
        return (
            <div className="grid h-full min-h-dvh place-items-center bg-night text-n-ink-3 hatch">
                <ZelraLoader label="Loading invite" />
            </div>
        )
    }

    const name = data?.name ?? "this workspace";

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-night px-4 py-10 text-n-ink hatch">
            <div className="flex items-center gap-3 font-display text-xl font-semibold">
                <LogoMark className="h-7 w-9" />
                Zelra
            </div>
            <div className="cut grid w-full max-w-[460px] justify-items-center gap-6 bg-card px-6 py-8 text-center text-ink [--cut:18px] sm:px-10">
                {data?.name && <WorkspaceTile name={data.name} size="xl" />}
                <div className="grid gap-2">
                    <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">
                        Join {name}
                    </h1>
                    <p className="text-sm text-ink-2">
                        Enter the 6-character invite code you were given.
                    </p>
                </div>
                <VerificationInput
                    onComplete={handleComplete}
                    length={6}
                    inputProps={{ "aria-label": "Invite code", disabled: isPending, autoComplete: "one-time-code" }}
                    classNames={{
                        container: cn("flex gap-x-1.5 sm:gap-x-2", isPending && "opacity-50 cursor-not-allowed"),
                        character: "cut h-auto w-10 sm:w-12 [--cut:8px] !border-0 flex items-center justify-center font-mono text-xl font-medium uppercase !text-ink !bg-hover",
                        characterInactive: "!bg-hover !text-ink-3",
                        characterSelected: "!bg-wash !text-ink shadow-[inset_0_0_0_2px_var(--cobalt)] !outline-none",
                        characterFilled: "!bg-card !text-ink shadow-[inset_0_0_0_1px_var(--line-2)]"
                    }}
                    autoFocus
                />
                <div className="min-h-6" aria-live="polite">
                    {isPending && <ZelraLoader className="text-ink-3" label="Joining" />}
                    {failed && !isPending && (
                        <p role="alert" className="flex items-center gap-2 text-sm text-danger">
                            <OctagonAlertIcon className="size-4" />
                            That code didn&apos;t work. Check it with the person who invited you.
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    asChild
                >
                    <Link href="/">
                        Back to Zelra
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default JoinPage;
