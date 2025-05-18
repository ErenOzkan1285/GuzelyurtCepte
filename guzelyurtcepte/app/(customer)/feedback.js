// /app/feedback.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackScreen() {
  const { user } = useAuth();    // { email }
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!comment.trim()) {
      Alert.alert('Please enter your feedback');
      return;
    }
    setLoading(true);
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  
    try {
      // 🔑 Add the trailing slash here
      const res = await fetch(`http://${host}:5000/api/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          customer: user.email,
          trip_id: 1
        }),
      });
  
      // — debug raw response —
      const text = await res.text();
      console.log('Raw response:', text);
  
      if (!res.ok) {
        // try JSON parse, else show whole text
        let err;
        try { err = JSON.parse(text); }
        catch  { err = { error: text }; }
        throw new Error(err.error || `HTTP ${res.status}`);
      }
  
      Alert.alert('Thank you!', 'Your feedback has been sent.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="arrow-back" size={24} color="#1E90FF" />
        <Text style={styles.backText}>Back to Profile</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.textarea}
        placeholder="Type your message here…"
        multiline
        value={comment}
        onChangeText={setComment}
        editable={!loading}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending…' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:24, marginTop:50, backgroundColor:'#fff' },
  heading:   { fontSize:18, fontWeight:'600', marginBottom:12 },
  textarea:  {
    flex:1,
    borderWidth:1, borderColor:'#ccc',
    borderRadius:8,
    padding:12,
    textAlignVertical:'top'
  },
  button:    {
    marginTop:12,
    backgroundColor:'#1E90FF',
    paddingVertical:14,
    borderRadius:8,
    alignItems:'center'
  },
  buttonText:{ color:'#fff', fontSize:16, fontWeight:'600' },
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
