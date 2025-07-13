"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { Loader2, LogOutIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";


export const UserButton = () => {
    const { signOut } = useAuthActions();
    const { data, isLoading } = useCurrentUser();

    if (isLoading) {
        return <Loader2 className="size-4 animate-spin text-muted-foreground" />
    }

    if (!data) {
        return null;
    }

    const image = data?.image ?? "";
    const name = data?.name ?? "M";

    const avatarFallback = name.charAt(0).toUpperCase();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="rounded-md size-10 hover:opacity-75 transition">
                    <AvatarImage className="rounded-md" alt="Image" src={image} />
                    <AvatarFallback className="rounded-md bg-sky-500 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right" className="w-60">
                <DropdownMenuItem
                    onClick={async () => {
                        await signOut();          // 1. Sign out user
                        window.location.href = "/";      // 2. Redirect to home (or sign-in screen)
                    }}
                    className="h-8 cursor-pointer hover:opacity-75"
                >
                    <LogOutIcon className="size-4 mr-2" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}