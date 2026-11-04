// Stable colours for people and workspaces, picked from their name so the same name always gets the same hue.
// Every hue keeps white initials at AA contrast or better.
const PERSON_HUES = ["#3157D9", "#0F7F72", "#9A4A1E", "#6B44B8", "#A3354F", "#4F6A1C"];
const WORKSPACE_HUES = ["#1954F7", "#6D4AFF", "#0B8273", "#B4410C", "#0369A1", "#A3354F"];

const hash = (value: string) => {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
        h = (h * 31 + value.charCodeAt(i)) >>> 0;
    }
    return h;
};

export const personHue = (name = "") => PERSON_HUES[hash(name) % PERSON_HUES.length];
export const workspaceHue = (name = "") => WORKSPACE_HUES[hash(name) % WORKSPACE_HUES.length];

export const initials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
