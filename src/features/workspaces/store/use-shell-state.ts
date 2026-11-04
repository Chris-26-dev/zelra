import { atom, useAtom } from "jotai";

export type PaletteScope = "all" | "channels" | "people" | "workspaces" | "actions";

const paletteAtom = atom<{ open: boolean; scope: PaletteScope }>({ open: false, scope: "all" });
const mobileNavAtom = atom(false);
const channelInfoAtom = atom(false);
// Remembers the active workspace's position in the rail so the indicator can slide on switch.
const railIndexAtom = atom<number | null>(null);

export const useCommandPalette = () => useAtom(paletteAtom);
export const useMobileNav = () => useAtom(mobileNavAtom);
export const useChannelInfo = () => useAtom(channelInfoAtom);
export const useRailIndex = () => useAtom(railIndexAtom);
