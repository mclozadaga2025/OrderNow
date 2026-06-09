import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ACTION_WIDTH = 76;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const SWIPE_ACTIVATION_DISTANCE = 10;
const VERTICAL_FAIL_DISTANCE = 10;
const ANIMATION_DURATION = 180;

export interface SwipeToDeleteRowMethods {
  close: () => void;
}

interface SwipeToDeleteRowProps {
  children: ReactNode;
  renderRightAction: (close: () => void) => ReactNode;
  onSwipeStart?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export const SwipeToDeleteRow = forwardRef<
  SwipeToDeleteRowMethods,
  SwipeToDeleteRowProps
>(function SwipeToDeleteRow(
  { children, renderRightAction, onSwipeStart, onOpen, onClose },
  ref
) {
  const translateX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const isOpenRef = useRef(false);

  const setOpenState = useCallback(
    (isOpen: boolean) => {
      if (isOpenRef.current === isOpen) {
        return;
      }

      isOpenRef.current = isOpen;

      if (isOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }
    },
    [onClose, onOpen]
  );

  const close = useCallback(() => {
    translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
    setOpenState(false);
  }, [setOpenState, translateX]);

  const handleSwipeStart = useCallback(() => {
    onSwipeStart?.();
  }, [onSwipeStart]);

  useImperativeHandle(ref, () => ({ close }), [close]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-SWIPE_ACTIVATION_DISTANCE, SWIPE_ACTIVATION_DISTANCE])
        .failOffsetY([-VERTICAL_FAIL_DISTANCE, VERTICAL_FAIL_DISTANCE])
        .onStart(() => {
          gestureStartX.value = translateX.value;
          runOnJS(handleSwipeStart)();
        })
        .onUpdate((event) => {
          translateX.value = Math.min(
            0,
            Math.max(-ACTION_WIDTH, gestureStartX.value + event.translationX)
          );
        })
        .onEnd((event) => {
          const shouldOpen =
            event.velocityX < -500 ||
            (event.velocityX <= 500 && translateX.value < -OPEN_THRESHOLD);

          translateX.value = withTiming(shouldOpen ? -ACTION_WIDTH : 0, {
            duration: ANIMATION_DURATION,
          });
          runOnJS(setOpenState)(shouldOpen);
        }),
    [gestureStartX, handleSwipeStart, setOpenState, translateX]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="overflow-hidden">
      <View className="absolute inset-y-0 right-0" style={{ width: ACTION_WIDTH }}>
        {renderRightAction(close)}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
});
