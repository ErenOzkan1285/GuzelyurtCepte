// /app/edit-profile.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { user } = useAuth();           // { email }
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName]     = useState('');
  const [sname, setSname]   = useState('');
  const [phone, setPhone]   = useState('');

  // 1️⃣ Fetch current profile
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    fetch(`http://${host}:5000/api/customers/${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(json => {
        json.balance = Number(json.balance);
        setProfile(json);
        setName(json.name);
        setSname(json.sname);
        setPhone(json.phone);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'Could not load profile');
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  // 2️⃣ Handle Save
  const handleSave = async () => {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    try {
      // include balance so your endpoint won't 400
      const body = {
        name,
        sname,
        phone,
        balance: profile.balance
      };
      const res = await fetch(
        `http://${host}:5000/api/customers/${encodeURIComponent(profile.email)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text}`);
      }
      const updated = await res.json();
      updated.balance = Number(updated.balance);
      setProfile(updated);
      Alert.alert('Success', 'Profile updated');
      router.back();
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
      {/* avatar (you can hook up image picker here later) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="arrow-back" size={24} color="#1E90FF" />
        <Text style={styles.backText}>Back to Profile</Text>
      </TouchableOpacity>
      <Image
        source={require('../../assets/images/user.png')}
        style={styles.avatar}
      />

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Surname */}
      <Text style={styles.label}>Surname</Text>
      <TextInput
        style={styles.input}
        value={sname}
        onChangeText={setSname}
      />

      {/* Email (read-only, greyed out) */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.readOnly]}
        value={profile.email}
        editable={false}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center:      { flex:1, justifyContent:'center', alignItems:'center' },
  container:   { flex:1, padding:24, marginTop:50, backgroundColor:'#fff' },
  avatar:      {
    width:200, height:200, borderRadius:100,
    alignSelf:'center', marginBottom:24,
    borderWidth:4, borderColor:'#ccc'
  },
  label:       { marginTop:12, fontSize:14, color:'#666' },
  input:       {
    height:40, borderWidth:1, borderColor:'#ccc',
    borderRadius:4, paddingHorizontal:8, marginTop:4
  },
  readOnly:    {
    backgroundColor:'#f0f0f0', color:'#888'
  },
  saveBtn:     {
    marginTop:24, backgroundColor:'#1E90FF',
    padding:12, borderRadius:8, alignItems:'center'
  },
  saveText:    { color:'#fff', fontWeight:'600' },
  error:       { color:'red' },
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
