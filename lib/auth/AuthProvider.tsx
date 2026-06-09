import { FunctionsHttpError, type Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { AppState, Platform } from 'react-native';
import { isSupabaseConfigured, supabase, supabaseConfigurationError } from '@/lib/supabase';
import {
  authenticateWithBiometrics,
  getIsBiometricLoginEnabled,
  setIsBiometricLoginEnabled,
} from '@/lib/auth/biometric-login';

interface AuthContextValue {
  session: Session | null;
  isInitialized: boolean;
  isBiometricLoginEnabled: boolean;
  isBiometricLocked: boolean;
  isGooglePlayReviewAccess: boolean;
  deleteAccount: () => Promise<string | null>;
  setBiometricLoginEnabled: (isEnabled: boolean, promptMessage: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  startGooglePlayReviewAccess: () => Promise<string | null>;
  unlockWithBiometrics: (promptMessage: string) => Promise<string | null>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
const GOOGLE_PLAY_REVIEW_ACCESS_STORAGE_KEY = '@ordernows/google-play-review-access-v1';

function logAuthWarning(message: string, detail: unknown) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(message, detail);
  }
}

async function getFunctionsErrorMessage(error: Error) {
  if (!(error instanceof FunctionsHttpError)) {
    return error.message;
  }

  try {
    const responseBody: unknown = await error.context.json();

    if (responseBody && typeof responseBody === 'object') {
      const { error: responseError, message } = responseBody as Record<string, unknown>;

      if (typeof responseError === 'string') {
        return responseError;
      }

      if (typeof message === 'string') {
        return message;
      }
    }
  } catch {
    return error.message;
  }

  return error.message;
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isSessionInitialized, setIsSessionInitialized] = React.useState(!isSupabaseConfigured);
  const [isReviewAccessInitialized, setIsReviewAccessInitialized] = React.useState(false);
  const [isGooglePlayReviewAccess, setIsGooglePlayReviewAccess] = React.useState(false);
  const [isBiometricPreferenceLoaded, setIsBiometricPreferenceLoaded] = React.useState(false);
  const [isBiometricLoginEnabled, setIsBiometricLoginEnabledState] = React.useState(false);
  const [isBiometricLocked, setIsBiometricLocked] = React.useState(false);
  const sessionRef = React.useRef<Session | null>(null);
  const isBiometricLoginEnabledRef = React.useRef(false);

  const updateSession = React.useCallback((nextSession: Session | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    setIsBiometricLocked(Boolean(nextSession && isBiometricLoginEnabledRef.current));
    setIsSessionInitialized(true);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    void AsyncStorage.getItem(GOOGLE_PLAY_REVIEW_ACCESS_STORAGE_KEY)
      .then((value) => {
        if (isMounted) {
          setIsGooglePlayReviewAccess(value === 'true');
        }
      })
      .catch((error: unknown) => {
        logAuthWarning('Unable to restore Google Play review access.', error);
      })
      .finally(() => {
        if (isMounted) {
          setIsReviewAccessInitialized(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    void getIsBiometricLoginEnabled()
      .then((isEnabled) => {
        isBiometricLoginEnabledRef.current = isEnabled;
        setIsBiometricLoginEnabledState(isEnabled);
        setIsBiometricLocked(Boolean(sessionRef.current && isEnabled));
      })
      .finally(() => {
        setIsBiometricPreferenceLoaded(true);
      });
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      setIsSessionInitialized(true);
      return;
    }

    const auth = supabase.auth;
    let isMounted = true;
    let unsubscribe: () => void = () => undefined;

    const startAuthLifecycle = () => {
      const initializationPromise = auth.initialize();
      const {
        data: { subscription },
      } = auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) {
          return;
        }

        updateSession(nextSession);
      });

      unsubscribe = () => subscription.unsubscribe();
      void initializationPromise
        .then(({ error }) => {
          if (error) {
            logAuthWarning('Unable to initialize authentication session.', error.message);
          }
        })
        .catch((error: unknown) => {
          logAuthWarning('Unable to initialize authentication session.', error);
        });
    };

    void auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          logAuthWarning('Unable to restore authentication session.', error.message);
        }

        updateSession(data.session);
        startAuthLifecycle();
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        logAuthWarning('Unable to restore authentication session.', error);
        updateSession(null);
        startAuthLifecycle();
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [updateSession]);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' && sessionRef.current && isBiometricLoginEnabledRef.current) {
        setIsBiometricLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const setBiometricLoginEnabled = React.useCallback(
    async (isEnabled: boolean, promptMessage: string) => {
      if (isGooglePlayReviewAccess) {
        return 'Biometric login is unavailable during Google Play review access.';
      }

      if (Platform.OS === 'web') {
        return 'Biometric login is only available in the iOS and Android apps.';
      }

      const result = await authenticateWithBiometrics(promptMessage);

      if (!result.success) {
        if (result.availability === 'not-enrolled') {
          return 'Set up Face ID or fingerprint authentication in your device settings first.';
        }

        if (result.availability === 'not-supported') {
          return 'This device does not support biometric authentication.';
        }

        return 'Biometric authentication was not completed.';
      }

      await setIsBiometricLoginEnabled(isEnabled);
      isBiometricLoginEnabledRef.current = isEnabled;
      setIsBiometricLoginEnabledState(isEnabled);
      setIsBiometricLocked(false);
      return null;
    },
    [isGooglePlayReviewAccess]
  );

  const unlockWithBiometrics = React.useCallback(async (promptMessage: string) => {
    const result = await authenticateWithBiometrics(promptMessage);

    if (!result.success) {
      return 'Biometric authentication was not completed.';
    }

    setIsBiometricLocked(false);
    return null;
  }, []);

  const signOut = React.useCallback(async () => {
    if (isGooglePlayReviewAccess) {
      await AsyncStorage.removeItem(GOOGLE_PLAY_REVIEW_ACCESS_STORAGE_KEY);
      setIsGooglePlayReviewAccess(false);
      setIsBiometricLocked(false);
      return null;
    }

    if (!supabase) {
      return supabaseConfigurationError;
    }

    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
  }, [isGooglePlayReviewAccess]);

  const deleteAccount = React.useCallback(async () => {
    if (isGooglePlayReviewAccess) {
      return 'Google Play review access does not create a Supabase account.';
    }

    if (!supabase) {
      return supabaseConfigurationError;
    }

    const { error } = await supabase.functions.invoke('delete-account');

    if (error) {
      return getFunctionsErrorMessage(error);
    }

    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }, [isGooglePlayReviewAccess]);

  const startGooglePlayReviewAccess = React.useCallback(async () => {
    try {
      await AsyncStorage.setItem(GOOGLE_PLAY_REVIEW_ACCESS_STORAGE_KEY, 'true');
      setIsGooglePlayReviewAccess(true);
      setIsBiometricLocked(false);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Could not start Google Play review access.';
    }
  }, []);

  const isInitialized =
    isSessionInitialized && isBiometricPreferenceLoaded && isReviewAccessInitialized;

  const value = React.useMemo(
    () => ({
      session,
      isInitialized,
      isBiometricLoginEnabled,
      isBiometricLocked,
      isGooglePlayReviewAccess,
      deleteAccount,
      setBiometricLoginEnabled,
      signOut,
      startGooglePlayReviewAccess,
      unlockWithBiometrics,
    }),
    [
      deleteAccount,
      isBiometricLocked,
      isBiometricLoginEnabled,
      isGooglePlayReviewAccess,
      isInitialized,
      session,
      setBiometricLoginEnabled,
      signOut,
      startGooglePlayReviewAccess,
      unlockWithBiometrics,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
