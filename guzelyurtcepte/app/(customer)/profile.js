// /app/profile.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user }     = useAuth();        // { email, ... }
  const router       = useRouter();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  // Modal state for "Add Balance"
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount]             = useState('');

  // 1️⃣ Fetch profile on mount
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    // on Android emulator use 10.0.2.2, on iOS localhost
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

    fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(json => {
        // ensure balance is numeric
        json.balance = Number(json.balance);
        setProfile(json);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'Could not load profile');
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  // 2️⃣ Confirm adding balance
  const confirmAdd = async () => {
    const delta = parseFloat(amount);
    if (isNaN(delta)) {
      Alert.alert('Invalid', 'Please enter a number.');
      return;
    }
    const newBalance = profile.balance + delta;
    try {
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      const res = await fetch(
        `http://${host}:5000/api/customers/${profile.email}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBalance }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { balance } = await res.json();
          setProfile(prev => ({
           ...prev,
           balance: Number(balance),
          }));
      setAmount('');
      setModalVisible(false);
      Alert.alert('Success', `Balance is now $${balance.toFixed(2)}`);    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Couldn’t load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={require('../../assets/images/user.png')}
        style={styles.avatar}
      />

      {/* 1) Name & Surname on one line */}
      <Text style={styles.nameLine}>
        {profile.name} {profile.sname}
      </Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{profile.email}</Text>

      {/* Balance */}
      <Text style={styles.label}>Balance</Text>
      <Text style={[styles.value, styles.balance]}>
        {'$' + profile.balance.toFixed(2)}
      </Text>

      {/* 2) Add Balance button */}
      <TouchableOpacity
        style={styles.addBalanceBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addBalanceText}>Add Balance</Text>
      </TouchableOpacity>

      {/* Modal for entering amount */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 10.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={confirmAdd}
              >
                <Text style={{ color: 'white' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3) View Past Trips button */}
      <TouchableOpacity
        style={styles.viewTripsBtn}
        onPress={() => router.push('/trips')}
      >
        <Text style={styles.viewTripsText}>View Past Trips</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24, marginTop: 50, backgroundColor: '#fff', alignItems: 'center' },

  avatar: {
    width: 200, height: 200, borderRadius: 100,
    marginBottom: 16, borderWidth: 6, borderColor: '#ccc'
  },

  nameLine: { fontSize: 20, fontWeight: '600', marginBottom: 12 },

  label:   { alignSelf: 'flex-start', fontSize: 14, color: '#666', marginTop: 12 },
  value:   { alignSelf: 'flex-start', fontSize: 18, fontWeight: '500', marginTop: 4 },
  balance: { color: '#1E90FF' },

  addBalanceBtn:    { marginTop: 20, backgroundColor: '#1E90FF', padding: 12, borderRadius: 8 },
  addBalanceText:   { color: '#fff', fontWeight: '600' },

  viewTripsBtn:     { marginTop: 16, borderColor: '#1E90FF', borderWidth: 1, padding: 10, borderRadius: 8 },
  viewTripsText:    { color: '#1E90FF', fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex:1, justifyContent:'center', alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width:'80%', backgroundColor:'#fff', borderRadius:8, padding:16
  },
  modalTitle: { fontSize:18, fontWeight:'600', marginBottom:12 },
  modalInput: {
    borderWidth:1, borderColor:'#ccc', borderRadius:4,
    padding:8, marginBottom:16, fontSize:16
  },
  modalButtons: { flexDirection:'row', justifyContent:'flex-end' },
  modalBtn:     { padding:8, marginLeft:12 },
  modalConfirm: { backgroundColor:'#1E90FF', borderRadius:4, paddingHorizontal:12 },

  error: { color:'red', marginTop:20 },
});
