import { dark } from '@clerk/themes';

// `dark` restyles Clerk's own built-in elements (OAuth buttons, dividers, footer links,
// shadows) for a dark background - the `variables` on top of it just line those colors up
// with this site's exact palette. Without a dark baseTheme, those elements default to Clerk's
// light theme regardless of the variables set, which is why the Google OAuth button/divider
// were clashing against the dark card.
export const clerkAppearance = {
    baseTheme: dark,
    variables: {
        colorPrimary: '#ff6b1a',
        colorBackground: '#1a2332',
        colorText: '#e8ecf1',
        colorTextSecondary: '#8b96a8',
        colorInputBackground: '#0f1419',
        colorInputText: '#e8ecf1',
        colorNeutral: '#e8ecf1',
        borderRadius: '10px',
    },
    elements: {
        card: 'bg-transparent shadow-none',
    },
};
