import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useDraftKey } from "@/hooks/use-drafts";
import { writeDraft } from "@/lib/drafts";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface Props {
    placeholder: string;
    conversationId: Id<"conversations">;
};

type CreateMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined;
}

export const ChatInput = ({ placeholder, conversationId }: Props) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);
    const workspaceId = useWorkspaceId();
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();
    const draftKey = useDraftKey({ workspaceId, kind: "conversation", id: conversationId });

    const handleSubmit = async ({
        body,
        image
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            //console.log({ body, image });
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                conversationId,
                workspaceId,
                body,
                image:  undefined,
            };

            if (image) {
                const url = await generateUploadUrl({ workspaceId }, { throwError: true });

                if (!url) {
                    throw new Error("Url not found");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image")
                }

                const { storageId } = await result.json();

                values.image = storageId;
            };
            
            await createMessage( values, { throwError: true });

            if (draftKey) writeDraft(draftKey, null);

            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-2.5 pb-3 md:px-5 md:pb-4">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
                draftKey={draftKey}
            />
        </div>
    );
};