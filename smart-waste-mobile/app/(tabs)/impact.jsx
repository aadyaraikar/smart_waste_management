import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { getScanStats } from '../../constants/scanStats';

function getParam(value, fallback = '') {
  return Array.isArray(value) ? value[0] : value || fallback;
}

const sampleScans = [
  {
    name: 'Cotton Graphic T-Shirt',
    detail: 'Textiles • 100% conf',
    status: 'Routed',
    icon: 'tshirt-crew',
    color: '#c98267',
  },
  {
    name: 'Duracell AA Batteries',
    detail: 'E-Waste • 95% conf',
    status: 'Pickup Set',
    icon: 'battery-high',
    color: '#4caa89',
  },
  {
    name: 'Ribbed Steel Tin Can',
    detail: 'Metal • 98% conf',
    status: 'Recycled',
    icon: 'can',
    color: '#8e8e93',
  },
];

export default function ImpactScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentStats = getScanStats();
  const scheduledCategory = getParam(params.category);
  const pointsEarned = getParam(params.points, '250');
  const totalPoints = getParam(params.total_points, String(currentStats.totalPoints));
  const itemsDiverted = getParam(
    params.items_diverted,
    String(currentStats.itemsDiverted),
  );
  const scans = scheduledCategory
    ? [
        {
          name: scheduledCategory,
          detail: 'Scheduled pickup • 100% conf',
          status: 'Pickup Set',
          icon: 'recycle',
          color: '#18ad3a',
        },
        ...sampleScans,
      ]
    : sampleScans;

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

        <View style={styles.levelRow}>
          <View style={styles.medalBadge}>
            <MaterialCommunityIcons name="medal-outline" size={18} color="#6e786f" />
          </View>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>Level 4 Recycler</Text>
          </View>
        </View>

        <Text style={styles.heading}>You must be proud!</Text>
        <Text style={styles.subtitle}>Keep sorting waste to unlock municipal rewards.</Text>

        <View style={styles.pointsCard}>
          <View style={styles.pointsInfo}>
            <Text style={styles.eyebrow}>You earned</Text>
            <Text style={styles.pointsTitle}>+{pointsEarned} points today!</Text>
            <View style={styles.divertedBadge}>
              <MaterialCommunityIcons name="recycle" size={14} color="#18ad3a" />
              <Text style={styles.divertedText}>{itemsDiverted} items diverted</Text>
            </View>
          </View>
          <View style={styles.progressRing}>
            <Text style={styles.progressPoints}>{totalPoints}</Text>
            <Text style={styles.progressLabel}>pts</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT API SCANS</Text>
          <Text style={styles.liveText}>Live Session</Text>
        </View>

        <View style={styles.scanList}>
          {scans.map((scan) => (
            <View style={styles.scanCard} key={`${scan.name}-${scan.status}`}>
              <View style={[styles.scanIcon, { backgroundColor: `${scan.color}25` }]}>
                <MaterialCommunityIcons name={scan.icon} size={19} color={scan.color} />
              </View>
              <View style={styles.scanDetails}>
                <Text style={styles.scanName} numberOfLines={1}>{scan.name}</Text>
                <Text style={styles.scanDetail}>{scan.detail}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{scan.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>+ Scan New Item</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/pickup')}>
          <Text style={styles.navIcon}>⌖</Text>
          <Text style={styles.navLabel}>Find & Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>♙</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Impact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#f5f7f4', flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingTop: 44 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: { flex: 1 },
  backText: { color: '#667069', fontSize: 13 },
  brandMark: { height: 42, width: 42 },
  headerSpacer: { height: 24, width: 24 },
  levelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  medalBadge: {
    alignItems: 'center',
    backgroundColor: '#e3e9e1',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  levelPill: { backgroundColor: '#cce8c9', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  levelText: { color: '#16883a', fontSize: 10, fontWeight: '800' },
  heading: { color: '#101311', fontSize: 27, fontWeight: '800', marginTop: 15 },
  subtitle: { color: '#7c8580', fontSize: 11, marginTop: 5 },
  pointsCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 16,
  },
  pointsInfo: { flex: 1 },
  eyebrow: { color: '#7c8580', fontSize: 11 },
  pointsTitle: { color: '#101311', fontSize: 16, fontWeight: '800', marginTop: 4 },
  divertedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 13,
  },
  divertedText: { color: '#18a04a', fontSize: 11, fontWeight: '700', marginLeft: 5 },
  progressRing: {
    alignItems: 'center',
    borderColor: '#18ad3a',
    borderRadius: 38,
    borderWidth: 5,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  progressPoints: { color: '#101311', fontSize: 19, fontWeight: '800' },
  progressLabel: { color: '#7c8580', fontSize: 10, marginTop: -2 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  sectionTitle: { color: '#7c8580', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  liveText: { color: '#18a04a', fontSize: 10, fontWeight: '800' },
  scanList: { gap: 8, marginTop: 10 },
  scanCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 9,
  },
  scanIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  scanDetails: { flex: 1, marginLeft: 9 },
  scanName: { color: '#303a32', fontSize: 11, fontWeight: '800' },
  scanDetail: { color: '#8a938c', fontSize: 9, marginTop: 3 },
  statusPill: { backgroundColor: '#e1f1df', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { color: '#16883a', fontSize: 9, fontWeight: '800' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#18ad3a',
    borderRadius: 24,
    marginTop: 24,
    padding: 15,
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
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
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { color: '#8a938c', fontSize: 20, height: 24 },
  navActive: { color: '#18ad3a' },
  navLabel: { color: '#7c8580', fontSize: 9, marginTop: 2 },
});
