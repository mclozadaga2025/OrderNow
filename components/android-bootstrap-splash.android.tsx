import { Image, StyleSheet, View } from 'react-native';

const androidBootstrapSplashImage = require('../assets/gombill_splash.png');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export function AndroidBootstrapSplash() {
  return (
    <View style={styles.root}>
      <Image resizeMode="cover" source={androidBootstrapSplashImage} style={styles.image} />
    </View>
  );
}
