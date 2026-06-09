import { forwardRef, type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

// On web the browser keeps focused inputs visible on its own, so there is nothing
// for the shared `Input` component to notify. Kept for API parity with native.
export function useKeyboardAwareFocus() {
  return null;
}

export function KeyboardProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  (props, ref) => {
    const { contentContainerStyle, ...scrollViewProps } = props;
    delete scrollViewProps.bottomOffset;
    delete scrollViewProps.disableScrollOnKeyboardHide;
    delete scrollViewProps.enabled;
    delete scrollViewProps.extraKeyboardSpace;
    delete scrollViewProps.ScrollViewComponent;

    return (
      <ScrollView
        ref={ref}
        {...scrollViewProps}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        style={[styles.container, props.style]}
      />
    );
  }
);

KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';
