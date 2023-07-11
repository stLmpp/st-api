import { FactoryProvider, InjectionToken } from '@stlmpp/di';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @type {InjectionToken<import('firebase-admin/app').App>}
 */
export const FIREBASE_ADMIN_APP = new InjectionToken('FirebaseAdminApp');

/**
 * @type {InjectionToken<import('firebase-admin/firestore').Firestore>}
 */
export const FIREBASE_ADMIN_FIRESTORE = new InjectionToken(
  'FirebaseAdminFirestore',
);

/**
 * @type {InjectionToken<import('firebase-admin/auth').Auth>}
 */
export const FIREBASE_ADMIN_AUTH = new InjectionToken('FirebaseAdminAuth');

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
