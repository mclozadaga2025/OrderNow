import { Platform, type TextStyle } from 'react-native';
import type { AppLanguage } from '@/lib/useLanguage';

const IOS_VIETNAMESE_TYPOGRAPHY_STYLES = [
  ['text-h1', { lineHeight: 60, paddingTop: 4 }],
  ['text-h2', { lineHeight: 42, paddingTop: 3 }],
  ['text-h3', { lineHeight: 34, paddingTop: 2 }],
  ['text-h4', { lineHeight: 30, paddingTop: 2 }],
  ['text-button', { lineHeight: 24, paddingTop: 2 }],
] satisfies ReadonlyArray<readonly [string, TextStyle]>;

export function getIosVietnameseTypographyStyle(
  className: string | undefined,
  language: AppLanguage
): TextStyle | undefined {
  if (Platform.OS !== 'ios' || language !== 'vi' || !className) {
    return undefined;
  }

  const classNames = new Set(className.split(/\s+/));
  return IOS_VIETNAMESE_TYPOGRAPHY_STYLES.find(([token]) => classNames.has(token))?.[1];
}
