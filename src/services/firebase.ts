import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  doc,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let dbInstance: Firestore;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  dbInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true
    },
    databaseId
  );
} catch {
  try {
    dbInstance = initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true
      },
      databaseId
    );
  } catch {
    dbInstance = getFirestore(app, databaseId);
  }
}

export const db = dbInstance;

// Initial connection test per Firebase skill with graceful offline resiliency
async function testConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.info('Firestore operating in offline cache mode (device is offline).');
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (
      (error instanceof Error && error.message.includes('the client is offline')) ||
      error?.code === 'unavailable' ||
      error?.message?.includes('unavailable') ||
      error?.message?.includes('Could not reach Cloud Firestore backend')
    ) {
      console.info('Firestore operating in offline cache mode.');
    }
  }
}
testConnection().catch(() => {});

export default app;
