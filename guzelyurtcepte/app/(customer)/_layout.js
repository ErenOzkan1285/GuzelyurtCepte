// /app/(customer)/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E90FF',
        tabBarStyle: { height: 60, paddingBottom: 5 },
      }}
    >
      {/* visible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bus',
          tabBarIcon: ({ color, size }) => <Ionicons name="bus" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />
        }}
      />

      {/* hidden trips tab */}
      <Tabs.Screen
        name="trips"
        options={{
          // completely hide its button AND collapse its tabBar entry:
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },

          // you can still show a header if you like:
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="edit"
        options={{
          // completely hide its button AND collapse its tabBar entry:
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },

          // you can still show a header if you like:
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          // completely hide its button AND collapse its tabBar entry:
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },

          // you can still show a header if you like:
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
