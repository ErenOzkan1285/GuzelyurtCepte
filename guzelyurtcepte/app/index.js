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

export default function BusSearchPage() {
  const { busPosition } = useContext(BusContext);
  const [stops, setStops]     = useState([]);
  const [query, setQuery]     = useState('');
  const [etaText, setEtaText] = useState('');
  const [loading, setLoading] = useState(true);

  // 1) Fetch stops
  useEffect(() => {
    fetch('http://10.0.2.2:5000/api/stops/')
      .then(res => res.json())
      .then(data => setStops(data))
      .catch(err => {
        console.error('Error fetching stops:', err);
        Alert.alert('Error', 'Could not load stops from server.');
      })
      .finally(() => setLoading(false));
  }, []);

  // filter as user types
  const filtered = stops.filter(stop =>
    stop.name.toLowerCase().includes(query.toLowerCase())
  );

  // on tap, compute ETA
  const onSelectStop = async (stop) => {
    if (!busPosition) {
      return Alert.alert(
        'Bus position unknown',
        'Please open the Map tab first to get the bus location.'
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a stop…"
        value={query}
        onChangeText={text => {
          setQuery(text);
          setEtaText('');
        }}
      />

      <FlatList
        data={filtered}
        // safe key: prefer item.id, otherwise index
        keyExtractor={(item, index) =>
          item.id != null ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelectStop(item)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No stops found.</Text>
        )}
      />

      {etaText !== '' && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>{etaText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 16 },
  empty:    { textAlign: 'center', marginTop: 20, color: '#888' },
  etaContainer: {
    padding:        12,
    backgroundColor:'#1E90FF',
    borderRadius:   8,
    marginTop:      12,
  },
  etaText: {
    color:      '#fff',
    fontSize:   16,
    fontWeight: '600',
  },
});
