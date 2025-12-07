import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import firestore from '@react-native-firebase/firestore';
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

// FIX 1: Stable Camera Defaults (Prevents resets)
const CAMERA_DEFAULTS = {
    centerCoordinate: [0, 0],
    zoomLevel: 1,
};

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isPremium = params.isPremium === "true";
  const downloadedRadius = params.downloadedRadius;

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [hazardGeoJSON, setHazardGeoJSON] = useState<any>({ type: 'FeatureCollection', features: [] });
  const [headingMode, setHeadingMode] = useState(false); // Track if compass heading is active
  
  // Ref for initialization logic
  const hasCentered = useRef(false);
  const cameraRef = useRef<any>(null);
  
  // Animation for Compass
  const mapHeading = useRef(new Animated.Value(0)).current;
  const mapHeadingVal = useRef(0); // Cumulative heading value
  const smoothedHeading = useRef(0); // Exponential smoothing buffer
  const SMOOTHING_FACTOR = 0.3; // Lower = more smoothing (0-1)

  const updateCompass = useCallback((heading: number) => {
      // Normalize to 0-360
      const normalized = ((heading % 360) + 360) % 360;
      
      // Apply exponential smoothing to reduce jitter
      let diff = normalized - smoothedHeading.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      smoothedHeading.current += diff * SMOOTHING_FACTOR;
      
      // Calculate shortest rotation for cumulative heading
      const current = mapHeadingVal.current;
      const currentMod = ((current % 360) + 360) % 360;
      const smoothedNorm = ((smoothedHeading.current % 360) + 360) % 360;
      
      let cumulativeDiff = smoothedNorm - currentMod;
      if (cumulativeDiff > 180) cumulativeDiff -= 360;
      if (cumulativeDiff < -180) cumulativeDiff += 360;
      
      mapHeadingVal.current += cumulativeDiff;
      
      Animated.timing(mapHeading, {
        toValue: mapHeadingVal.current,
        duration: 150, // Slightly longer for smooth animation
        useNativeDriver: true,
      }).start();
  }, []);

  // 1. Watch Heading for smooth compass updates
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startWatching = async () => {
      if (headingMode) {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
            subscription = await Location.watchHeadingAsync((obj) => {
                const heading = obj.trueHeading ?? obj.magHeading;
                updateCompass(heading);
            });
        }
      }
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [headingMode]);

  // 2. Watch user location
  // 2a. Watch user location (Data Only - No Camera Movement)
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startWatching = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        
        subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
            (loc) => {
                // Just update the state. Do NOT move the camera here.
                setUserLocation([loc.coords.longitude, loc.coords.latitude]);
            }
        );
      } catch (e) { 
        console.log("Location Error:", e); 
      }
    };

    startWatching();
    return () => { subscription?.remove(); };
  }, []);

  // 2b. Auto-Center ONE TIME (Triggered by state change)
  useEffect(() => {
    // Only run if we have a location, we haven't centered yet, and the map is ready
    if (userLocation && !hasCentered.current && cameraRef.current) {
        cameraRef.current.setCamera({
            centerCoordinate: userLocation,
            zoomLevel: 14,
            animationDuration: 1500,
        });
        hasCentered.current = true; // Lock it so it never happens again
    }
  }, [userLocation]);

  // 3. Sync Hazards (Offline-First Realtime Listener)
  useEffect(() => {
    // onSnapshot automatically loads from cache first, then syncs with server
    const subscriber = firestore()
      .collection('active_disasters')
      .onSnapshot(
        (snapshot) => {
          if (!snapshot) return;

          const newHazards: Record<string, any> = {};
          
          // Debugging: See if data is coming from offline cache or server
          // console.log("Data source:", snapshot.metadata.fromCache ? "local cache" : "server");

          snapshot.docs.forEach(doc => {
              const data = doc.data();
              // Handle potential field name variations
              const lat = data.latitude || data.lat; 
              const lng = data.longitude || data.lon || data.lng;
              
              if (!lat || !lng) return;

              newHazards[doc.id] = {
                  type: 'Feature',
                  id: doc.id, 
                  properties: { 
                    severity: data.severity || 'high', 
                    type: data.type || 'Hazard',
                    title: data.title || 'Unknown Alert',
                    timestamp: data.timestamp
                  },
                  geometry: { 
                    type: 'Point', 
                    coordinates: [parseFloat(lng), parseFloat(lat)] 
                  }
              };
          });

          setHazardGeoJSON({ 
            type: 'FeatureCollection', 
            features: Object.values(newHazards) 
          });
        },
        (error) => {
          console.warn("Firestore sync error (likely permission or network):", error);
          // If offline, it might throw an error initially, but cache usually handles it.
        }
      );

    // Unsubscribe from updates when the user leaves the map
    return () => subscriber();
  }, []);

  const handleCenterOnUser = () => {
    if (!userLocation || !cameraRef.current) {
      console.warn("Center failed: userLocation =", userLocation, "cameraRef =", cameraRef.current);
      return;
    }

    try {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 14,
        animationDuration: 1000,
        heading: 0,
        pitch: 0,
      });
    } catch (error) {
      console.error("Error centering camera:", error);
    }
  };

  const toggleCompassMode = () => {
    setHeadingMode(prev => !prev);
  };

  const onMapPress = useCallback(() => setSelectedFeature(null), []);

  const onRegionIsChanging = useCallback((e: any) => {
     // Only update from map events if NOT following heading (sensor handles that)
     if (!headingMode) {
         if (e.properties && typeof e.properties.heading === 'number') {
             updateCompass(e.properties.heading);
         }
     }
  }, [headingMode, updateCompass]);

  const onRegionDidChange = useCallback((e: any) => {
     if (!headingMode) {
         if (e.properties && typeof e.properties.heading === 'number') {
             updateCompass(e.properties.heading);
         }
     }
  }, [headingMode, updateCompass]);

  const onUserTrackingModeChange = useCallback((e: any) => {
      // Don't sync state on internal changes to prevent toggle loop
      // The state is controlled by user interactions only
  }, []);

  const onHazardPress = useCallback((e: any) => {
      if (e.features[0]) setSelectedFeature(e.features[0]);
  }, []);

  const compassRotation = mapHeading.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=i2gNH16bxfhHTv62Ijhp`} 
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false} 
          
          onPress={onMapPress}
          onRegionIsChanging={onRegionIsChanging}
          onRegionDidChange={onRegionDidChange}
          onTouchStart={() => {
             // Stop following user if user interacts with map
             // setFollowUserMode(undefined); 
          }}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={CAMERA_DEFAULTS}
            followUserLocation={false}
            onUserTrackingModeChange={onUserTrackingModeChange}
          />

          {/* HAZARDS */}
          <ShapeSource 
            id="hazardSource" 
            shape={hazardGeoJSON}
            hitbox={{ width: 40, height: 40 }}
            onPress={onHazardPress}
          >
            <CircleLayer
              id="hazardCircles"
              style={{
                circleColor: 'rgba(255, 0, 0, 0.4)', 
                circleRadius: ['interpolate', ['exponential', 1.5], ['zoom'], 4, 3, 10, 15, 15, 150],
                circleStrokeWidth: 2,
                circleStrokeColor: '#FF0000',
              }}
            />
          </ShapeSource>

          {/* SAFE PLACES (Offline Friendly) */}
          <CircleLayer
              id="safeSpots"
              sourceID="openmaptiles"
              sourceLayerID="poi"
              style={{
                  circleColor: '#00FF00', 
                  circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 0, 12, 3, 15, 6],
                  circleStrokeWidth: 1,
                  circleStrokeColor: '#004400',
                  circleOpacity: 1,
              }}
              filter={[
                  'any',
                  ['==', ['get', 'class'], 'hospital'],
                  ['==', ['get', 'class'], 'police'],
                  ['==', ['get', 'class'], 'fire_station'],
                  ['==', ['get', 'class'], 'doctors'],
                  ['==', ['get', 'class'], 'pharmacy'],
              ]}
          />

          {/* FIX 2: USER DOT & HEADING 
             - 'showsUserHeadingIndicator' draws the cone/arrow based on phone compass.
          */}
          <UserLocation
            visible={true} 
            animated={true} 
            showsUserHeadingIndicator={true}
            renderMode="native"
            androidRenderMode="compass"
          />

        </MapView>
      </View>

      {/* SELECTED HAZARD CARD */}
      {selectedFeature && (
        <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
                <Ionicons name="warning" size={24} color="#FFF" />
                <Text style={styles.hazardTitle}>
                    {selectedFeature.properties.type?.toUpperCase() || "HAZARD"}
                </Text>
            </View>
            <Text style={styles.hazardSeverity}>
                SEVERITY: {selectedFeature.properties.severity?.toUpperCase() || "UNKNOWN"}
            </Text>
            <Text style={styles.hazardCoordinates}>
                Lat: {selectedFeature.geometry.coordinates[1].toFixed(4)}, 
                Lng: {selectedFeature.geometry.coordinates[0].toFixed(4)}
            </Text>
            <TouchableOpacity 
                style={styles.closeCardButton}
                onPress={() => setSelectedFeature(null)}
            >
                <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
      )}

      {/* COMPASS */}
      <View style={styles.compassContainer}>
        <Animated.View style={[styles.compassDial, { transform: [{ rotate: compassRotation }] }]}>
            {[...Array(28)].map((_, i) => (
                <View key={i} style={[styles.tickLine, { transform: [{ rotate: `${i * (360 / 28)}deg` }] }]} />
            ))}
            <Text style={[styles.compassLabel, styles.labelN]}>N</Text>
            <Text style={[styles.compassLabel, styles.labelE]}>E</Text>
            <Text style={[styles.compassLabel, styles.labelS]}>S</Text>
            <Text style={[styles.compassLabel, styles.labelW]}>W</Text>
            <View style={styles.centerDot} />
        </Animated.View>
        <View style={styles.headingMarker} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sentinel Map</Text>
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleCenterOnUser}>
        <Ionicons name="locate" size={28} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.fab, { bottom: 140 }]} onPress={toggleCompassMode}>
        <Ionicons 
          name={headingMode ? "compass" : "compass-outline"} 
          size={28} 
          color={headingMode ? COLORS.accent : "#FFF"} 
        />
      </TouchableOpacity>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {downloadedRadius ? `Offline Cache: ${downloadedRadius}` : "Online Mode"}
        </Text>
        <Text style={[styles.statusText, { color: isPremium ? COLORS.success : COLORS.textSecondary }]}>
          {isPremium ? "• Hazards Active" : "• Hazards Hidden"}
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapWrapper: { flex: 1 },
  map: { flex: 1 },
  
  header: {
    position: "absolute", top: Platform.OS === "android" ? 40 : 10, left: 20, right: 20,
    zIndex: 10, flexDirection: "row", alignItems: "center",
  },
  backButton: { backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 20 },
  headerTitle: {
    color: "#FFF", fontSize: 18, fontWeight: "bold", marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10,
  },

  fab: {
    position: 'absolute', right: 20, bottom: 80, 
    backgroundColor: '#000', width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', 
    elevation: 5, zIndex: 50, borderWidth: 1, borderColor: '#333'
  },

  statusBar: {
    position: "absolute", bottom: 0, width: "100%",
    backgroundColor: "rgba(24,24,24,0.9)",
    paddingVertical: 12, paddingHorizontal: 20,
    flexDirection: "row", justifyContent: "space-between",
  },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },

  hazardCard: {
    position: 'absolute', bottom: 60, left: 20, right: 20,
    backgroundColor: '#000', padding: 15, borderRadius: 12,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5,
    zIndex: 100, borderWidth: 1, borderColor: '#333'
  },
  hazardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  hazardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginLeft: 8 },
  hazardSeverity: { fontSize: 12, color: '#CCC', fontWeight: 'bold', marginBottom: 2 },
  hazardCoordinates: { fontSize: 10, color: '#AAA' },
  closeCardButton: { position: 'absolute', top: 10, right: 10, padding: 5 },

  compassContainer: {
    position: 'absolute', top: Platform.OS === 'android' ? 60 : 50, right: 20,
    width: 120, height: 120, justifyContent: 'center', alignItems: 'center',
    zIndex: 20, pointerEvents: 'none' 
  },
  compassDial: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', borderWidth: 2, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
  },
  tickLine: {
    position: 'absolute', width: 1, height: '100%', top: 0, left: '50%',
    backgroundColor: 'transparent', borderTopWidth: 6, borderTopColor: 'rgba(255, 255, 255, 0.6)', 
  },
  centerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', zIndex: 5, position: 'absolute' },
  compassLabel: { position: 'absolute', color: '#FFF', fontSize: 14, fontWeight: '900' },
  labelN: { top: 12, color: '#FFF' }, labelE: { right: 14 }, labelS: { bottom: 12 }, labelW: { left: 14 },
  
  headingMarker: {
    position: 'absolute', top: 6, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.accent, 
    zIndex: 25
  },
});