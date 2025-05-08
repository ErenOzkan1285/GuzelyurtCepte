// /app/map.js
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import busStopIcon from '../assets/images/bus-stop.png';
import { getRouteFromORS } from '../utils/getRoute';

const API_KEY = '5b3ce3597851110001cf62484db6165f3f2349668bb2fb831c3ec50a';



// hidden via-points
const viaPoints = [
  { latitude: 35.246692, longitude: 33.037149 },
  { latitude: 35.246333, longitude: 33.036731 },
];


export default function MapScreen() {
  const [stops, setStops] = useState([]);
  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    fetch('http://10.0.2.2:5000/api/stops/')
      .then(response => response.json())
      .then(data => setStops(data))
      .catch(error => console.error('Error fetching stops:', error));
  }, []);

  // combine for ORS
  const routeWaypoints = React.useMemo(() => {
    if (stops.length === 0) return [];
    return [stops[0], ...viaPoints, ...stops.slice(1)];
  }, [stops]);

  // 1) get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // 2) fetch route once we have location
  useEffect(() => {
    if (!location) return;
    (async () => {
      const route = await getRouteFromORS(routeWaypoints, API_KEY);
      setRouteCoords(route);
    })();
  }, [location]);

  // 3) compute map region
  useEffect(() => {
    if (!routeCoords.length) return;
    const lats = routeCoords.map(p => p.latitude);
    const lons = routeCoords.map(p => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    setRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: (maxLat - minLat) * 1.2 || 0.01,
      longitudeDelta: (maxLon - minLon) * 1.2 || 0.01,
    });
  }, [routeCoords]);

  // 4) loading state
  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 5) render the map
  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation>
        <Polyline
          coordinates={routeCoords}
          strokeColor="#D22B2B"
          strokeWidth={6}
          lineCap="round"
          zIndex={1}
        />
        {stops.map((stop, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={10}
          >
            <Image
              source={busStopIcon}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
