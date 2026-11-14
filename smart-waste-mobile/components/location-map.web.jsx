import { StyleSheet, Text, View } from 'react-native';

export default function LocationMap() {
  return (
    <View style={styles.webMapFallback}>
      <Text style={styles.webMapTitle}>Madgaon, Goa • Live Bins</Text>
      <Text style={styles.webMapText}>
        Open the mobile app to pan and zoom the live recycling map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapFallback: {
    backgroundColor: '#e8e8df',
    height: 220,
    justifyContent: 'center',
    padding: 18,
  },
  webMapTitle: { color: '#536056', fontSize: 12, fontWeight: '800' },
  webMapText: { color: '#707b72', fontSize: 11, lineHeight: 17, marginTop: 6 },
});
