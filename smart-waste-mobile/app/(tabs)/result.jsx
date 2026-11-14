import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function getParam(value) {
  return Array.isArray(value) ? value[0] : value || '';
}

function formatConfidence(confidence) {
  const numericConfidence = Number(confidence);

  if (Number.isNaN(numericConfidence)) {
    return 'N/A';
  }

  const percentage = numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence;
  return `${percentage.toFixed(1)}% match ✓`;
}

function formatCategory(category) {
  return getParam(category)
    .replaceAll('_', ' ')
    .replace('E Waste', 'E-Waste')
    .replace('Batteries', '& Batteries');
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = formatCategory(params.category) || 'Waste Item';

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

        <View style={styles.matchRow}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryIconText}>⚡</Text>
          </View>
          <View style={styles.matchPill}>
            <Text style={styles.matchText}>{formatConfidence(params.confidence)}</Text>
          </View>
        </View>

        <Text style={styles.heading}>It's {category}!</Text>
        <Text style={styles.detectedText}>
          Detected from: <Text style={styles.detectedValue}>{getParam(params.detected_from) || 'uploaded image'}</Text>
        </Text>

        <View style={styles.recommendationCard}>
          <Text style={styles.sectionLabel}>RECOMMENDED RECYCLER</Text>
          <View style={styles.recyclerRow}>
            <View style={styles.recyclerDot} />
            <Text style={styles.recyclerText}>
              {getParam(params.recycler_type) || 'Local authorised recycler'}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DISPOSAL ACTION</Text>
          <Text style={styles.disposalText}>
            {getParam(params.disposal_instruction) || 'Separate this item and route it to the recommended recycler.'}
          </Text>

          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>Estimated Eco-Reward</Text>
            <Text style={styles.rewardValue}>
              +{getParam(params.points_earned) || '250'} pts
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: '/pickup',
              params: {
                category: getParam(params.category),
                items_diverted: getParam(params.items_diverted),
                points_earned: getParam(params.points_earned),
                scan_count: getParam(params.scan_count),
                total_points: getParam(params.total_points),
              },
            })
          }>
          <Text style={styles.primaryButtonText}>Schedule Pickup / Find Bin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>Scan Another Item</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.floatingSettings}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
          <Text style={styles.navIcon}>⌾</Text>
          <Text style={styles.navLabel}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/result')}>
          <Text style={[styles.navIcon, styles.navActive]}>☑</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/pickup')}>
          <Text style={styles.navIcon}>⌖</Text>
          <Text style={styles.navLabel}>Find & Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/impact')}>
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
    padding: 20,
    paddingTop: 54,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingTop: 18,
  },
  backButton: {
    flex: 1,
  },
  backText: {
    color: '#667069',
    fontSize: 13,
  },
  brandMark: {
    height: 30,
    width: 30,
  },
  headerSpacer: {
    height: 36,
    width: 36,
  },
  settingsIcon: {
    color: '#8a938c',
    fontSize: 18,
  },
  floatingSettings: {
    alignItems: 'center',
    backgroundColor: '#e0e5df',
    borderRadius: 18,
    bottom: 76,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    width: 36,
  },
  matchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: '#c4e6c6',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  categoryIconText: {
    color: '#16a83a',
    fontSize: 19,
  },
  matchPill: {
    backgroundColor: '#c6e7c7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  matchText: {
    color: '#17863a',
    fontSize: 11,
    fontWeight: '800',
  },
  heading: {
    color: '#101311',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 30,
    marginTop: 16,
  },
  detectedText: {
    color: '#7c8580',
    fontSize: 12,
    marginTop: 7,
  },
  detectedValue: {
    color: '#303a32',
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    marginTop: 18,
    padding: 18,
  },
  sectionLabel: {
    color: '#7c8580',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  recyclerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },
  recyclerDot: {
    backgroundColor: '#18ad8a',
    borderRadius: 6,
    height: 12,
    marginRight: 8,
    width: 12,
  },
  recyclerText: {
    color: '#101311',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  divider: {
    backgroundColor: '#e5e9e3',
    height: 1,
    marginVertical: 16,
  },
  disposalText: {
    color: '#303a32',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  rewardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  rewardLabel: {
    color: '#6e786f',
    fontSize: 11,
    fontWeight: '600',
  },
  rewardValue: {
    color: '#18a04a',
    fontSize: 12,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#18ad3a',
    borderRadius: 24,
    marginTop: 24,
    padding: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#cbd3c9',
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 9,
    padding: 14,
  },
  secondaryButtonText: {
    color: '#303a32',
    fontSize: 14,
    fontWeight: '700',
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
