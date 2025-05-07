// /app/index.js
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const stopsFromDB = [
  { id: '1', name: 'Central Station' },
  { id: '2', name: 'Main Street' },
  { id: '3', name: 'Park Avenue' },
  { id: '4', name: 'Museum Stop' },
  // …add your real stops here, each with a unique id & name
];

export default function BusSearchPage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filtered = stopsFromDB.filter(stop =>
    stop.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a stop…"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={"Logic değişecek"}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No stops found.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
});
