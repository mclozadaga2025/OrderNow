import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import {
  type Transaction,
  formatMonthDay,
  formatSignedVnd,
  formatTimeLabel,
  formatVnd,
} from '@/lib/ordernows';
import type { AppLanguage } from '@/lib/useLanguage';
import { cn } from '@/lib/utils';
import { PaperCard } from './primitives';
import {
  SwipeToDeleteRow,
  type SwipeToDeleteRowMethods,
} from './swipe-to-delete-row';

interface TransactionRowProps {
  transaction: Transaction;
  subtitle?: string;
  onPress?: () => void;
  onDelete?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
  language?: AppLanguage;
  memberPerspectiveId?: string;
}

interface TransactionRowActionsProps {
  language: AppLanguage;
  onDelete: () => void;
  close: () => void;
}

function TransactionRowActions({ language, onDelete, close }: TransactionRowActionsProps) {
  const deleteLabel = language === 'vi' ? 'Xóa' : 'Delete';

  return (
    <View className="flex-1 bg-background pl-2">
      <Pressable
        accessibilityLabel={deleteLabel}
        accessibilityRole="button"
        onPress={() => {
          close();
          onDelete();
        }}
        className="flex-1 items-center justify-center rounded-[24px] border-2 border-destructive bg-destructive active:opacity-80">
        <LucideIcon
          name="Trash2"
          className="text-destructive-foreground"
          size={19}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}

export function TransactionRow({
  transaction,
  subtitle,
  onPress,
  onDelete,
  selectionMode = false,
  selected = false,
  onToggleSelected,
  language = 'en',
  memberPerspectiveId,
}: TransactionRowProps) {
  const isTransfer = transaction.type === 'transfer';
  const amount =
    transaction.type === 'credit'
      ? transaction.amount
      : isTransfer
        ? transaction.toMemberId === memberPerspectiveId
          ? transaction.amount
          : transaction.fromMemberId === memberPerspectiveId
            ? -transaction.amount
            : 0
        : -transaction.amount;
  const amountText = isTransfer && !memberPerspectiveId ? formatVnd(transaction.amount) : formatSignedVnd(amount);
  const amountTone =
    isTransfer && !memberPerspectiveId
      ? 'text-foreground'
      : amount >= 0
        ? 'text-success'
        : 'text-destructive';
  const badgeClass =
    transaction.type === 'credit'
      ? 'border-success bg-success'
      : isTransfer
        ? 'border-primary bg-primary'
        : 'border-destructive bg-destructive';
  const badgeTextClass =
    transaction.type === 'credit'
      ? 'text-success-foreground'
      : isTransfer
        ? 'text-primary-foreground'
        : 'text-destructive-foreground';
  const badgeLabel =
    transaction.type === 'credit'
      ? language === 'vi'
        ? 'Nạp'
        : 'Credit'
      : isTransfer
        ? language === 'vi'
          ? 'Trao đổi'
          : 'Transfer'
        : language === 'vi'
          ? 'Chi'
          : 'Debit';
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const swipeableRef = useRef<SwipeToDeleteRowMethods | null>(null);
  const isSwipeableOpenRef = useRef(false);
  const ignorePressUntilRef = useRef(0);

  function ignorePressAfterSwipe() {
    ignorePressUntilRef.current = Date.now() + 300;
  }

  function handlePress() {
    if (selectionMode) {
      onToggleSelected?.();
      return;
    }

    if (Date.now() < ignorePressUntilRef.current) {
      return;
    }

    if (isSwipeableOpenRef.current) {
      swipeableRef.current?.close();
      return;
    }

    onPress?.();
  }

  const row = (
    <Pressable
      accessibilityRole={selectionMode ? 'checkbox' : 'button'}
      accessibilityState={selectionMode ? { checked: selected } : undefined}
      onPress={handlePress}
      className="active:opacity-80">
      <PaperCard className={cn('p-4', selected && 'border-destructive bg-secondary')}>
        {selectionMode ? (
          <View className="mb-4 flex-row items-center gap-2">
            <View
              className={cn(
                'h-6 w-6 items-center justify-center rounded-lg border-2',
                selected ? 'border-destructive bg-destructive' : 'border-border bg-background'
              )}>
              {selected ? (
                <LucideIcon
                  name="Check"
                  className="text-destructive-foreground"
                  size={15}
                  strokeWidth={3}
                />
              ) : null}
            </View>
            <Text className="text-caption uppercase tracking-[1.4px] text-muted-foreground">
              {selected
                ? language === 'vi'
                  ? 'Đã chọn'
                  : 'Selected'
                : language === 'vi'
                  ? 'Chạm để chọn'
                  : 'Tap to select'}
            </Text>
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row flex-wrap items-center gap-2">
            <View
              className={cn(
                'rounded-full border-2 px-2.5 py-1',
                badgeClass
              )}>
              <Text
                className={cn(
                  'text-caption uppercase tracking-[1.4px]',
                  badgeTextClass
                )}>
                {badgeLabel}
              </Text>
            </View>

            {transaction.channel ? (
              <View className="rounded-full border-2 border-border bg-background px-2.5 py-1">
                <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                  {localizeOrdernowsText(transaction.channel, language)}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="items-end">
            <Text className="text-caption uppercase tracking-[1.7px] text-muted-foreground">
              {formatMonthDay(transaction.date, locale)}
            </Text>
            <Text className="mt-1 text-caption text-muted-foreground">
              {formatTimeLabel(transaction.date, locale)}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-h4 text-foreground uppercase">
              {localizeOrdernowsText(transaction.title, language)}
            </Text>
            <Text
              numberOfLines={1}
              className={cn(
                'shrink-0 text-h3 uppercase',
                amountTone
              )}>
              {amountText}
            </Text>
          </View>
          <Text className="mt-1 text-body text-muted-foreground">
            {localizeOrdernowsText(subtitle || transaction.subtitle, language)}
          </Text>
          {transaction.note ? (
            <Text className="mt-2 text-caption text-muted-foreground" numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
        </View>
      </PaperCard>
    </Pressable>
  );

  if (!onDelete || selectionMode) {
    return <View className="mb-3">{row}</View>;
  }

  return (
    <View className="mb-3 overflow-hidden rounded-[28px]">
      <SwipeToDeleteRow
        ref={swipeableRef}
        onSwipeStart={ignorePressAfterSwipe}
        onOpen={() => {
          isSwipeableOpenRef.current = true;
        }}
        onClose={() => {
          isSwipeableOpenRef.current = false;
          ignorePressAfterSwipe();
        }}
        renderRightAction={(close) => (
          <TransactionRowActions
            language={language}
            onDelete={onDelete}
            close={close}
          />
        )}>
        {row}
      </SwipeToDeleteRow>
    </View>
  );
}
