import { Theme } from '../Theme';

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: 'hsl(22 12% 9%)',
    foreground: 'hsl(42 28% 92%)',
    card: 'hsl(23 13% 13%)',
    cardForeground: 'hsl(42 28% 92%)',
    popover: 'hsl(23 13% 13%)',
    popoverForeground: 'hsl(42 28% 92%)',
    primary: 'hsl(24 78% 61%)',
    primaryForeground: 'hsl(22 12% 9%)',
    secondary: 'hsl(30 14% 20%)',
    secondaryForeground: 'hsl(42 28% 92%)',
    tertiary: 'hsl(184 44% 47%)',
    tertiaryForeground: 'hsl(22 12% 9%)',
    muted: 'hsl(24 10% 18%)',
    mutedForeground: 'hsl(39 14% 69%)',
    accent: 'hsl(40 42% 32%)',
    accentForeground: 'hsl(42 28% 92%)',
    success: 'hsl(145 44% 50%)',
    successForeground: 'hsl(22 12% 9%)',
    warning: 'hsl(35 93% 58%)',
    warningForeground: 'hsl(22 12% 9%)',
    destructive: 'hsl(7 80% 62%)',
    destructiveForeground: 'hsl(22 12% 9%)',
    border: 'hsl(37 15% 39%)',
    notification: 'hsl(24 10% 18%)',
    input: 'hsl(24 10% 18%)',
    ring: 'hsl(24 78% 61%)',
    overlay: 'hsl(42 28% 92%)',
  },
  typography: {
    h1: {
      fontSize: '42px',
      fontFamily: 'Oswald_700Bold',
    },
    h2: {
      fontSize: '30px',
      fontFamily: 'Oswald_600SemiBold',
    },
    h3: {
      fontSize: '23px',
      fontFamily: 'Oswald_500Medium',
    },
    h4: {
      fontSize: '20px',
      fontFamily: 'Oswald_500Medium',
    },
    h5: {
      fontSize: '16px',
      fontFamily: 'SourceSans3_700Bold',
    },
    h6: {
      fontSize: '14px',
      fontFamily: 'SourceSans3_600SemiBold',
    },
    body: {
      fontSize: '16px',
      fontFamily: 'SourceSans3_400Regular',
    },
    caption: {
      fontSize: '12px',
      fontFamily: 'SourceSans3_600SemiBold',
    },
    button: {
      fontSize: '16px',
      fontFamily: 'Oswald_500Medium',
    },
  },
};

export default darkTheme;
