import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../utils/authContext';

export default function SupportLayout() {
  const { user } = useAuth();

  if (user?.role !== 'support') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
