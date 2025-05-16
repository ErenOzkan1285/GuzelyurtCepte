// /app/profile.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

// 1️⃣ Define your mock user object:
const mockUser = {
  name: 'Barış Turan',
  email: 'baris@example.com',
  balance: 27.50
};

// 2️⃣ “Fetch” it with a little artificial delay
async function fetchUserProfile() {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockUser), 500);
  });
}

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  // Load mock profile on mount
  useEffect(() => {
    fetchUserProfile().then(setUser);
  }, []);

  // Show spinner while loading
  if (!user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Handler to “add $10” to balance
  const onAddBalance = () => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + 10
    }));
  };

  return (
    <View style={styles.container}>
      {/* Avatar at top center */}
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/images/user.png')}
          style={styles.avatar}
        />
      </View>

      {/* Profile fields */}
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user.name}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user.email}</Text>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceTextWrap}>
          <Text style={styles.label}>Balance</Text>
          <Text style={[styles.value, styles.balance]}>
            ${user.balance.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddBalance}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 50, // center contents horizontally
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#ccc',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  value: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: '500',
  },
  balance: {
    color:    '#1E90FF',
    marginTop: 4,
  },

  addButton: {
    marginLeft:     12,         // space between text and button
    backgroundColor:'#1E90FF',
    padding:        12,
    borderRadius:   100,         // circular
  },
  addButtonText: {
    color:     '#fff',
    fontSize:  16,
    fontWeight:'600',
  },
  balanceContainer: {
    flexDirection:  'row',      // lay children out horizontally
    alignItems:     'center',   // vertical center
    marginTop:      12,         // space above
  },

  balanceTextWrap: {
    flex:           1,          // take up remaining space
  },
});
