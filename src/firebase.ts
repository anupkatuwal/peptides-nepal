import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApp();

export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
  }
}

testConnection();
