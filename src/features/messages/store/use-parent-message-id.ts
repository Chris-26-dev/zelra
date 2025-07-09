// import { useQueryState } from "nuqs";

// export const useParentMessageId = () => {
//     return useQueryState("parentMessageId");
// };

import { useQueryParam } from "@/hooks/use-query-param";

export const useParentMessageId = () => {
  return useQueryParam("parentMessageId");
};
