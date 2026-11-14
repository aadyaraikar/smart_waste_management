import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';
import LocationMap from '../../components/location-map';

const MAP_REGION = {
  latitude: 15.2732,
  longitude: 73.9583,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const categories = [
  { name: 'Metal', color: '#8E8E93', icon: 'archive-outline' },
  { name: 'Battery', color: '#D99B26', icon: 'lightning-bolt' },
  { name: 'Glass', color: '#2554C7', icon: 'glass-fragile' },
  { name: 'Organic', color: '#0F6D31', icon: 'leaf' },
  { name: 'Paper / Cardboard', color: '#7D3C98', icon: 'folder-multiple' },
  { name: 'Plastic', color: '#54B3F3', icon: 'shopping' },
  { name: 'Shoes / Clothes', color: '#A93226', icon: 'shoe-sneaker' },
];

const recyclers = [
  {
    id: 8,
    name: 'Verna Industrial E-Waste Hub',
    latitude: 15.2795,
    longitude: 73.9589,
    distance: '1.2 km',
  },
  {
    id: 11,
    name: 'Madgaon Authorised Tech Recycler',
    latitude: 15.2686,
    longitude: 73.967,
    distance: '2.4 km',
  },
  {
    id: 14,
    name: 'Fatorda Municipal Dry Waste Center',
    latitude: 15.2578,
    longitude: 73.9652,
    distance: '3.1 km',
  },
  {
    id: 17,
    name: 'Navelim Green Scrap & Kabadiwala Hub',
    latitude: 15.2594,
    longitude: 73.9791,
    distance: '3.8 km',
  },
];

function CategorySymbol({ category }) {
  return (
    <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
      <MaterialCommunityIcons name={category.icon} size={27} color="#fff" />
    </View>
  );
}

function normalizeCategory(value) {
  const category = Array.isArray(value) ? value[0] : value;
  const aliases = {
    Battery: 'Battery',
    'E-Waste': 'Battery',
    'E Waste': 'Battery',
    Organic: 'Organic',
    Biodegradable: 'Organic',
    Paper: 'Paper / Cardboard',
    Cardboard: 'Paper / Cardboard',
    Shoes: 'Shoes / Clothes',
    Clothes: 'Shoes / Clothes',
  };

  return aliases[category] || category;
}

export default function PickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = normalizeCategory(params.category);
  const selectedInitialCategory = categories.some((category) => category.name === initialCategory)
    ? initialCategory
    : 'Plastic';
  const [selectedCategory, setSelectedCategory] = useState(selectedInitialCategory);
  const [selectedLocation, setSelectedLocation] = useState('Home');
  const [selectedRecycler, setSelectedRecycler] = useState(recyclers[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const confirmPickup = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setConfirmation('');

    try {
      await axios.post(`${API_BASE_URL}/pickups`, {
        category: selectedCategory,
        notes: `Pickup requested for ${selectedRecycler.name}.`,
        recycler_id: selectedRecycler.id,
        user_address: selectedLocation,
      });
      router.replace({
        pathname: '/impact',
        params: {
          category: selectedCategory,
          items_diverted: params.items_diverted,
          points: params.points_earned || '250',
          total_points: params.total_points,
        },
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : String(error);
      setConfirmation(`Could not confirm pickup: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
            <Text style={styles.backText}>‹ Go back</Text>
          </TouchableOpacity>
          <Image source={require('../../assets/images/brand-mark.png')} style={styles.brandMark} />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.titleRow}>
          <View style={styles.truckIcon}>
            <Image
              source={require('../../assets/images/delivery-truck.png')}
              style={styles.truckImage}
            />
          </View>
          <Text style={styles.heading}>Schedule pickup or{'\n'}find closest bin</Text>
        </View>

        <Text style={styles.label}>Waste category to route:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryOption,
                selectedCategory === category.name && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.name)}>
              <CategorySymbol category={category} />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, styles.pickupLabel]}>Pickup location:</Text>
        <View style={styles.locationRow}>
          {['Home', 'Office', 'Other'].map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.locationOption,
                selectedLocation === location && styles.selectedLocation,
              ]}
              onPress={() => setSelectedLocation(location)}>
              <MaterialCommunityIcons
                name={
                  location === 'Home'
                    ? 'home-outline'
                    : location === 'Office'
                      ? 'office-building'
                      : 'dots-horizontal-circle-outline'
                }
                size={16}
                color="#8a938c"
              />
              <Text style={styles.locationText}>{location}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mapCard}>
          <LocationMap
            onSelectRecycler={setSelectedRecycler}
            selectedRecyclerId={selectedRecycler.id}
          />
          <Text style={styles.mapLabel}>Madgaon, Goa • Live Bins</Text>
          {recyclers.map((recycler) => (
            <TouchableOpacity
              key={recycler.id}
              style={[
                styles.recyclerRow,
                selectedRecycler.id === recycler.id && styles.selectedRecyclerRow,
              ]}
              onPress={() => setSelectedRecycler(recycler)}>
              <View style={styles.recyclerDot} />
              <Text style={styles.recyclerName}>{recycler.name}</Text>
              <Text style={styles.distance}>{recycler.distance}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
            onPress={confirmPickup}
            disabled={isSubmitting}>
            <Text style={styles.confirmText}>
              {isSubmitting ? 'Confirming…' : 'Confirm Pickup Request'}
            </Text>
          </TouchableOpacity>
          {!!confirmation && <Text style={styles.confirmation}>{confirmation}</Text>}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
          <Text style={styles.navIcon}>⌾</Text>
          <Text style={styles.navLabel}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/result')}>
          <Text style={styles.navIcon}>☑</Text>
          <Text style={styles.navLabel}>Result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>⌖</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Find & Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>♙</Text>
          <Text style={styles.navLabel}>Impact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f5f7f4',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 54,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  backButton: {
    flex: 1,
  },
  backText: {
    color: '#667069',
    fontSize: 13,
  },
  brandMark: {
    height: 42,
    width: 42,
  },
  headerSpacer: {
    height: 30,
    width: 30,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  truckIcon: {
    alignItems: 'center',
    backgroundColor: '#c4e6c6',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  truckImage: {
    height: 30,
    width: 30,
  },
  heading: {
    color: '#101311',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 27,
  },
  label: {
    color: '#707b72',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  pickupLabel: {
    marginTop: 0,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 0,
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 68,
    paddingHorizontal: 6,
    paddingVertical: 5,
    width: 76,
  },
  selectedCategory: {
    backgroundColor: '#d8ecd8',
    borderColor: '#18ad3a',
    borderWidth: 1,
  },
  categoryBadge: {
    alignItems: 'center',
    borderRadius: 22,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  categoryText: {
    color: '#455047',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 8,
  },
  locationOption: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 11,
  },
  selectedLocation: {
    backgroundColor: '#d8ecd8',
    borderColor: '#18ad3a',
    borderWidth: 1,
  },
  locationIcon: {
    color: '#8a938c',
    fontSize: 16,
  },
  locationText: {
    color: '#455047',
    fontSize: 11,
    marginTop: 3,
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 14,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  map: {
    height: 220,
    width: '100%',
  },
  mapLabel: {
    color: '#536056',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 9,
  },
  recyclerRow: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 7,
    paddingHorizontal: 5,
    paddingTop: 7,
  },
  selectedRecyclerRow: {
    backgroundColor: '#eef7ee',
  },
  recyclerDot: {
    backgroundColor: '#18ad8a',
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  recyclerName: {
    color: '#445047',
    flex: 1,
    fontSize: 10,
  },
  distance: {
    color: '#18a04a',
    fontSize: 10,
    fontWeight: '700',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#18ad3a',
    borderRadius: 24,
    marginTop: 0,
    padding: 15,
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmation: {
    color: '#16883a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  bottomActions: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  bottomNav: {
    alignItems: 'flex-start',
    backgroundColor: '#f7f9f6',
    borderTopColor: '#e2e7e1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 64,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    color: '#8a938c',
    fontSize: 20,
    height: 24,
  },
  navActive: {
    color: '#18ad3a',
  },
  navLabel: {
    color: '#7c8580',
    fontSize: 9,
    marginTop: 2,
  },
});
