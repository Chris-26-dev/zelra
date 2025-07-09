import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useSetQueryParams } from "@/hooks/use-query-param";

export const usePanel = () => {
  const [parentMessageId] = useParentMessageId();
  const [profileMemberId] = useProfileMemberId();
  const setParams = useSetQueryParams();

  const onOpenProfile = (memberId: string) => {
    setParams({
      profileMemberId: memberId,
      parentMessageId: null, // 🧼 clear thread
    });
  };

  const onOpenMessage = (messageId: string) => {
    setParams({
      parentMessageId: messageId,
      profileMemberId: null, // 🧼 clear profile
    });
  };

  const onClose = () => {
    setParams({
      parentMessageId: null,
      profileMemberId: null,
    });
  };

  return {
    profileMemberId,
    parentMessageId,
    onOpenProfile,
    onOpenMessage,
    onClose,
  };
};
