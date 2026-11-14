import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          contentStyle: styles.stackContent,
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="result" />
        <Stack.Screen name="pickup" />
        <Stack.Screen name="impact" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#09090b',
    flex: 1,
    height: '100%',
    width: '100%',
  },
  stackContent: {
    backgroundColor: '#09090b',
    flex: 1,
  },

});
