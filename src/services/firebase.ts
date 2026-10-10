import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

let dbInstance: Firestore;

try {
  // Use experimentalForceLongPolling to ensure instant connectivity in web & iframe environments
  // without encountering 10-second WebSocket connection timeouts
  dbInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalForceLongPolling: true
    },
    databaseId
  );
} catch {
  try {
    dbInstance = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true
      },
      databaseId
    );
  } catch {
    dbInstance = getFirestore(app, databaseId);
  }
}

export const db = dbInstance;
export const auth = getAuth(app);

export default app;
