// Theme configuration for Stack Auth
export const stackTheme = {
    light: {
        primary: "hsl(260 90% 60%)", // approximate violet-600
        foreground: "hsl(240 10% 3.9%)", // zinc-950
        background: "hsl(0 0% 100%)", // white
    },
    dark: {
        primary: "hsl(260 90% 60%)", // approximate violet-600
        foreground: "hsl(0 0% 98%)", // zinc-50
        background: "hsl(240 10% 10%)", // zinc-900 (using slightly lighter than actual pure black for surface)
    },
} as const;


