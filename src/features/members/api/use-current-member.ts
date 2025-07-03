import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
    workspaceId: Id<"workspaces">;
};

export const useCurrentMember = ({workspaceId}:Props) => {
    const data = useQuery(api.members.current, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
};