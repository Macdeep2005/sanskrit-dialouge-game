import {
  useEffect,
  useState,
} from 'react';

import type {
  User,
} from 'firebase/auth';

import {
  auth,
  onAuthStateChanged,
} from '../firebase-config';

export function useAuth() {
  const [
    user,
    setUser,
  ] = useState<
    User | null | undefined
  >(undefined);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        currentUser => {
          setUser(currentUser);
        }
      );

    return unsubscribe;
  }, []);

  return {
    user,
  };
}
