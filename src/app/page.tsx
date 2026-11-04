"use client";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { ZelraLoader } from "@/components/zelra-loader";
import { FirstRun } from "@/features/workspaces/components/first-run";

export default function Home() {
  const router = useRouter();

  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`)
    }
  }, [workspaceId, isLoading, router])

  // No workspaces yet: guide the person through setting one up.
  if (!isLoading && !workspaceId) {
    return <FirstRun />;
  }

  return (
    <div className="grid h-full min-h-dvh place-items-center bg-night text-n-ink-3 hatch">
      <ZelraLoader label="Opening your workspace" />
    </div>
  );
}
