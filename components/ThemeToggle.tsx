import { Pressable, View } from 'react-native';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useColorScheme } from '@/lib/useColorScheme';
import { useLanguage } from '@/lib/useLanguage';

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const { language } = useLanguage();
  const accessibilityLabel =
    language === 'vi'
      ? isDarkColorScheme
        ? 'Chuyển sang giao diện sáng'
        : 'Chuyển sang giao diện tối'
      : isDarkColorScheme
        ? 'Switch to light mode'
        : 'Switch to dark mode';

  function toggleColorScheme() {
    setColorScheme(isDarkColorScheme ? 'light' : 'dark');
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={toggleColorScheme}
      className="rounded-full border-2 border-border bg-card p-3 active:opacity-70 web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      <View className="items-center justify-center">
        {isDarkColorScheme ? (
          <LucideIcon name="MoonStar" className="text-foreground" size={20} strokeWidth={1.75} />
        ) : (
          <LucideIcon name="Sun" className="text-foreground" size={20} strokeWidth={1.75} />
        )}
      </View>
    </Pressable>
  );
}
