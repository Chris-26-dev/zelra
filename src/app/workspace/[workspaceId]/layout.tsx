"use client";

import { Toolbar } from "./toolbar";

interface Props {
    children: React.ReactNode;
}

const WorkspaceLayout = ({ children }:Props) => {
    return (
        <div className="h-full ">
            <Toolbar />
            {children}
        </div>
    );
};

export default WorkspaceLayout;