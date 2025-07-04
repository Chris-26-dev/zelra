import { Button } from "@/components/ui/button"
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { Info, SearchIcon } from "lucide-react"
import Image from "next/image";

export const Toolbar = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetWorkspace({ id: workspaceId });

    return (
        <nav className="bg-blue-600 flex items-center justify-between h-10 p-1.5">
            <div className="flex items-center px-3.5">
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="size-6 cursor-pointer"
                />
            </div>
            <div className="flex-1"/>
            <div className="min-w-[280px] max-[642px] grow-[2] shrink">
                <Button size="sm" className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2">
                    <SearchIcon className="size-4 text-white mr-2" />
                    <span className="text-white text-xs">
                        Search {data?.name}
                    </span>
                </Button>
            </div>
            <div className="ml-auto flex-1 flex items-center justify-end">
                <Button variant="transparent" size="iconSm">
                    <Info className="size-5 text-white" />
                </Button>
            </div>
        </nav>
    )
}