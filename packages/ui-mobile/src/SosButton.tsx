import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

interface Props {
  onPress: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
}

export function SosButton({ onPress, label = 'SOS', sublabel = 'Hold to call for help', disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View className="items-center justify-center">
      <View className="relative items-center justify-center">
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: 9999,
            backgroundColor: '#e11d48',
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }}
        />
        <Pressable
          onPress={() => {
            Animated.sequence([
              Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
              Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
            ]).start();
            onPress();
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Send SOS"
        >
          <Animated.View
            style={{
              width: 200,
              height: 200,
              borderRadius: 9999,
              backgroundColor: disabled ? '#52525b' : '#dc2626',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale }],
            }}
          >
            <Text className="text-5xl font-black tracking-widest text-white">{label}</Text>
          </Animated.View>
        </Pressable>
      </View>
      <Text className="mt-6 text-base font-medium text-zinc-300">{sublabel}</Text>
    </View>
  );
}
