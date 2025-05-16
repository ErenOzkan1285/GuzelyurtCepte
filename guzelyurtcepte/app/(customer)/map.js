// /app/map.js
import * as Location from 'expo-location';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import busStopIcon from '../../assets/images/bus-stop.png';
import busIcon     from '../../assets/images/bus-icon.png';
import { getRouteFromORS } from '../../utils/getRoute';
import { BusContext }      from '../../utils/busContext';

const API_KEY = '5b3ce3597851110001cf62484db6165f3f2349668bb2fb831c3ec50a';
const TRIP_ID = 1;

const viaPoints = [
  { latitude: 35.246692, longitude: 33.037149 },
  { latitude: 35.246333, longitude: 33.036731 },
];

export default function MapScreen() {
  const { busPosition, setBusPosition } = useContext(BusContext);

  const [stops,       setStops]       = useState([]);
  const [location,    setLocation]    = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [region,      setRegion]      = useState(null);
  const [busIndex,    setBusIndex]    = useState(0);

  // 1) Load stops for this trip
  useEffect(() => {
    fetch(`http://10.0.2.2:5000/api/stops/trip/${TRIP_ID}`)
      .then(r => r.json())
      .then(setStops)
      .catch(console.error);
  }, []);

  // 2) Ask for user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // 3) Build ordered waypoints
  const routeWaypoints = useMemo(() => {
    if (stops.length < 2) return [];
    return [
      { latitude: stops[0].latitude, longitude: stops[0].longitude },
      ...viaPoints,
      ...stops.slice(1).map(s => ({
        latitude:  s.latitude,
        longitude: s.longitude
      }))
    ];
  }, [stops]);

  // 4) Fetch ORS once we have location + waypoints
  useEffect(() => {
    if (!location || routeWaypoints.length < 2) return;

    (async () => {
      try {
        const route = await getRouteFromORS(routeWaypoints, API_KEY);
        setRouteCoords(route);
      } catch (e) {
        console.error('ORS routing error:', e);
      }
    })();
  }, [location, routeWaypoints]);

  // 5) Once ORS gives us coords, compute map region
  useEffect(() => {
    if (!routeCoords.length) return;
    const lats = routeCoords.map(p => p.latitude);
    const lons = routeCoords.map(p => p.longitude);
    const minLat = Math.min(...lats),
          maxLat = Math.max(...lats),
          minLon = Math.min(...lons),
          maxLon = Math.max(...lons);

    setRegion({
      latitude:      (minLat + maxLat)/2,
      longitude:     (minLon + maxLon)/2,
      latitudeDelta:  (maxLat - minLat)*1.2 || 0.01,
      longitudeDelta: (maxLon - minLon)*1.2 || 0.01,
    });
  }, [routeCoords]);

  // 6) Initialize the bus at the start of the route (NEW effect)
  useEffect(() => {
    if (routeCoords.length > 0) {
      setBusPosition(routeCoords[0]);
      setBusIndex(0);
    }
  }, [routeCoords, setBusPosition]);

  // 7) Simulate the bus moving
  useEffect(() => {
    if (!routeCoords.length) return;
    const id = setInterval(() => {
      setBusIndex(i => {
        const next = (i + 1) % routeCoords.length;
        setBusPosition(routeCoords[next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [routeCoords, setBusPosition]);

  // 8) Loading—and then render
  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation>
        <Polyline
          coordinates={routeCoords}
          strokeColor="#D22B2B"
          strokeWidth={6}
        />
        {stops.map((s,i) => (
          <Marker
            key={i}
            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
            title={`${s.order}. ${s.name}`}
            anchor={{ x:0.5,y:1 }}
          >
            <Image source={busStopIcon} style={{width:40,height:40}}/>
          </Marker>
        ))}
        {busPosition && (
          <Marker coordinate={busPosition} anchor={{x:0.5,y:0.5}}>
            <Image source={busIcon} style={{width:30,height:30}}/>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, marginTop: 50},
  map:      {flex:1},
}); 
