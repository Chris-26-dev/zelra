/* eslint-disable @next/next/no-img-element */

import { ExternalLinkIcon, XIcon } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
    url: string | null | undefined;
};

export const Thumbnail = ({ url }: Props) => {
    if (!url) return null;

    return (
        <Dialog>
            <DialogTrigger className="my-1.5 block max-w-[360px] cursor-zoom-in" aria-label="Open image">
                <span className="cut block overflow-hidden bg-hover [--cut:10px]">
                    <img
                        src={url}
                        alt="Message image"
                        className="block max-h-[320px] w-full object-cover"
                    />
                </span>
            </DialogTrigger>
            <DialogContent className="max-w-[min(900px,calc(100%-2rem))] border-0 bg-transparent p-0 shadow-none sm:max-w-[min(900px,calc(100%-2rem))]" showCloseButton={false}>
                <DialogTitle className="sr-only">Image</DialogTitle>
                <img
                    src={url}
                    alt="Message image"
                    className="cut max-h-[80dvh] w-full object-contain [--cut:14px]"
                />
                <div className="flex justify-center gap-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-[13px] font-medium text-ink shadow-pop hover:bg-hover"
                    >
                        <ExternalLinkIcon className="size-4" />
                        Open original
                    </a>
                    <DialogClose className="flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-[13px] font-medium text-ink shadow-pop hover:bg-hover">
                        <XIcon className="size-4" />
                        Close
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};
