// /app/(customer)/trips/index.js
import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TripsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/trips`)
      .then(r => r.json())
      .then(json => setTrips(json))
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'Could not load trips');
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="arrow-back" size={24} color="#1E90FF" />
        <Text style={styles.backText}>Back to Profile</Text>
      </TouchableOpacity>
      <FlatList
        data={trips}
        keyExtractor={item => item.trip_id.toString()}
        ListEmptyComponent={() => <Text style={styles.empty}>You have no past trips.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.date}>{item.date_time}</Text>
              <Text style={styles.route}>
                {item.start_position} → {item.end_position}
              </Text>
            </View>
            <Text style={styles.cost}>${item.cost.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center:    { flex:1, justifyContent:'center', alignItems:'center' },
  container: { flex:1, padding:24,marginTop: 50, backgroundColor:'#fff' },
  header:    { fontSize:20, fontWeight:'600', marginBottom:12 },
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical:12,
    borderBottomWidth:1,
    borderBottomColor:'#eee',
  },
  info:   { flex:1 },
  date:   { fontSize:14, color:'#333' },
  route:  { fontSize:16, fontWeight:'500', marginTop:4 },
  cost:   { fontSize:16, fontWeight:'600', color:'#1E90FF' },
  empty:  { textAlign:'center', color:'#888', marginTop:20 },
  backButton: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  16,
  },
  backText: {
    marginLeft:   8,
    color:        '#1E90FF',
    fontSize:     16,
  },
});
