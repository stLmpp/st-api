import { apiAdapter } from '@st-api/core';
import { FIREBASE_PROVIDERS } from '@st-api/firebase';

export default apiAdapter({
  name: 'test-app',
  providers: [...FIREBASE_PROVIDERS],
});
