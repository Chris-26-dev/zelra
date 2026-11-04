import Quill, { QuillOptions } from "quill";
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Delta, Op } from "quill/core";

import { Button } from "./ui/button";
import { ImageIcon, SendHorizontalIcon, Smile, TypeIcon, XIcon } from "lucide-react";
import { Hint } from "./hint";

import "quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";
import { EmojiPopover } from "./emoji-popover";
import Image from "next/image";
import { readDraft, writeDraft } from "@/lib/drafts";

type EditorValue = {
    image: File | null;
    body: string;
}

interface Props {
    onSubmit: ({ image, body }: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
    variant?: "create" | "update";
    // Where unsent text is saved on this device (create variant only).
    draftKey?: string | null;
};

const Editor = ({
    onSubmit,
    onCancel,
    placeholder = "Write something...",
    defaultValue = [],
    disabled = false,
    innerRef,
    variant = "create",
    draftKey,
}: Props) => {
    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);

    const submitRef = useRef(onSubmit);
    const cancelRef = useRef(onCancel);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const disabledRef = useRef(disabled);
    const imageElementRef = useRef<HTMLInputElement>(null);
    const draftKeyRef = useRef(draftKey);
    const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        cancelRef.current = onCancel;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
        draftKeyRef.current = draftKey;
    });

    // Stop a pending draft save so a sent message's text isn't written back afterwards.
    const cancelDraftSave = () => {
        if (draftTimer.current) clearTimeout(draftTimer.current);
        draftTimer.current = null;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div"),
        );

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link"],
                    [{ list: "ordered" }, { list: "bullet" }]
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                const text = quill.getText();
                                const addedImage = imageElementRef.current?.files?.[0] || null;

                                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                                if (isEmpty) return;

                                const body = JSON.stringify(quill.getContents());
                                cancelDraftSave();
                                submitRef.current?.({ body, image: addedImage })
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quill.insertText(quill.getSelection()?.index || 0, "\n");
                            },
                        },
                        escape: {
                            key: "Escape",
                            handler: () => {
                                if (cancelRef.current) {
                                    cancelRef.current();
                                    return false;
                                }
                                return true;
                            },
                        },
                    }
                },
            },
        };

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        // The formatting toolbar starts hidden; toggleToolbar shows it.
        const toolbar = container.querySelector(".ql-toolbar");
        if (toolbar) toolbar.classList.add("hidden");

        if (innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);

        // Restore unsent text for this conversation, if any.
        const key = draftKeyRef.current;
        if (key && quill.getText().trim().length === 0) {
            const saved = readDraft(key);
            if (saved) {
                try {
                    quill.setContents(JSON.parse(saved));
                    quill.setSelection(quill.getLength(), 0);
                } catch {
                    writeDraft(key, null);
                }
            }
        }

        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());

            const key = draftKeyRef.current;
            if (!key) return;
            cancelDraftSave();
            draftTimer.current = setTimeout(() => {
                const isBlank = quill.getText().trim().length === 0;
                writeDraft(key, isBlank ? null : JSON.stringify(quill.getContents()));
            }, 300);
        });

        return () => {
            cancelDraftSave();
            quill.off(Quill.events.TEXT_CHANGE);
            if (container) {
                container.innerHTML = "";
            }
            if (quillRef.current) {
                quillRef.current = null;
            }
            if (innerRef) {
                innerRef.current = null;
            }
        };
    }, [innerRef]);

    const toggleToolbar = () => {
        setIsToolbarVisible((current) => !current);
        const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

        if (toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    };

    const onEmojiSelect = (emojiValue: string) => {
        const quill = quillRef.current;

        quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
    }

    const submit = () => {
        cancelDraftSave();
        onSubmit({
            body: JSON.stringify(quillRef.current?.getContents()),
            image,
        });
    };

    const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    return (
        <div className="flex flex-col" data-composer>
            <input
                type="file"
                accept="image/*"
                ref={imageElementRef}
                onChange={(event) => setImage(event.target.files![0])}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
            />
            <div className={cn(
                "cut bg-line-2 p-px transition-colors duration-150 [--cut:12px] focus-within:bg-cobalt",
                disabled && "opacity-60"
            )}
            >
                <div className="cut bg-card [--cut:11px]">
                    <div ref={containerRef} className="h-full ql-custom" />
                    {!!image && (
                        <div className="px-3 pb-1 pt-2">
                            <div className="group/image relative size-[62px]">
                                <Hint label="Remove image">
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            imageElementRef.current!.value = "";
                                        }}
                                        aria-label="Remove image"
                                        className="absolute -right-2.5 -top-2.5 z-[4] flex size-6 items-center justify-center rounded-full border-2 border-card bg-ink text-paper"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </Hint>
                                <Image
                                    src={URL.createObjectURL(image)}
                                    alt="Image to send"
                                    fill
                                    className="cut object-cover [--cut:8px]"
                                />
                            </div>
                        </div>
                    )}
                    <div className="z-[5] flex items-center gap-0.5 px-1.5 pb-1.5">
                        <Hint label={isToolbarVisible ? "Hide formatting" : "Show formatting"}>
                            <Button
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                                onClick={toggleToolbar}
                                aria-pressed={isToolbarVisible}
                                aria-label="Formatting"
                                className={cn(isToolbarVisible && "bg-wash text-cobalt-ink")}
                            >
                                <TypeIcon className="size-4" />
                            </Button>
                        </Hint>
                        <EmojiPopover onEmojiSelect={onEmojiSelect}>
                            <Button
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                                aria-label="Insert emoji"
                            >
                                <Smile className="size-4" />
                            </Button>
                        </EmojiPopover>
                        {variant === "create" && (
                            <Hint label="Attach an image">
                                <Button
                                    disabled={disabled}
                                    size="iconSm"
                                    variant="ghost"
                                    onClick={() => imageElementRef.current?.click()}
                                    aria-label="Attach an image"
                                >
                                    <ImageIcon className="size-4" />
                                </Button>
                            </Hint>
                        )}
                        {variant === "update" && (
                            <div className="ml-auto flex items-center gap-x-2">
                                <span className="hidden text-[11.5px] text-ink-3 sm:inline">Esc to cancel · Enter to save</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCancel}
                                    disabled={disabled}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={submit}
                                    disabled={disabled || isEmpty}
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                        {variant === "create" && (
                            <>
                                <p className={cn(
                                    "ml-auto hidden pr-2 text-[11.5px] text-ink-3 opacity-0 transition-opacity sm:block",
                                    !isEmpty && "opacity-100"
                                )}
                                >
                                    <strong className="font-semibold text-ink-2">Enter</strong> to send · <strong className="font-semibold text-ink-2">Shift + Enter</strong> for a new line
                                </p>
                                <Button
                                    disabled={disabled || isEmpty}
                                    onClick={submit}
                                    size="iconSm"
                                    aria-label="Send message"
                                    className={cn(
                                        "ml-auto w-[34px] sm:ml-0 disabled:opacity-100",
                                        isEmpty
                                            ? "bg-hover text-ink-3"
                                            : "bg-cobalt text-on-cobalt hover:translate-x-px"
                                    )}
                                >
                                    <SendHorizontalIcon className="size-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
