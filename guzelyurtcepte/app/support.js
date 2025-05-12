import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';

export default function SupportScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);

useEffect(() => {
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5000/api/feedback/');
      const data = await res.json();

      const formatted = data.map(fb => ({
        id: fb.feedback_id,
        userEmail: fb.customer?.email || 'Unknown',
        message: fb.comment,
        responded: fb.response != null,
        fullData: fb
      }));

      setFeedbacks(formatted);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      Alert.alert('Error', 'Could not load feedbacks from server.');
    }
  };

  fetchFeedbacks();
}, []);

  // Simulate sending a response
const sendResponse = async () => {
  if (!selected) return;
  setSending(true);

  try {
    const res = await fetch(`http://10.0.2.2:5000/api/feedback/${selected.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        response: responseText,
        support: 'support1@example.com'  // opsiyonel, hardcoded örnek
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    // feedback listesini güncelle
    setFeedbacks(prev =>
      prev.map(f =>
        f.id === selected.id ? { ...f, responded: true } : f
      )
    );

    setSelected(null);
    setResponseText('');
  } catch (error) {
    console.error('Failed to send response:', error);
    Alert.alert('Error', 'Could not send response to server.');
  } finally {
    setSending(false);
  }
};

  // If a feedback is selected, show detail + response box
  if (selected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)}>
          <Text style={styles.back}>&larr; Back to list</Text>
        </TouchableOpacity>
        <View style={styles.detail}>
          <Text style={styles.subtitle}>From: {selected.userEmail}</Text>
          <Text style={styles.message}>{selected.message}</Text>
        </View>
        <Text style={styles.subtitle}>Your Response:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Type your response here..."
          value={responseText}
          onChangeText={setResponseText}
        />
        <Button
          title={sending ? 'Sending...' : 'Send Response'}
          onPress={sendResponse}
          disabled={sending || !responseText.trim()}
        />
      </View>
    );
  }

  // Otherwise show the list of feedbacks
  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Feedbacks</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.itemText}>{item.userEmail}</Text>
            <Text style={styles.itemSub}>{
              item.responded ? '✅ Responded' : '⌛ Pending'
            }</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 24 },
  item: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { fontSize: 16 },
  itemSub: { fontSize: 14, color: '#666' },
  separator: { height: 1, backgroundColor: '#eee' },
  back: { color: '#1E90FF', marginBottom: 8 },
  detail: { marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  message: { fontSize: 14, color: '#333', marginBottom: 12 },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
    padding: 8,
    marginBottom: 12,
  },
});