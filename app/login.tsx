import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth/AuthProvider';
import { H1 } from '@/components/ui/typography';
import LucideIcon from '@/lib/icons/LucideIcon';
import { KeyboardAwareScrollView } from '@/lib/keyboard-controller';
import { useLanguage } from '@/lib/useLanguage';
import { isSupabaseConfigured, supabase, supabaseConfigurationError } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useOrdernowsStore } from '@/stores/useOrdernowsStore';
import { useTheme } from '@/theming/ThemeProvider';

type AuthMode = 'signIn' | 'signUp';

const LOGIN_COPY = {
  en: {
    eyebrow: 'Ordernows ledger',
    signInTitle: 'Sign in to continue',
    signUpTitle: 'Create your account',
    signInDescription:
      'Use the account created for your ledger. Your password is handled securely by Supabase Auth.',
    signUpDescription:
      'Register with your email and start using your account immediately. No email verification is required.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    signUp: 'Create account',
    signingUp: 'Creating account...',
    switchToSignUp: 'Create a new account',
    switchToSignIn: 'Already registered? Sign in',
    configurationTitle: 'Supabase connection required',
    configurationDescription:
      'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable login.',
    credentialsRequired: 'Enter both your email and password.',
    passwordTooShort: 'Your password must contain at least 6 characters.',
    emailConfirmationStillEnabled:
      'Email confirmation is still enabled in Supabase. Disable Confirm email in the Supabase Auth provider settings, then try again.',
    unexpectedError: 'Could not complete the request. Check your connection and try again.',
    footer: 'New accounts can sign in immediately after registration.',
  },
  vi: {
    eyebrow: 'Sổ Ordernows',
    signInTitle: 'Đăng nhập để tiếp tục',
    signUpTitle: 'Tạo tài khoản',
    signInDescription:
      'Dùng tài khoản dành cho sổ của bạn. Mật khẩu được Supabase Auth xử lý an toàn.',
    signUpDescription:
      'Đăng ký bằng email và dùng tài khoản ngay. Không cần xác minh qua email.',
    emailLabel: 'Email',
    emailPlaceholder: 'ban@example.com',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    signIn: 'Đăng nhập',
    signingIn: 'Đang đăng nhập...',
    signUp: 'Tạo tài khoản',
    signingUp: 'Đang tạo tài khoản...',
    switchToSignUp: 'Đăng ký tài khoản mới',
    switchToSignIn: 'Đã có tài khoản? Đăng nhập',
    configurationTitle: 'Cần kết nối Supabase',
    configurationDescription:
      'Thêm EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY để bật đăng nhập.',
    credentialsRequired: 'Hãy nhập đầy đủ email và mật khẩu.',
    passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự.',
    emailConfirmationStillEnabled:
      'Supabase vẫn đang bật xác minh email. Hãy tắt Confirm email trong cài đặt nhà cung cấp Supabase Auth rồi thử lại.',
    unexpectedError: 'Không thể hoàn tất yêu cầu. Hãy kiểm tra kết nối và thử lại.',
    footer: 'Tài khoản mới có thể đăng nhập ngay sau khi đăng ký.',
  },
} as const;

