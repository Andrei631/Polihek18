import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  CircleLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import firestore from '@react-native-firebase/firestore';
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  
  // Ref for initialization logic
  const hasCentered = useRef(false);
  const cameraRef = useRef<Camera>(null);
  
  // Animation for Compass
  const mapHeading = useRef(new Animated.Value(0)).current;

  // 1. Get User Location & Heading Permissions
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        
        // Watch position for live updates
        await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
            (loc) => {
                setUserLocation([loc.coords.longitude, loc.coords.latitude]);
            }
        );
      } catch (e) { console.log("Location Error:", e); }
    })();
  }, []);

  // 2. Initial Center Logic (Ref-based, runs once)
  useEffect(() => {
    if (userLocation && !hasCentered.current && cameraRef.current) {
        cameraRef.current.setCamera({
            centerCoordinate: userLocation,
            zoomLevel: 14, 
            animationDuration: 1500,
        });
        hasCentered.current = true;
    }
  }, [userLocation]);

  // 3. Sync Hazards
  useEffect(() => {
    const fetchUpdates = async () => {
        try {
            const snapshot = await firestore().collection('active_disasters').get();
            if (snapshot.empty) return;
            const newHazards: Record<string, any> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const lat = data.latitude || data.lat; 
                const lng = data.longitude || data.lon || data.lng;
                if (!lat || !lng) return;
                newHazards[doc.id] = {
                    type: 'Feature',
                    id: doc.id, 
                    properties: { severity: data.severity || 'high', type: data.type || 'Hazard' },
                    geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
                };
            });
            setHazardGeoJSON({ type: 'FeatureCollection', features: Object.values(newHazards) });
        } catch (err) { console.error(err); }
    };
    fetchUpdates();
    const intervalId = setInterval(fetchUpdates, 10 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleCenterOnUser = () => {
    if (userLocation && cameraRef.current) {
        cameraRef.current.setCamera({
            centerCoordinate: userLocation,
            zoomLevel: 14, 
            animationDuration: 1000,
            heading: 0, 
            pitch: 0,
        });
    }
  };

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
          
          onPress={() => setSelectedFeature(null)}
          onRegionIsChanging={(e) => {
             if (e.properties && typeof e.properties.heading === 'number') {
                 mapHeading.setValue(e.properties.heading);
             }
             if (selectedFeature) setSelectedFeature(null);
          }}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={CAMERA_DEFAULTS}
          />

          {/* HAZARDS */}
          <ShapeSource 
            id="hazardSource" 
            shape={hazardGeoJSON}
            hitbox={{ width: 40, height: 40 }}
            onPress={(e) => e.features[0] && setSelectedFeature(e.features[0])}
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
             - 'androidRenderMode="compass"' forces the arrow style on Android.
          */}
          <UserLocation 
            visible={true} 
            animated={true} 
            androidRenderMode="compass" 
            showsUserHeadingIndicator={true} 
          />

          {/* FIX 3: STABLE POPUP 
             We render the PointAnnotation ALWAYS, but toggle opacity/z-index.
             This prevents the MapView from unmounting children and resetting the camera.
          */}
          <PointAnnotation
                id="selected-popup"
                // If nothing selected, move it to [0,0] to hide it safely
                coordinate={selectedFeature ? selectedFeature.geometry.coordinates : [0, 0]}
                anchor={{ x: 0.5, y: 1 }}
                selected={true}
            >
                <View 
                    style={[
                        styles.calloutWrapper, 
                        // If no feature, make invisible
                        { opacity: selectedFeature ? 1 : 0 }
                    ]}
                >
                    {selectedFeature && (
                        <View style={styles.bubble}>
                            <Text style={styles.bubbleTitle}>
                                {selectedFeature.properties.type?.toUpperCase() || "HAZARD"}
                            </Text>
                            <Text style={styles.bubbleSeverity}>
                                SEVERITY: {selectedFeature.properties.severity?.toUpperCase() || "UNKNOWN"}
                            </Text>
                        </View>
                    )}
                    <View style={styles.arrow} />
                </View>
            </PointAnnotation>

        </MapView>
      </View>

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

  calloutWrapper: { 
    alignItems: 'center', width: 160, marginBottom: 5, 
    zIndex: 2000, elevation: 50 
  },
  bubble: {
    backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#000', 
    width: '100%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5
  },
  bubbleTitle: { fontWeight: '900', fontSize: 13, color: '#D32F2F', textAlign: 'center', marginBottom: 4 },
  bubbleSeverity: { fontSize: 10, color: '#555', textAlign: 'center', fontWeight: 'bold' },
  arrow: {
    backgroundColor: '#fff', width: 14, height: 14,
    borderBottomColor: '#000', borderBottomWidth: 1,
    borderRightColor: '#000', borderRightWidth: 1,
    transform: [{ rotate: '45deg' }], marginTop: -7, zIndex: -1, 
  },

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