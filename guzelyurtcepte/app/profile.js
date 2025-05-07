// /app/profile.js
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// replace with your real API call
async function fetchUserProfile() {
  // simulate network delay
  await new Promise(res => setTimeout(res, 500));
  return {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    balance: 23.75,
  };
}

export default function ProfileScreen() {


  useEffect(() => {
    fetchUserProfile().then(setUser);
  }, []);

  if (!user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user.name}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user.email}</Text>

      <Text style={styles.label}>Balance</Text>
      <Text style={[styles.value, styles.balance]}>${user.balance.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#666', marginTop: 12 },
  value: { fontSize: 18, fontWeight: '500' },
  balance: { color: '#1E90FF', marginTop: 4 },
});
