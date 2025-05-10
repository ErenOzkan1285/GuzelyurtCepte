// /app/map.js
import * as Location from 'expo-location';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import busStopIcon from '../assets/images/bus-stop.png';
import busIcon     from '../assets/images/bus-icon.png';
import { getRouteFromORS } from '../utils/getRoute';
import { BusContext }      from '../utils/busContext';

const API_KEY = '5b3ce3597851110001cf62484db6165f3f2349668bb2fb831c3ec50a';

// ★ your hidden mid-points
const viaPoints = [
  { latitude: 35.246692, longitude: 33.037149 },
  { latitude: 35.246333, longitude: 33.036731 },
];

export default function MapScreen() {
  const { busPosition, setBusPosition } = useContext(BusContext);

  // 1️⃣ stops from your API
  const [stops, setStops]           = useState([]);
  // 2️⃣ user’s GPS
  const [location, setLocation]     = useState(null);
  // 3️⃣ ORS output
  const [routeCoords, setRouteCoords] = useState([]);
  // 4️⃣ view region
  const [region, setRegion]         = useState(null);
  // 5️⃣ for simulating the bus over time
  const [busIndex, setBusIndex]     = useState(0);

  const moveInterval = 2000;

  // Fetch stops once
  useEffect(() => {
    fetch('http://10.0.2.2:5000/api/stops/')
      .then(res => res.json())
      .then(data => setStops(data))
      .catch(err => console.error('Error fetching stops:', err));
  }, []);

  // Ask for location once
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Build your exact waypoint array only after stops load
  const routeWaypoints = useMemo(() => {
    if (stops.length < 2) return [];
    return [
      stops[0],
      ...viaPoints,
      ...stops.slice(1)
    ];
  }, [stops]);

  // Fetch ORS route, but only once we have both location & >=2 waypoints
  useEffect(() => {
    if (!location) {
      console.log('⏳ waiting for user location...');
      return;
    }
    if (routeWaypoints.length < 2) {
      console.log('⏳ waiting for stops to load...');
      return;
    }

    (async () => {
      console.log('▶️ Sending to ORS:', routeWaypoints);
      try {
        const route = await getRouteFromORS(routeWaypoints, API_KEY);
        console.log('✅ Received', route.length, 'points from ORS');
        setRouteCoords(route);
        // place bus at the very first point
        setBusPosition(route[0]);
      } catch (e) {
        console.error('ORS routing error:', e);
      }
    })();
  }, [location, routeWaypoints, setBusPosition]);

  // Compute a region that fits the route
  useEffect(() => {
    if (!routeCoords.length) return;
    const lats = routeCoords.map(p => p.latitude);
    const lons = routeCoords.map(p => p.longitude);
    const minLat = Math.min(...lats),
          maxLat = Math.max(...lats),
          minLon = Math.min(...lons),
          maxLon = Math.max(...lons);

    setRegion({
      latitude:      (minLat + maxLat) / 2,
      longitude:     (minLon + maxLon) / 2,
      latitudeDelta:  (maxLat - minLat) * 1.2 || 0.01,
      longitudeDelta: (maxLon - minLon) * 1.2 || 0.01,
    });
  }, [routeCoords]);

  // Simulate the bus moving along the returned polyline
  useEffect(() => {
    if (!routeCoords.length) return;
    const id = setInterval(() => {
      setBusIndex(idx => {
        const next = (idx + 1) % routeCoords.length;
        setBusPosition(routeCoords[next]);
        return next;
      });
    }, moveInterval);
    return () => clearInterval(id);
  }, [routeCoords, setBusPosition]);

  // Loading state
  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render
  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation>
        <Polyline
          coordinates={routeCoords}
          strokeColor="#D22B2B"
          strokeWidth={6}
        />

        {stops.map((stop, i) => (
          <Marker
            key={`stop-${i}`}
            coordinate={{
              latitude:  stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.name}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Image
              source={busStopIcon}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {busPosition && (
          <Marker
            coordinate={busPosition}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={busIcon}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
});
