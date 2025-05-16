import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../utils/authContext';

export default function CustomerLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'customer') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Bus' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}