const GOOGLE_PLAY_REVIEW_EMAIL = 'play-review@ordernows.local';
const GOOGLE_PLAY_REVIEW_PASSWORD = 'Review123!';

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { startGooglePlayReviewAccess } = useAuth();
  const loadGooglePlayReviewData = useOrdernowsStore(
    (state) => state.loadGooglePlayReviewData
  );
  const copy = LOGIN_COPY[language];

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setErrorMessage(copy.credentialsRequired);
      return;
    }

    const trimmedEmail = email.trim();
    const isGooglePlayReviewCredentials =
      authMode === 'signIn' &&
      trimmedEmail.toLowerCase() === GOOGLE_PLAY_REVIEW_EMAIL &&
      password === GOOGLE_PLAY_REVIEW_PASSWORD;

    if (authMode === 'signUp' && password.length < 6) {
      setErrorMessage(copy.passwordTooShort);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isGooglePlayReviewCredentials) {
        await loadGooglePlayReviewData();
        const reviewAccessError = await startGooglePlayReviewAccess();

        if (reviewAccessError) {
          setErrorMessage(reviewAccessError);
        }
        return;
      }

      if (!supabase) {
        setErrorMessage(supabaseConfigurationError);
        return;
      }

      const credentials = {
        email: trimmedEmail,
        password,
      };

      if (authMode === 'signUp') {
        const {
          data: { session },
          error,
        } = await supabase.auth.signUp(credentials);

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (!session) {
          setErrorMessage(copy.emailConfirmationStillEnabled);
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        setErrorMessage(error.message);
      }
    } catch {
      setErrorMessage(copy.unexpectedError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleAuthMode() {
    setAuthMode((currentMode) => (currentMode === 'signIn' ? 'signUp' : 'signIn'));
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  const isSigningUp = authMode === 'signUp';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={32}
        className="flex-1"
        contentContainerClassName="min-h-full flex-grow px-5 py-5 web:mx-auto web:w-full web:max-w-[620px] web:px-8"
        keyboardShouldPersistTaps="handled">
          <View className="flex-row justify-end gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </View>

          <View className={cn('flex-1 justify-center py-10', !isSigningUp && '-translate-y-8')}>
            <View className="mb-6 self-start rounded-full border-2 border-border bg-accent px-4 py-2">
              <Text className="text-caption uppercase tracking-[1.5px] text-accent-foreground">
                {copy.eyebrow}
              </Text>
            </View>

            <H1 className="mb-3 uppercase">
              {isSigningUp ? copy.signUpTitle : copy.signInTitle}
            </H1>
            <Text className="text-body mb-8 max-w-[520px] leading-6 text-muted-foreground">
              {isSigningUp ? copy.signUpDescription : copy.signInDescription}
            </Text>

            <View className="rounded-[26px] border-2 border-border bg-card p-5 shadow-xl web:p-7">
              {!isSupabaseConfigured ? (
                <View className="mb-5 flex-row gap-3 rounded-2xl border border-warning bg-background p-4">
                  <LucideIcon name="TriangleAlert" className="mt-0.5 text-warning" size={18} />
                  <View className="flex-1">
                    <Text className="text-button text-foreground">{copy.configurationTitle}</Text>
                    <Text className="text-body mt-1 leading-5 text-muted-foreground">
                      {copy.configurationDescription}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View className="gap-2">
                <Text className="text-caption uppercase tracking-[1.3px] text-muted-foreground">
                  {copy.emailLabel}
                </Text>
                <Input
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isSubmitting}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder={copy.emailPlaceholder}
                  returnKeyType="next"
                  textContentType="emailAddress"
                  value={email}
                />
              </View>

              <View className="mt-5 gap-2">
                <Text className="text-caption uppercase tracking-[1.3px] text-muted-foreground">
                  {copy.passwordLabel}
                </Text>
                <Input
                  autoCapitalize="none"
                  autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                  editable={!isSubmitting}
                  onChangeText={setPassword}
                  onSubmitEditing={() => void handleSubmit()}
                  placeholder={copy.passwordPlaceholder}
                  returnKeyType="go"
                  secureTextEntry
                  textContentType={isSigningUp ? 'newPassword' : 'password'}
                  value={password}
                />
              </View>

              {successMessage ? (
                <View className="mt-5 flex-row gap-2 rounded-xl border border-success bg-background p-3">
                  <LucideIcon name="CircleCheck" className="mt-0.5 text-success" size={16} />
                  <Text className="text-body flex-1 leading-5 text-success">{successMessage}</Text>
                </View>
              ) : null}

              {errorMessage ? (
                <View className="mt-5 flex-row gap-2 rounded-xl border border-destructive bg-background p-3">
                  <LucideIcon name="CircleAlert" className="mt-0.5 text-destructive" size={16} />
                  <Text className="text-body flex-1 leading-5 text-destructive">{errorMessage}</Text>
                </View>
              ) : null}

              <Button
                className="mt-6"
                disabled={isSubmitting}
                onPress={() => void handleSubmit()}
                size="lg">
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.primaryForeground} />
                ) : (
                  <Text>{isSigningUp ? copy.signUp : copy.signIn}</Text>
                )}
              </Button>

              <Button
                className="mt-3 h-12 px-6 native:h-14"
                disabled={isSubmitting}
                onPress={toggleAuthMode}
                variant="outline">
                <Text className="text-center leading-6">
                  {isSigningUp ? copy.switchToSignIn : copy.switchToSignUp}
                </Text>
              </Button>

              {isSubmitting ? (
                <Text className="text-caption mt-3 text-center uppercase tracking-[1.3px] text-muted-foreground">
                  {isSigningUp ? copy.signingUp : copy.signingIn}
                </Text>
              ) : null}
            </View>

            <Text className="text-caption mt-5 text-center uppercase tracking-[1.3px] text-muted-foreground">
              {copy.footer}
            </Text>
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
