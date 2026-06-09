import { Image, StyleSheet, View } from 'react-native';

const androidBootstrapSplashImage = require('../assets/a_vibrant_and_youthful_mobile_splash_screen_for_thu_chi_app._a_soft_gradient.png');

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
