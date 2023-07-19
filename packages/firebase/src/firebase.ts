import { FactoryProvider, InjectionToken } from '@stlmpp/di';
import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, getAuth, Auth } from 'firebase/auth';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FirebaseApp');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FirebaseAuth');

let firebaseApp: FirebaseApp | undefined;

export const FIREBASE_APP_PROVIDER = new FactoryProvider(FIREBASE_APP, () => {
  if (!firebaseApp) {
    const options: FirebaseOptions = {};
    firebaseApp = initializeApp(options);
  }
  return firebaseApp;
});

export const FIREBASE_AUTH_PROVIDER = new FactoryProvider(
  FIREBASE_AUTH,
  (app) => {
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    return auth;
  },
  [FIREBASE_APP],
);
