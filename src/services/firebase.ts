import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let dbInstance: Firestore;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  // Force long polling to eliminate WebChannel connection failures in iframe / sandbox / proxy environments
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true
  }, databaseId);
} catch {
  dbInstance = getFirestore(app, databaseId);
}

export const db = dbInstance;

// Initial connection test per Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore operating in offline cache mode.');
    }
  }
}
testConnection().catch(() => {});

export default app;
