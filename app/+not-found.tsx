import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/useLanguage';

const NOT_FOUND_COPY = {
  en: {
    title: '404 - Not found',
    description: "The page you're looking for couldn't be found.",
    hint: 'Your page may have moved or may not exist yet for this version of the app.',
    home: 'Go to Home',
    back: 'Go Back',
  },
  vi: {
    title: '404 - Không tìm thấy',
    description: 'Không tìm thấy trang bạn đang truy cập.',
    hint: 'Trang này có thể đã chuyển vị trí hoặc chưa có trong phiên bản ứng dụng hiện tại.',
    home: 'Về trang chủ',
    back: 'Quay lại',
  },
} as const;

export default function NotFoundScreen() {
  const { language } = useLanguage();
  const copy = NOT_FOUND_COPY[language];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center">
            <CardTitle className="text-h2 text-card-foreground">{copy.title}</CardTitle>
            <CardDescription className="text-body text-muted-foreground">
              {copy.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="items-center">
            <Text className="text-caption text-center text-muted-foreground">
              {copy.hint}
            </Text>
          </CardContent>
          <CardFooter className="gap-3">
            <Button onPress={() => router.replace('/')} className="flex-1">
              <Text className="text-button text-primary-foreground">{copy.home}</Text>
            </Button>
            <Button variant="outline" onPress={() => router.back()} className="flex-1">
              <Text className="text-button text-foreground">{copy.back}</Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    </SafeAreaView>
  );
}
