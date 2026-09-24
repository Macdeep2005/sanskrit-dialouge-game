import {
  useEffect,
  useState,
} from 'react';

import type {
  User,
} from 'firebase/auth';

import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
} from '../firebase-config';

export function useAuth() {
  const [
    user,
    setUser,
  ] = useState<
    User | null | undefined
  >(undefined);

  const [
    signingIn,
    setSigningIn,
  ] = useState(false);

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

  async function signInForTesting() {
    setSigningIn(true);

    try {
      await signInWithPopup(
        auth,
        provider
      );
    } catch (error) {
      console.error(
        'Firebase sign in failed:',
        error
      );
    } finally {
      setSigningIn(false);
    }
  }

  return {
    user,

    authLoading:
      user === undefined,

    signingIn,

    signInForTesting,
  };
}