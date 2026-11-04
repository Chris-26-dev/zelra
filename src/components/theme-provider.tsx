"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface Props {
    children: React.ReactNode;
}

// Day/Night themes. Follows the system setting until the user picks one in their account menu.
export const ThemeProvider = ({ children }: Props) => {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
};
