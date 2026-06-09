import { forwardRef, type ReactNode } from 'react';
import { useSegments } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { KeyboardAwareScrollView } from '@/lib/keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OrdernowsSettingsMenu } from '@/components/ordernows/settings-menu';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { AvatarIcon } from '@/lib/ordernows';
import LucideIcon, { type IconName } from '@/lib/icons/LucideIcon';
import { cn } from '@/lib/utils';

interface OrdernowsScreenProps {
  title: string;
  subtitle: string;
  badge?: string;
  headerAction?: ReactNode;
  keyboardAware?: boolean;
  children: ReactNode;
}

interface FilterChipProps {
  label: string;
  icon?: IconName;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

interface ActionPillProps {
  label: string;
  icon?: IconName;
  tone?: 'default' | 'secondary' | 'neutral' | 'destructive';
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  icon?: IconName;
}

interface AvatarBadgeProps {
  avatar: AvatarIcon;
  size?: 'sm' | 'md' | 'lg';
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});

export function OrdernowsScreen({
  title,
  subtitle,
  badge = 'ORDERNOWS LEDGER',
  headerAction,
  keyboardAware = true,
  children,
}: OrdernowsScreenProps) {
  const [firstSegment] = useSegments();
  const showScreenActions = firstSegment === '(tabs)';
  const content = (
    <View className="min-h-full px-5 pb-40 pt-3">
      <View className="mb-8">
        <View className="mb-3 flex-row items-start justify-between gap-3">
          <View className="self-start rounded-full border-2 border-border bg-card px-3 py-1.5">
            <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
              {badge}
            </Text>
          </View>
          {showScreenActions ? (
            <View className="flex-row items-center gap-2">
              {headerAction}
              <ThemeToggle />
              <OrdernowsSettingsMenu />
            </View>
          ) : null}
        </View>
        <Text className="text-h1 leading-[52px] text-foreground uppercase">{title}</Text>
        <Text className="mt-2 max-w-[320px] text-body text-muted-foreground">{subtitle}</Text>
      </View>

      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute inset-0">
        <View className="absolute -left-10 top-20 h-32 w-32 rounded-full border border-border bg-secondary opacity-20" />
        <View className="absolute right-6 top-16 h-16 w-16 rotate-12 border-2 border-border bg-accent opacity-40" />
        <View className="absolute bottom-24 left-8 h-20 w-20 rounded-full border border-border bg-primary opacity-10" />
      </View>

      {keyboardAware ? (
        <KeyboardAwareScrollView
          bottomOffset={64}
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          extraKeyboardSpace={16}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export function PaperCard({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('overflow-hidden rounded-[28px] border-2 border-border bg-card p-4', className)}
      {...props}
    />
  );
}

export function FilterChip({ label, icon, active = false, onPress, className }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mr-2 shrink-0 flex-row items-center gap-2 rounded-full border-2 px-4 py-2.5 active:opacity-80',
        active ? 'border-foreground bg-foreground' : 'border-border bg-card',
        className
      )}>
      {icon ? (
        <LucideIcon
          name={icon}
          className={active ? 'text-background' : 'text-foreground'}
          size={14}
          strokeWidth={2}
        />
      ) : null}
      <Text
        className={cn(
          'text-caption uppercase tracking-[1.6px]',
          active ? 'text-background' : 'text-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionPill({
  label,
  icon = 'ArrowRight',
  tone = 'default',
  onPress,
  className,
  disabled = false,
}: ActionPillProps) {
  const toneClasses = {
    default: 'border-primary bg-primary',
    secondary: 'border-border bg-secondary',
    neutral: 'border-border bg-background',
    destructive: 'border-destructive bg-destructive',
  } as const;

  const textClasses = {
    default: 'text-primary-foreground',
    secondary: 'text-foreground',
    neutral: 'text-foreground',
    destructive: 'text-destructive-foreground',
  } as const;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-[22px] border-2 px-4 py-3 active:opacity-80 disabled:opacity-40',
        toneClasses[tone],
        className
      )}>
      <Text className={cn('text-button uppercase tracking-[1.3px]', textClasses[tone])}>{label}</Text>
      <LucideIcon name={icon} className={textClasses[tone]} size={16} strokeWidth={2.1} />
    </Pressable>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <View className={cn('mb-4', className)}>
      {eyebrow ? (
        <Text className="text-caption uppercase tracking-[1.8px] text-muted-foreground">
          {eyebrow}
        </Text>
      ) : null}
      <View className="mt-1 flex-row items-center justify-between gap-4">
        <Text className="flex-1 text-h3 text-foreground uppercase">{title}</Text>
        {action}
      </View>
      {description ? <Text className="mt-1 text-body text-muted-foreground">{description}</Text> : null}
    </View>
  );
}

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <PaperCard className={cn('flex-1 p-4', className)}>
      <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{label}</Text>
      <Text className="mt-2 text-h2 text-foreground uppercase">{value}</Text>
      {hint ? <Text className="mt-1 text-body text-muted-foreground">{hint}</Text> : null}
    </PaperCard>
  );
}

export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, hint, icon, className, multiline, ...props },
  ref
) {
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center gap-2">
        {icon ? <LucideIcon name={icon} className="text-muted-foreground" size={15} strokeWidth={2} /> : null}
        <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">{label}</Text>
      </View>

      <View className={cn('rounded-[24px] border-2 border-border bg-card px-4 py-3', className)}>
        <Input
          ref={ref}
          multiline={multiline}
          placeholderClassName="text-muted-foreground"
          textAlignVertical={multiline ? 'top' : undefined}
          className={cn(
            'h-auto min-h-[24px] border-0 bg-transparent px-0 py-0 text-body text-foreground native:text-base',
            multiline && 'min-h-[96px]'
          )}
          {...props}
        />
      </View>

      {hint ? <Text className="mt-2 text-caption text-muted-foreground">{hint}</Text> : null}
    </View>
  );
});

export function AvatarBadge({ avatar, size = 'md' }: AvatarBadgeProps) {
  const sizeClasses = {
    sm: 'h-12 w-12 rounded-[18px]',
    md: 'h-16 w-16 rounded-[22px]',
    lg: 'h-20 w-20 rounded-[26px]',
  } as const;

  const iconSizes = {
    sm: 18,
    md: 26,
    lg: 32,
  } as const;

  return (
    <View className={cn('items-center justify-center border-2 border-border bg-secondary', sizeClasses[size])}>
      <LucideIcon name={avatar} className="text-foreground" size={iconSizes[size]} strokeWidth={1.8} />
    </View>
  );
}
