import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

export const SplashScreen = () => {
  const { theme } = useTheme();

  // Obtém o nome do app do arquivo app.json
  const appConfig = Constants.expoConfig;
  const appName = appConfig?.splashScreenConfig?.appName || "Noar";

  // Converte o nome em um array de letras
  const letters = appName.split("");

  // Cria valores animados para cada letra
  const opacityValues = letters.map(() => useSharedValue(0));
  const translateValues = letters.map(() => useSharedValue(-50));

  // Animação de scale para efeito de pulsação
  const scale = useSharedValue(1);

  // Valor animado para o indicador de carregamento
  const loaderOpacity = useSharedValue(0);

  // Iniciar animações quando o componente montar
  useEffect(() => {
    const duration = 400;

    // Animação sequencial das letras
    letters.forEach((_, index) => {
      const delay = index * 150;

      opacityValues[index].value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );

      translateValues[index].value = withDelay(
        delay,
        withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
      );
    });

    // Animação contínua de pulsação
    scale.value = withDelay(
      letters.length * 150 + 200,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // -1 significa repetir infinitamente
        true // alternar (true = vai e volta)
      )
    );

    // Exibir o indicador de carregamento após a animação das letras
    loaderOpacity.value = withDelay(
      letters.length * 150 + 200,
      withTiming(1, { duration: 400 })
    );
  }, [letters.length]);

  // Cria os estilos animados para cada letra
  const animatedStyles = letters.map((_, index) => {
    return useAnimatedStyle(() => ({
      opacity: opacityValues[index].value,
      transform: [
        { translateY: translateValues[index].value },
        { scale: scale.value },
      ],
    }));
  });

  // Estilo animado para o indicador de carregamento
  const loaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.wordContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={`${letter}-${index}`}
            style={[
              styles.letter,
              animatedStyles[index],
              { color: theme.colors.primary },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      <Animated.View style={[styles.loaderContainer, loaderAnimatedStyle]}>
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          animating={true}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontSize: 80,
    fontWeight: "bold",
    marginHorizontal: 2,
  },
  loaderContainer: {
    marginTop: 30,
  },
});
