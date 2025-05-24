import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  TextInput,
  Button,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TripsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [refundedTotal, setRefundedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/trips`)
      .then(r => r.json())
      .then(json => {
        setTrips(json);
         fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/refunded-total`)
          .then(r => r.json())
          .then(data => {
            if (data?.refunded_credit !== undefined) {
              setRefundedTotal(data.refunded_credit.toFixed(2));
            }
          })
          .catch(err => {
            console.error(err);
            Alert.alert('Error', 'Could not load refunded total');
          });
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'Could not load trips');
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

const handleStartTrip = async () => {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  try {
    const res = await fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/start-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_position: startPoint,
        end_position: endPoint,
        trip_id: 1,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert("Success", "Trip added");
      setModalVisible(false);
      setStartPoint('');
      setEndPoint('');

      // 🔁 Trip listesini yeniden al
      const tripRes = await fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/trips`);
      const tripData = await tripRes.json();
      setTrips(tripData);

      // 🔁 Refund bilgisini de yeniden al
      const refundRes = await fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}/refunded-total`);
      const refundData = await refundRes.json();
      setRefundedTotal(refundData.refunded_credit.toFixed(2));

      setLoading(false);
    } else {
      Alert.alert("Error", data.error || "Could not add trip");
      setLoading(false);
    }
  } catch (e) {
    Alert.alert("Error", "Network issue");
    console.error(e);
    setLoading(false);
  }
};


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
      <Text style={styles.refundText}>
        Total Refunded Credit: {refundedTotal} ₺
      </Text>

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
            <View style={styles.amountRow}>
              <Text style={styles.label}>Refund: </Text>
              <Text style={styles.amount}>{item.refunded_credit.toFixed(2)} ₺</Text>
              <Text style={styles.label}>   Cost: </Text>
              <Text style={styles.amount}>{item.cost.toFixed(2)} ₺</Text>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={48} color="#1E90FF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start a New Trip</Text>
            <TextInput
              placeholder="Start Point"
              value={startPoint}
              onChangeText={setStartPoint}
              style={styles.input}
            />
            <TextInput
              placeholder="End Point"
              value={endPoint}
              onChangeText={setEndPoint}
              style={styles.input}
            />
            <Button title="Submit" onPress={handleStartTrip} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center:    { flex:1, justifyContent:'center', alignItems:'center' },
  container: { flex:1, padding:24, marginTop:50, backgroundColor:'#fff' },
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
  refundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E90FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E90FF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    zIndex: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
