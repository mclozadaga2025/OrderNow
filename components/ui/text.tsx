import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Text as RNText } from 'react-native';
import { getIosVietnameseTypographyStyle } from '@/lib/ios-vietnamese-typography';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  style,
  ...props
}: React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
}) {
  const textClass = React.useContext(TextClassContext);
  const { language } = useLanguage();
  const Component = asChild ? Slot.Text : RNText;
  const mergedClassName = cn('web:select-text', textClass, className);

  return (
    <Component
      className={mergedClassName}
      style={[style, getIosVietnameseTypographyStyle(mergedClassName, language)]}
      {...props}
    />
  );
}

export { Text, TextClassContext };
