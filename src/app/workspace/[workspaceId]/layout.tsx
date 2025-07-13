"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Loader2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/features/auth/api/use-current-user";

interface Props {
    children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: Props) => {
    const { parentMessageId, profileMemberId, onClose } = usePanel();

    const showPanel = !!parentMessageId || !!profileMemberId;

    // Prevent SSR mismatch by waiting for hydration
    const [isHydrated, setIsHydrated] = useState(false);
    const { data: user } = useCurrentUser();
    const isMobile = useIsMobile();

    const autoSaveId = user?._id ? `za-workspace-layout-${user._id}` : undefined;

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return null; // or show loader
    }

    return (
        <div className="h-full ">
            <Toolbar />
            <div className="flex h-[calc(100vh-40px)]">
                <Sidebar />
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId={autoSaveId}
                >
                    <ResizablePanel
                        defaultSize={20}
                        minSize={5}
                        //sidebar color
                        className="bg-blue-500"
                    >
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    {isMobile ? (
                        <ResizableHandle withHandle />
                    ) : (
                        <ResizableHandle/>
                    )}

                    <ResizablePanel minSize={20} defaultSize={80}>
                        {children}
                    </ResizablePanel>
                    {showPanel && (
                        <>
                            <ResizableHandle />
                            <ResizablePanel minSize={20} defaultSize={29}>
                                {parentMessageId ? (
                                    <Thread
                                        messageId={parentMessageId as Id<"messages">}
                                        onClose={onClose}
                                    />
                                ) : profileMemberId ? (
                                    <Profile
                                        memberId={profileMemberId as Id<"members">}
                                        onClose={onClose}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default WorkspaceLayout;