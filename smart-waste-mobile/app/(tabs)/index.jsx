import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';
import { getScanStats, recordScan } from '../../constants/scanStats';

const CLASSIFY_URL = `${API_BASE_URL}/classify`;

function getFileName(asset) {
  if (asset.fileName) {
    return asset.fileName;
  }

  return asset.uri.split(/[\\/]/).pop() || 'waste-image.jpg';
}

function getMimeType(asset, fileName) {
  if (asset.mimeType) {
    return asset.mimeType;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : 'image/jpeg';
}

export default function ScanScreen() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(getScanStats);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Photo library permission is required to choose an image.',
      );
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!response.canceled && response.assets?.[0]) {
      setImage(response.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!response.canceled && response.assets?.[0]) {
      setImage(response.assets[0]);
    }
  };

  const classifyWaste = async () => {
    if (!image) {
      Alert.alert('Upload a photo', 'Choose or capture a waste item before classifying it.');
      return;
    }

    setLoading(true);

    try {
      const fileName = getFileName(image);
      const mimeType = getMimeType(image, fileName);
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const blobResponse = await fetch(image.uri);

        if (!blobResponse.ok) {
          throw new Error(`Could not read the selected image (${blobResponse.status}).`);
        }

        const blob = await blobResponse.blob();
        formData.append('file', blob, fileName);
      } else {
        formData.append('file', {
          name: fileName,
          type: mimeType,
          uri: image.uri,
        });
      }

      const response = await axios.post(CLASSIFY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      const updatedStats = recordScan(250);
      setStats(updatedStats);

      router.push({
        pathname: '/result',
        params: {
          category: response.data.category || '',
          confidence: String(response.data.confidence ?? ''),
          detected_from: getFileName(image),
          disposal_instruction: response.data.disposal_instruction || '',
          items_diverted: String(updatedStats.itemsDiverted),
          points_earned: '250',
          recycler_type: response.data.recycler_type || '',
          scan_count: String(updatedStats.dailyScans),
          total_points: String(updatedStats.totalPoints),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Classification failed',
        `${errorMessage}\nURL: ${CLASSIFY_URL}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.phoneShell}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}>
            <Image source={require('../../assets/images/brand-mark.png')} style={styles.brandMarkImage} />
          </View>

          <View style={styles.scanCard}>
            <View style={styles.cardHeader}>
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <MaterialCommunityIcons name="camera-outline" size={25} color="#16883a" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              Snap or <Text style={styles.titleUpload}>upload</Text>
              {'\n'}your waste
            </Text>

            <View style={styles.uploadBox}>
              {image ? (
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/images/sample-batteries.jpeg')}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.helperText}>e.g. batteries</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#18221a" />
                <Text style={styles.uploadText}>{image ? 'Change Photo' : 'Upload Photo'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.classifyButton, loading && styles.classifyButtonLoading]}
              onPress={classifyWaste}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.classifyText}>Classify Waste Item</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsCopy}>
              <Text style={styles.statsTitle}>
                {stats.dailyScans}/4 scans done!
              </Text>
              <Text style={styles.statsSubtitle}>
                <Text style={styles.streakText}>3/7 day ongoing{'\n'}streak!</Text>
                {'\n'}
                <Text style={styles.keepGoingText}>Keep Going!</Text>
              </Text>
            </View>
            <View style={styles.progressColumn}>
              <View
                style={[
                  styles.progressRing,
                  stats.dailyScans >= 2 && styles.progressRingHalf,
                  stats.dailyScans >= 3 && styles.progressRingThreeQuarter,
                  stats.dailyScans >= 4 && styles.progressRingComplete,
                ]}>
                <Text style={styles.progressText}>
                  {Math.round((stats.dailyScans / 4) * 100)}%
                </Text>
              </View>
              <Text style={styles.flame}>🔥</Text>
            </View>
          </View>

        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
            <Text style={[styles.navIcon, styles.navActive]}>⌾</Text>
            <Text style={[styles.navLabel, styles.navActive]}>Scan</Text>
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
            <Text style={styles.navIcon}>♙</Text>
            <Text style={styles.navLabel}>Impact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#f5f7f4',
    flex: 1,
    justifyContent: 'flex-start',
  },
  phoneShell: {
    backgroundColor: '#f5f7f4',
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    gap: 16,
    paddingBottom: 30,
  },
  brandMark: {
    alignItems: 'center',
    height: 92,
    justifyContent: 'center',
    paddingTop: 28,
  },
  brandMarkImage: {
    height: 28,
    width: 28,
  },
  scanCard: {
    alignSelf: 'stretch',
    backgroundColor: '#e5e9e3',
    borderRadius: 30,
    marginHorizontal: 12,
    gap: 16,
    paddingHorizontal: 18,
    paddingBottom: 24,
    paddingTop: 20,
  },
  statsCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#e0e1df',
    borderColor: '#16A34A',
    borderRadius: 30,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  statsCopy: {
    flex: 1,
  },
  statsTitle: {
    color: '#359d55',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
  },
  statsSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
  },
  streakText: {
    color: '#18ad3a',
    fontWeight: '800',
  },
  keepGoingText: {
    color: '#123d24',
    fontWeight: '700',
  },
  progressColumn: {
    alignItems: 'center',
    marginLeft: 12,
  },
  progressRing: {
    alignItems: 'center',
    borderColor: '#d8dcd9',
    borderRadius: 38,
    borderTopColor: '#359d55',
    borderWidth: 5,
    height: 76,
    justifyContent: 'center',
    transform: [{ rotate: '25deg' }],
    width: 76,
  },
  progressRingHalf: {
    borderRightColor: '#359d55',
  },
  progressRingThreeQuarter: {
    borderBottomColor: '#359d55',
  },
  progressRingComplete: {
    borderLeftColor: '#359d55',
  },
  progressText: {
    color: '#359d55',
    fontSize: 18,
    fontWeight: '800',
    transform: [{ rotate: '-25deg' }],
  },
  flame: {
    fontSize: 30,
    marginTop: 5,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: '#c9e2c8',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cameraIcon: {
    height: 25,
    width: 25,
  },
  title: {
    color: '#101311',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  titleUpload: {
    fontStyle: 'italic',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d8e2d7',
    borderRadius: 22,
    borderWidth: 1,
    height: 280,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 14,
    width: '100%',
  },
  previewImage: {
    borderRadius: 16,
    height: 170,
    width: '100%',
  },
  helperText: {
    color: '#667069',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#e7ebe7',
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  uploadText: {
    color: '#18221a',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 5,
  },
  classifyButton: {
    alignItems: 'center',
    backgroundColor: '#18ad3a',
    borderRadius: 24,
    elevation: 5,
    justifyContent: 'center',
    marginTop: 0,
    paddingVertical: 18,
    shadowColor: '#16882f',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  classifyButtonLoading: {
    opacity: 0.75,
  },
  classifyText: {
    color: '#fff',
    fontSize: 20,
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
