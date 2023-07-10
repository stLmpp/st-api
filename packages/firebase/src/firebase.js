import { FactoryProvider, InjectionToken, ROOT_INJECTOR } from '@stlmpp/di';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

/**
 *
 * @type {InjectionToken<import('firebase/app').FirebaseApp>}
 */
export const FIREBASE_APP = new InjectionToken('FirebaseApp');
/**
 * @type {import('firebase/app').FirebaseApp | null}
 */
let firebaseApp = null;
const FIREBASE_APP_PROVIDER = new FactoryProvider(FIREBASE_APP, () => {
  if (!firebaseApp) {
    /**
     * @type {import('firebase/app').FirebaseOptions}
     */
    const options = {};
    firebaseApp = initializeApp(options);
  }
  return firebaseApp;
});

/**
 * @type {InjectionToken<import('firebase/auth').Auth>}
 */
export const FIREBASE_AUTH = new InjectionToken('FirebaseAuth');
const FIREBASE_AUTH_PROVIDER = new FactoryProvider(
  FIREBASE_AUTH,
  (firebaseApp) => {
    const auth = getAuth(firebaseApp);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    return auth;
  },
  [FIREBASE_APP],
);

ROOT_INJECTOR.register([FIREBASE_APP_PROVIDER, FIREBASE_AUTH_PROVIDER]);
