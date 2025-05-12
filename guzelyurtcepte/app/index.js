// /app/index.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BusContext } from '../utils/busContext';

const API_KEY = '5b3ce3597851110001cf62484db6165f3f2349668bb2fb831c3ec50a';
// Change this to the trip you want to load:
const TRIP_ID = 1;

/**
 * Calls ORS for a two-point driving route and returns travel time in seconds.
 */
async function getETAFromORS(start, end, apiKey, profile = 'driving-car') {
  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
  const body = {
    coordinates: [
      [start.longitude, start.latitude],
      [end.longitude,   end.latitude],
    ],
    instructions: false,
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });
  if (res.status === 403) {
    throw new Error('ORS 403: Invalid or unauthorized API key');
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ORS ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const props = data.features?.[0]?.properties;
  const duration = props?.summary?.duration ?? props?.segments?.[0]?.duration;
  if (typeof duration !== 'number') {
    throw new Error('Could not parse duration from ORS response');
  }
  return duration;
}

export default function TripDetailsPage() {
  const { busPosition } = useContext(BusContext);

  // trip metadata + stops
  const [trip, setTrip]     = useState(null);
  const [stops, setStops]   = useState([]);
  const [loading, setLoading] = useState(true);

  // search + ETA
  const [query, setQuery]   = useState('');
  const [etaText, setEtaText] = useState('');

  // 1️⃣ Fetch trip (and its stops) once
  useEffect(() => {
    fetch(`http://10.0.2.2:5000/api/trips/${TRIP_ID}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTrip(data);
        // `data.stops` is an array of { name, order, longitude, latitude }
        // sort by `order` to ensure correct sequence
        const ordered = data.stops
          .slice()
          .sort((a, b) => a.order - b.order);
        setStops(ordered);
      })
      .catch(err => {
        console.error('Error fetching trip:', err);
        Alert.alert('Error', 'Could not load trip details from server.');
      })
      .finally(() => setLoading(false));
  }, []);

  // filter stops as the user types
  const filtered = stops.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  // when user taps a stop
  const onSelectStop = async (stop) => {
    if (!busPosition) {
      return Alert.alert(
        'Bus position unknown',
        'Please open the Map tab first so we can get the simulated bus location.'
      );
    }
    try {
      const durationSec = await getETAFromORS(
        busPosition,
        { latitude: stop.latitude, longitude: stop.longitude },
        API_KEY,
        'driving-car'
      );
      const mins = Math.floor(durationSec / 60);
      const secs = Math.round(durationSec % 60);
      setEtaText(`ETA to ${stop.name}: ${mins}m ${secs}s`);
    } catch (e) {
      Alert.alert('Error calculating ETA', e.message);
    }
  };

  // show a loader until trip & stops loaded
  if (loading || !trip) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // render
  return (
    <View style={styles.container}>
      {/* Trip header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip #{trip.trip_id}</Text>
        <Text>Bus: {trip.bus_license_plate} ({trip.bus_model})</Text>
        <Text>Driver: {trip.driver.name || trip.driver.email}</Text>
        <Text>Capacity: {trip.current_capacity}</Text>
      </View>

      {/* Search input */}
      <TextInput
        style={styles.input}
        placeholder="Search for a stop…"
        value={query}
        onChangeText={text => {
          setQuery(text);
          setEtaText('');
        }}
      />

      {/* Stops list */}
      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => item.order?.toString() ?? idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelectStop(item)}
          >
            <Text style={styles.itemText}>
              {item.order}. {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No stops found.</Text>
        )}
      />

      {/* ETA + trip details overlay */}
      {etaText !== '' && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{etaText}</Text>
          <Text style={styles.overlaySub}>Capacity: {trip.current_capacity}</Text>
          <Text style={styles.overlaySub}>Bus: {trip.bus_license_plate}</Text>
          <Text style={styles.overlaySub}>
            Driver: {trip.driver.name || trip.driver.email}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header:    { padding: 16, backgroundColor: '#1E90FF' },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  input:     {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  item:      {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemText:  { fontSize: 16 },
  empty:     { textAlign: 'center', marginTop: 20, color: '#888' },
  overlay:   {
    position: 'absolute',
    bottom:   20,
    left:     20,
    right:    20,
    padding:      16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
  },
  overlayText: { color: '#fff', fontSize: 18, marginBottom: 8 },
  overlaySub:  { color: '#ddd', fontSize: 14 },
});
