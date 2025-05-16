import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../utils/authContext';
import { BusProvider } from '../utils/busContext';
import { useEffect } from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <BusProvider>
        <NavigationHandler />
      </BusProvider>
    </AuthProvider>
  );
}

function NavigationHandler() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!user) {
      // Eğer giriş yoksa auth segmentine git
      if (segments[0] !== '(auth)') {
        router.replace('/(auth)/login');
      }
    } else {
      // Eğer giriş yapılmışsa role'a göre route
      if (user.role === 'support' && segments[0] !== '(support)') {
        router.replace('/(support)');
      } else if (user.role === 'customer' && segments[0] !== '(customer)') {
        router.replace('/(customer)');
      }
    }
  }, [user, segments]);

  return <Slot />;
}
