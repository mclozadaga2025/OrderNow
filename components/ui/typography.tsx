import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Platform, Text as RNText } from 'react-native';
import { getIosVietnameseTypographyStyle } from '@/lib/ios-vietnamese-typography';
import { useLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';

type TypographyProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
};

function TypographyText({ className, asChild = false, style, ...props }: TypographyProps) {
  const { language } = useLanguage();
  const Component = asChild ? Slot.Text : RNText;

  return (
    <Component
      className={className}
      style={[style, getIosVietnameseTypographyStyle(className, language)]}
      {...props}
    />
  );
}

function H1({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      role="heading"
      aria-level="1"
      asChild={asChild}
      className={cn(
        'text-h1 leading-[52px] tracking-tight text-foreground web:select-text web:scroll-m-20 lg:text-5xl',
        className
      )}
      {...props}
    />
  );
}

function H2({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      role="heading"
      aria-level="2"
      asChild={asChild}
      className={cn(
        'text-h2 tracking-tight text-foreground first:mt-0 web:select-text web:scroll-m-20',
        className
      )}
      {...props}
    />
  );
}

function H3({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      role="heading"
      aria-level="3"
      asChild={asChild}
      className={cn(
        'text-h3 tracking-tight text-foreground web:select-text web:scroll-m-20',
        className
      )}
      {...props}
    />
  );
}

function H4({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      role="heading"
      aria-level="4"
      asChild={asChild}
      className={cn(
        'text-h4 tracking-tight text-foreground web:select-text web:scroll-m-20',
        className
      )}
      {...props}
    />
  );
}

function P({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      asChild={asChild}
      className={cn('text-body text-foreground web:select-text', className)}
      {...props}
    />
  );
}

function BlockQuote({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      // @ts-ignore - role of blockquote renders blockquote element on the web
      role={Platform.OS === 'web' ? 'blockquote' : undefined}
      asChild={asChild}
      className={cn(
        'native:mt-4 native:pl-3 text-body mt-6 border-l-2 border-border pl-6 italic text-foreground web:select-text',
        className
      )}
      {...props}
    />
  );
}

function Code({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      // @ts-ignore - role of code renders code element on the web
      role={Platform.OS === 'web' ? 'code' : undefined}
      asChild={asChild}
      className={cn(
        'text-caption relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] text-foreground web:select-text',
        className
      )}
      {...props}
    />
  );
}

function Lead({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      asChild={asChild}
      className={cn('text-h4 text-muted-foreground web:select-text', className)}
      {...props}
    />
  );
}

function Large({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      asChild={asChild}
      className={cn('text-h4 text-foreground web:select-text', className)}
      {...props}
    />
  );
}

function Small({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      asChild={asChild}
      className={cn('text-caption leading-none text-foreground web:select-text', className)}
      {...props}
    />
  );
}

function Muted({ className, asChild = false, ...props }: TypographyProps) {
  return (
    <TypographyText
      asChild={asChild}
      className={cn('text-caption text-muted-foreground web:select-text', className)}
      {...props}
    />
  );
}

export { BlockQuote, Code, H1, H2, H3, H4, Large, Lead, Muted, P, Small };
