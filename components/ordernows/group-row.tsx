import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import LucideIcon from '@/lib/icons/LucideIcon';
import { localizeOrdernowsText } from '@/lib/localizeOrdernows';
import type { Group } from '@/lib/ordernows';
import type { AppLanguage } from '@/lib/useLanguage';
import { PaperCard } from './primitives';
import {
  SwipeToDeleteRow,
  type SwipeToDeleteRowMethods,
} from './swipe-to-delete-row';

interface GroupRowProps {
  group: Group;
  memberCount: number;
  membersLabel: string;
  language: AppLanguage;
  onPress: () => void;
  onDelete: () => void;
}

interface GroupRowActionsProps {
  language: AppLanguage;
  onDelete: () => void;
  close: () => void;
}

function GroupRowActions({ language, onDelete, close }: GroupRowActionsProps) {
  const deleteLabel = language === 'vi' ? 'Xóa nhóm' : 'Delete group';

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

export function GroupRow({
  group,
  memberCount,
  membersLabel,
  language,
  onPress,
  onDelete,
}: GroupRowProps) {
  const swipeableRef = useRef<SwipeToDeleteRowMethods | null>(null);
  const isSwipeableOpenRef = useRef(false);
  const ignorePressUntilRef = useRef(0);

  function ignorePressAfterSwipe() {
    ignorePressUntilRef.current = Date.now() + 300;
  }

  function handlePress() {
    if (Date.now() < ignorePressUntilRef.current) {
      return;
    }

    if (isSwipeableOpenRef.current) {
      swipeableRef.current?.close();
      return;
    }

    onPress();
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
          <GroupRowActions language={language} onDelete={onDelete} close={close} />
        )}>
        <Pressable onPress={handlePress} className="active:opacity-80">
          <PaperCard className="p-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-h4 text-foreground uppercase">{group.name}</Text>
                <Text className="mt-1 text-body text-muted-foreground">
                  {localizeOrdernowsText(group.tagline, language)}
                </Text>
              </View>

              <View className="rounded-[20px] border-2 border-border bg-background px-3 py-2">
                <Text className="text-h5 text-foreground uppercase">{memberCount}</Text>
                <Text className="text-caption uppercase tracking-[1.2px] text-muted-foreground">
                  {membersLabel}
                </Text>
              </View>
            </View>
          </PaperCard>
        </Pressable>
      </SwipeToDeleteRow>
    </View>
  );
}
