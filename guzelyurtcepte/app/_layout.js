// /app/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BusProvider } from '../utils/busContext';

export default function RootLayout() {
  return (
    <BusProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1E90FF',
          tabBarStyle: { height: 60, paddingBottom: 5 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Bus',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bus" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </BusProvider>
  );
}
