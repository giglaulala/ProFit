import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Redirect to setup screen by default
    router.replace('/setup');
  }, []);

  return null;
} 