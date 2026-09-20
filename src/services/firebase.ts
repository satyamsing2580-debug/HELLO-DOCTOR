import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let dbInstance: Firestore;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  // Use auto-detect long polling to prevent WebChannel connection drops in container / iframe / webview environments
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  }, databaseId);
} catch {
  dbInstance = getFirestore(app, databaseId);
}

export const db = dbInstance;
export default app;
