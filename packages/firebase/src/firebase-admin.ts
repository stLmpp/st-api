import { FactoryProvider, InjectionToken } from '@stlmpp/di';
import { App, initializeApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export const FIREBASE_ADMIN_APP = new InjectionToken<App>('FirebaseAdminApp');
export const FIREBASE_ADMIN_FIRESTORE = new InjectionToken<Firestore>(
  'FirebaseAdminFirestore',
);
export const FIREBASE_ADMIN_AUTH = new InjectionToken<Auth>(
  'FirebaseAdminAuth',
);

export const FIREBASE_ADMIN_APP_PROVIDER = new FactoryProvider(
  FIREBASE_ADMIN_APP,
  () => initializeApp(),
);
export const FIREBASE_ADMIN_AUTH_PROVIDER = new FactoryProvider(
  FIREBASE_ADMIN_AUTH,
  (app) => getAuth(app),
  [FIREBASE_ADMIN_APP],
);
export const FIREBASE_ADMIN_FIRESTORE_PROVIDER = new FactoryProvider(
  FIREBASE_ADMIN_FIRESTORE,
  (app) => {
    const firestore = getFirestore(app);
    try {
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch {
      // core_logger.warn('Could not set firestore settings'); TODO logger
      // Ignore
    }
    return firestore;
  },
  [FIREBASE_ADMIN_APP],
);
