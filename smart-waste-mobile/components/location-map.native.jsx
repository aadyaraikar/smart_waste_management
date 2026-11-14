import MapView, { Callout, Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

const MAP_REGION = {
  latitude: 15.2732,
  longitude: 73.9583,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const recyclers = [
  { id: 8, name: 'Verna Industrial E-Waste Hub', latitude: 15.2795, longitude: 73.9589, distance: '1.2 km' },
  { id: 11, name: 'Madgaon Authorised Tech Recycler', latitude: 15.2686, longitude: 73.967, distance: '2.4 km' },
  { id: 14, name: 'Fatorda Municipal Dry Waste Center', latitude: 15.2578, longitude: 73.9652, distance: '3.1 km' },
  { id: 17, name: 'Navelim Green Scrap & Kabadiwala Hub', latitude: 15.2594, longitude: 73.9791, distance: '3.8 km' },
];

export default function LocationMap({ onSelectRecycler, selectedRecyclerId }) {
  return (
    <MapView initialRegion={MAP_REGION} style={styles.map}>
      {recyclers.map((recycler) => (
        <Marker
          key={recycler.id}
          coordinate={{ latitude: recycler.latitude, longitude: recycler.longitude }}
          pinColor={selectedRecyclerId === recycler.id ? '#18ad3a' : '#c7912e'}
          onPress={() => onSelectRecycler(recycler)}>
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{recycler.name}</Text>
              <Text style={styles.calloutDistance}>{recycler.distance} away</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 220, width: '100%' },
  callout: { maxWidth: 190, padding: 4 },
  calloutTitle: { color: '#101311', fontSize: 12, fontWeight: '700' },
  calloutDistance: { color: '#18a04a', fontSize: 11, marginTop: 3 },
});
