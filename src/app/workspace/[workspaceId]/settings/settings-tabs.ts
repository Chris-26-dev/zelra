import { AlertTriangleIcon, LinkIcon, LogOutIcon, SlidersHorizontalIcon, UsersIcon, LucideIcon } from "lucide-react";

export type SettingsTab = "general" | "members" | "invitations" | "danger";

export interface TabDef {
    key: SettingsTab;
    label: string;
    icon: LucideIcon;
}

// Admins manage the whole workspace; members can see who's here and leave.
export const settingsTabs = (isAdmin: boolean): TabDef[] =>
    isAdmin
        ? [
            { key: "general", label: "General", icon: SlidersHorizontalIcon },
            { key: "members", label: "Members", icon: UsersIcon },
            { key: "invitations", label: "Invitations", icon: LinkIcon },
            { key: "danger", label: "Danger zone", icon: AlertTriangleIcon },
        ]
        : [
            { key: "members", label: "Members", icon: UsersIcon },
            { key: "danger", label: "Leave workspace", icon: LogOutIcon },
        ];

export const resolveTab = (value: string | null, isAdmin: boolean): SettingsTab => {
    const tabs = settingsTabs(isAdmin);
    return tabs.find((t) => t.key === value)?.key ?? tabs[0].key;
};
