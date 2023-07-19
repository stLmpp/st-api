import { CoreEnvironment, RATE_LIMITER } from '@st-api/core';
import { FactoryProvider } from '@stlmpp/di';
import { FirebaseFunctionsRateLimiter } from 'firebase-functions-rate-limiter';

import { FIREBASE_ADMIN_FIRESTORE } from './firebase-admin.js';

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
