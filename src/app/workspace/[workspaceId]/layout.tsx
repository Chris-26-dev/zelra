"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { WorkspaceRail } from "./workspace-rail";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { MobileNav } from "./mobile-nav";
import { usePanel } from "@/hooks/use-panel";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { ChannelDetails } from "@/features/channels/components/channel-details";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useChannelId } from "@/hooks/use-channel-id";
import { useCommandPalette } from "@/features/workspaces/store/use-shell-state";
import { CommandPalette } from "@/components/command-palette";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ZelraLoader } from "@/components/zelra-loader";
import { cn } from "@/lib/utils";

interface Props {
    children: React.ReactNode;
}

// A conversation or panel page set into the night frame. On phones it fills the screen.
const Canvas = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-paper text-ink md:cut md:[--cut:16px]", className)}>
        {children}
    </div>
);

const WorkspaceLayout = ({ children }: Props) => {
    const { parentMessageId, profileMemberId, channelInfoOpen, onClose } = usePanel();
    const channelId = useChannelId();
    const [, setPalette] = useCommandPalette();

    const showInfo = channelInfoOpen && !!channelId;
    const showPanel = !!parentMessageId || !!profileMemberId || showInfo;

    // Prevent SSR mismatch by waiting for hydration
    const [isHydrated, setIsHydrated] = useState(false);
    const { data: user } = useCurrentUser();
    const isMobile = useIsMobile();
    const isDesktop = useIsDesktop();

    const autoSaveId = user?._id ? `zelra-shell-v2-${user._id}` : undefined;

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Ctrl/⌘ K opens Jump to from anywhere in a workspace.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPalette((p) => ({ open: !p.open, scope: "all" }));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setPalette]);

    if (!isHydrated) {
        return (
            <div className="grid h-dvh place-items-center bg-night text-n-ink-3 hatch">
                <ZelraLoader label="Loading Zelra" />
            </div>
        );
    }

    const panel = parentMessageId ? (
        <Thread
            messageId={parentMessageId as Id<"messages">}
            onClose={onClose}
        />
    ) : profileMemberId ? (
        <Profile
            memberId={profileMemberId as Id<"members">}
            onClose={onClose}
        />
    ) : showInfo ? (
        <ChannelDetails onClose={onClose} />
    ) : null;

    return (
        <div className="flex h-dvh bg-night text-n-ink hatch">
            {!isMobile && <WorkspaceRail />}
            {isDesktop ? (
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId={autoSaveId}
                >
                    <ResizablePanel id="sidebar" order={1} defaultSize={19} minSize={14} maxSize={30}>
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    <ResizableHandle className="w-1 bg-transparent after:w-2 hover:bg-n-line" />
                    <ResizablePanel id="main" order={2} minSize={30} defaultSize={81}>
                        <div className="h-full py-2 pr-2">
                            <Canvas>{children}</Canvas>
                        </div>
                    </ResizablePanel>
                    {showPanel && (
                        <>
                            <ResizableHandle className="w-1 bg-transparent after:w-2 hover:bg-n-line" />
                            <ResizablePanel id="panel" order={3} minSize={20} maxSize={45} defaultSize={27}>
                                <div className="h-full py-2 pr-2 motion-safe:animate-panel-in">
                                    <Canvas>{panel}</Canvas>
                                </div>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            ) : (
                <>
                    {!isMobile && (
                        <div className="w-60 shrink-0">
                            <WorkspaceSidebar />
                        </div>
                    )}
                    <main className="min-w-0 flex-1 md:py-2 md:pr-2">
                        <Canvas>{children}</Canvas>
                    </main>
                    <Sheet open={showPanel} onOpenChange={(open) => { if (!open) onClose(); }}>
                        <SheetContent
                            side="right"
                            className="w-full gap-0 border-0 p-0 sm:max-w-[420px] [&>button]:hidden"
                        >
                            <SheetTitle className="sr-only">Details</SheetTitle>
                            <SheetDescription className="sr-only">Thread, profile or channel details</SheetDescription>
                            {panel}
                        </SheetContent>
                    </Sheet>
                    {isMobile && <MobileNav />}
                </>
            )}
            <CommandPalette />
        </div>
    );
};

export default WorkspaceLayout;
