import { Theme } from '../Theme';

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: 'hsl(39 45% 93%)',
    foreground: 'hsl(24 20% 13%)',
    card: 'hsl(42 38% 97%)',
    cardForeground: 'hsl(24 20% 13%)',
    popover: 'hsl(42 38% 97%)',
    popoverForeground: 'hsl(24 20% 13%)',
    primary: 'hsl(17 71% 40%)',
    primaryForeground: 'hsl(42 38% 97%)',
    secondary: 'hsl(44 28% 86%)',
    secondaryForeground: 'hsl(24 20% 13%)',
    tertiary: 'hsl(186 48% 31%)',
    tertiaryForeground: 'hsl(42 38% 97%)',
    muted: 'hsl(39 24% 88%)',
    mutedForeground: 'hsl(24 11% 36%)',
    accent: 'hsl(51 56% 76%)',
    accentForeground: 'hsl(24 20% 13%)',
    success: 'hsl(145 44% 34%)',
    successForeground: 'hsl(42 38% 97%)',
    warning: 'hsl(31 91% 52%)',
    warningForeground: 'hsl(24 20% 13%)',
    destructive: 'hsl(7 68% 47%)',
    destructiveForeground: 'hsl(42 38% 97%)',
    border: 'hsl(24 18% 20%)',
    notification: 'hsl(39 24% 88%)',
    input: 'hsl(39 27% 84%)',
    ring: 'hsl(17 71% 40%)',
    overlay: 'hsl(24 20% 13%)',
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

export default lightTheme;
