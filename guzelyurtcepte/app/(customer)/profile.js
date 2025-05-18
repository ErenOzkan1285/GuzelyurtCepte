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
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user } = useAuth();        // { email, ... }
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state for "Add Balance"
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

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
      Alert.alert('Success', `Balance is now $${balance.toFixed(2)}`);
    } catch (e) {
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

      <View style={styles.balancePill}>
        <Text style={styles.balancePillText}>
          CURRENT CREDIT:{' '}
          <Text style={styles.balancePillAmount}>
            {profile.balance.toFixed(2)}
          </Text>
        </Text>
        <TouchableOpacity
          style={styles.balancePillButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.balancePillButtonIcon}>+</Text>
        </TouchableOpacity>
      </View>

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
        style={[styles.menuItem, styles.primaryItem]}
        onPress={() => router.push('/trips')}
      >
        <Ionicons
          name="bus"
          size={24}
          color="#fff"
          style={styles.menuItemIcon}
        />
        <Text style={[styles.menuItemText, styles.primaryMenuItemText]}>View Past Trips</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/edit')}
      >
        <Ionicons
          name="create"
          size={24}
          color="#333"
          style={styles.menuItemIcon}
        />
        <Text style={styles.menuItemText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
      >
        <Ionicons
          name="language"
          size={24}
          color="#333"
          style={styles.menuItemIcon}
        />
        <Text style={styles.menuItemText}>Language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
      >
        <Ionicons
          name="moon"
          size={24}
          color="#333"
          style={styles.menuItemIcon}
        />
        <Text style={styles.menuItemText}>Dark Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/feedback')}
      >
        <Ionicons
          name="help-circle-outline"
          size={24}
          color="#333"
          style={styles.menuItemIcon}
        />
        <Text style={styles.menuItemText}>Give Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    padding: 24,
    marginTop: 50,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 6,
    borderColor: '#ccc'
  },
  nameLine: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#666',
    marginTop: 12
  },
  value: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#1E90FF',
    marginTop: 16,
  },
  balancePillText: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  balancePillAmount: {
    color: '#1E90FF',
  },
  balancePillButton: {
    marginLeft: 16,
    width: 65,
    height: 65,
    borderRadius: 60,
    marginRight: -2,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balancePillButtonIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    padding: 8, marginBottom: 16, fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalBtn: {
    padding: 8,
    marginLeft: 12
  },
  modalConfirm: {
    backgroundColor: '#1E90FF',
    borderRadius: 4,
    paddingHorizontal: 12
  },
  error: {
    color: 'red',
    marginTop: 20
  },
  menuItem: {
    flexDirection: 'row',        // lay out icon + text in a row
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    // optional shadow/elevation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemIcon: {
    marginRight: 12,                // space between icon & text
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  primaryItem: {
    backgroundColor: '#1E90FF',
    borderColor:     '#1E90FF',
    marginTop: 50,
  },
  primaryMenuItemText: {
    color: '#fff'
  }
});
