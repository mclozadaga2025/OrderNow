import { Pressable } from 'react-native';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useLanguage } from '@/lib/useLanguage';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguageLabel = language === 'en' ? 'Tiếng Việt' : 'English';
  const accessibilityLabel =
    language === 'en'
      ? `Switch language to ${nextLanguageLabel}`
      : `Chuyển ngôn ngữ sang ${nextLanguageLabel}`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={toggleLanguage}
      className="h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card active:opacity-70 web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      <LucideIcon name="Languages" className="text-foreground" size={20} strokeWidth={1.75} />
    </Pressable>
  );
}
