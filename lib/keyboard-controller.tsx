import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  findNodeHandle,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TurboModuleRegistry,
  type KeyboardEvent,
} from 'react-native';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

type KeyboardControllerModule = typeof import('react-native-keyboard-controller');

/**
 * The Draftbit managed preview client does not link the
 * `react-native-keyboard-controller` native module, so we detect it at runtime
 * only for Android soft-input configuration. Scroll behavior intentionally stays
 * in this JS wrapper for parity between preview, dev clients, and APK builds.
 */
function hasNativeKeyboardController() {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    return Boolean(TurboModuleRegistry.get('KeyboardController'));
  } catch {
    return false;
  }
}

function loadKeyboardController(): KeyboardControllerModule | null {
  if (!hasNativeKeyboardController()) {
    return null;
  }

  try {
    return require('react-native-keyboard-controller') as KeyboardControllerModule;
  } catch {
    return null;
  }
}

const keyboardController = loadKeyboardController();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

/**
 * Lets the shared `Input` component ask the nearest keyboard-aware scroll view to
 * re-scroll the currently focused field.
 */
const KeyboardAwareFocusContext = createContext<(() => void) | null>(null);

export function useKeyboardAwareFocus() {
  return useContext(KeyboardAwareFocusContext);
}

export function KeyboardProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (!keyboardController || Platform.OS !== 'android') {
      return;
    }

    const { KeyboardController, AndroidSoftInputModes } = keyboardController;
    KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_RESIZE);

    return () => {
      KeyboardController.setDefaultMode();
    };
  }, []);

  return <>{children}</>;
}

/**
 * Cross-platform keyboard-aware scroll view backed by React Native primitives.
 * It reserves bottom padding equal to the keyboard height and retries the focused
 * input scroll across Android IME/layout timing changes.
 */
export const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(props, ref) {
    const {
      bottomOffset = 0,
      extraKeyboardSpace = 0,
      contentContainerStyle,
      style,
      onContentSizeChange,
      children,
      ...scrollViewProps
    } = props;

    // Native-only props that React Native's ScrollView does not understand.
    delete scrollViewProps.disableScrollOnKeyboardHide;
    delete scrollViewProps.enabled;
    delete scrollViewProps.ScrollViewComponent;

    const scrollRef = useRef<ScrollView | null>(null);
    const isKeyboardVisible = useRef(false);
    const scrollTimeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);
    const [reservedSpace, setReservedSpace] = useState(0);

    useImperativeHandle(ref, () => scrollRef.current as ScrollView, []);

    // Gap kept between the focused input and the top of the keyboard.
    // Android keyboards often add suggestion/tool rows after the initial show
    // event, so keep a larger minimum clearance than the passed form offset.
    const requestedGap = bottomOffset + extraKeyboardSpace;
    const gap = Platform.OS === 'android' ? Math.max(requestedGap, 128) : requestedGap;

    const clearScheduledScrolls = useCallback(() => {
      scrollTimeouts.current.forEach(clearTimeout);
      scrollTimeouts.current = [];
    }, []);

    const scrollFocusedInputIntoView = useCallback(() => {
      if (!isKeyboardVisible.current) {
        // Keyboard is not open yet; the keyboard-show listener will handle it.
        return;
      }

      globalThis.requestAnimationFrame(() => {
        const focusedInput = TextInput.State.currentlyFocusedInput();
        const focusedInputHandle = focusedInput
          ? findNodeHandle(focusedInput as unknown as Parameters<typeof findNodeHandle>[0])
          : null;
        const scrollResponder = scrollRef.current?.getScrollResponder?.() as
          | {
              scrollResponderScrollNativeHandleToKeyboard?: (
                nodeHandle: unknown,
                additionalOffset?: number,
                preventNegativeScrollOffset?: boolean
              ) => void;
            }
          | undefined;

        if (!focusedInputHandle || !scrollResponder?.scrollResponderScrollNativeHandleToKeyboard) {
          return;
        }

        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(focusedInputHandle, gap, true);
      });
    }, [gap]);

    const scheduleFocusedInputScroll = useCallback(() => {
      if (!isKeyboardVisible.current) {
        return;
      }

      clearScheduledScrolls();
      scrollFocusedInputIntoView();

      [50, 150, 300].forEach((delay) => {
        const timeout = setTimeout(scrollFocusedInputIntoView, delay);
        scrollTimeouts.current.push(timeout);
      });
    }, [clearScheduledScrolls, scrollFocusedInputIntoView]);

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      function handleShow(event: KeyboardEvent) {
        isKeyboardVisible.current = true;
        // Reserve room below the content so that inputs sitting near the bottom can
        // still be scrolled above the keyboard. The decisive scroll runs once that
        // extra space has actually been laid out (see handleContentSizeChange).
        setReservedSpace(event.endCoordinates.height + gap);
        scheduleFocusedInputScroll();
      }

      function handleChangeFrame(event: KeyboardEvent) {
        if (!isKeyboardVisible.current) {
          return;
        }

        setReservedSpace(event.endCoordinates.height + gap);
        scheduleFocusedInputScroll();
      }

      function handleHide() {
        isKeyboardVisible.current = false;
        clearScheduledScrolls();
        setReservedSpace(0);
      }

      const showSubscription = Keyboard.addListener(showEvent, handleShow);
      const hideSubscription = Keyboard.addListener(hideEvent, handleHide);
      const changeFrameSubscription = Keyboard.addListener('keyboardDidChangeFrame', handleChangeFrame);

      return () => {
        clearScheduledScrolls();
        showSubscription.remove();
        hideSubscription.remove();
        changeFrameSubscription.remove();
      };
    }, [clearScheduledScrolls, gap, scheduleFocusedInputScroll]);

    const handleContentSizeChange = useCallback(
      (width: number, height: number) => {
        onContentSizeChange?.(width, height);
        // The reserved bottom space is now laid out, so there is finally enough
        // scroll range to lift an input that sits at the very bottom of the form.
        if (isKeyboardVisible.current) {
          scheduleFocusedInputScroll();
        }
      },
      [onContentSizeChange, scheduleFocusedInputScroll]
    );

    return (
      <KeyboardAwareFocusContext.Provider value={scheduleFocusedInputScroll}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          {...scrollViewProps}
          automaticallyAdjustKeyboardInsets={false}
          ref={scrollRef}
          onContentSizeChange={handleContentSizeChange}
          style={[styles.container, style]}
          contentContainerStyle={[
            styles.contentContainer,
            contentContainerStyle,
            reservedSpace > 0 ? { paddingBottom: reservedSpace } : null,
          ]}>
          {children}
        </ScrollView>
      </KeyboardAwareFocusContext.Provider>
    );
  }
);

KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';
