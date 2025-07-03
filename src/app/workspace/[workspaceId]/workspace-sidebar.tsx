import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { AlertTriangle, Loader2 } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";

export const WorkspaceSidebar = () => {
    const workspaceId = useWorkspaceId();

    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });

    if (workspaceLoading || memberLoading) {
        return (
            //sidebar color
            <div className="flex flex-col bg-blue-500 h-full items-center justify-center">
                <Loader2 className="size-5 animate-spin text-white" />
            </div>
        );
    }

    if (!member || !workspace) {
        return (
            //sidebar color
            <div className="flex flex-col gap-y-2 bg-blue-500 h-full items-center justify-center">
                <AlertTriangle className="size-5 text-white" />
                <p className="text-white text-sm">
                    Workspace not found
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-blue-500 h-full">
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
        </div>
    )
}