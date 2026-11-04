import { format } from "date-fns";
import { PencilIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface Props {
  name: string;
  creationTime: number;
  isEmpty?: boolean;
}

// The top of a channel's history. When nobody has posted yet, it invites the first message.
export const ChannelHero = ({ name, creationTime, isEmpty }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });

  const focusComposer = () => {
    document.querySelector<HTMLElement>("[data-composer] .ql-editor")?.focus();
  };

  return (
    <div className="mx-5 mb-4 mt-14 grid justify-items-start gap-2.5">
      <div className="cut grid size-16 place-items-center bg-night font-display text-3xl font-semibold text-n-ink hatch [--cut:14px]" aria-hidden="true">
        #
      </div>
      <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">
        {isEmpty ? `This is the start of #${name}` : `#${name}`}
      </h1>
      <p className="max-w-xl text-sm text-ink-2">
        Created {format(creationTime, "MMMM do, yyyy")}.{" "}
        {isEmpty ? "Nobody has posted yet, so the first message sets the tone." : "This is the very beginning of the channel's history."}
      </p>
      {isEmpty && (
        <div className="mt-1 flex flex-wrap gap-2">
          <Button size="sm" onClick={focusComposer}>
            <PencilIcon />
            Write the first message
          </Button>
          {member?.role === "admin" && (
            <Button size="sm" variant="outline" onClick={() => router.push(`/workspace/${workspaceId}/settings?tab=invitations`)}>
              <UserPlusIcon />
              Invite people
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
