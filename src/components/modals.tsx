"use client";

import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { useEffect, useState } from "react";

export const Modals = () => {
    //Prevented a potential hydration error from happening here by ensuring that all models we add will only show on client side rendering
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return(
        <>
            <CreateWorkspaceModal />
        </>
    )
}