import { FactoryProvider } from '@stlmpp/di';
import { CoreEnvironment, RATE_LIMITER } from '@st-api/core';
import { FIREBASE_ADMIN_FIRESTORE } from './firebase-admin.js';
import { FirebaseFunctionsRateLimiter } from 'firebase-functions-rate-limiter';

export const FIREBASE_RATE_LIMITER_PROVIDER = new FactoryProvider(
  RATE_LIMITER,
  (firestore, environment) => {
    const rateLimiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
      {
        debug: true, // TODO DEV_MODE
        maxCalls: environment.rateLimiterMaxCalls,
        periodSeconds: environment.rateLimiterPeriodSeconds,
      },
      firestore,
    );
    return () => rateLimiter.isQuotaAlreadyExceeded();
  },
  [FIREBASE_ADMIN_FIRESTORE, CoreEnvironment],
);
