import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useChannelInfo } from "@/features/workspaces/store/use-shell-state";
import { useSetQueryParams } from "@/hooks/use-query-param";

export const usePanel = () => {
  const [parentMessageId] = useParentMessageId();
  const [profileMemberId] = useProfileMemberId();
  const [channelInfoOpen, setChannelInfoOpen] = useChannelInfo();
  const setParams = useSetQueryParams();

  const onOpenProfile = (memberId: string) => {
    setChannelInfoOpen(false);
    setParams({
      profileMemberId: memberId,
      parentMessageId: null, // 🧼 clear thread
    });
  };

  const onOpenMessage = (messageId: string) => {
    setChannelInfoOpen(false);
    setParams({
      parentMessageId: messageId,
      profileMemberId: null, // 🧼 clear profile
    });
  };

  // Channel details live in the same side panel slot as threads and profiles.
  const onOpenChannelInfo = () => {
    setChannelInfoOpen(true);
    if (parentMessageId || profileMemberId) {
      setParams({ parentMessageId: null, profileMemberId: null });
    }
  };

  const onClose = () => {
    setChannelInfoOpen(false);
    setParams({
      parentMessageId: null,
      profileMemberId: null,
    });
  };

  return {
    profileMemberId,
    parentMessageId,
    channelInfoOpen: channelInfoOpen && !parentMessageId && !profileMemberId,
    onOpenProfile,
    onOpenMessage,
    onOpenChannelInfo,
    onClose,
  };
};
