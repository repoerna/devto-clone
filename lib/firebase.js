import {initializeApp, getApps} from 'firebase/app';
import {getAuth, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {collection, getDocs, getFirestore, query, serverTimestamp, where} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);

  export const auth = getAuth(app);
  export const firestore = getFirestore(app);
  export const storage = getStorage();

  export const serverTimeStamp = serverTimestamp();


export async function getUserWithUsername(username) {
  const userRef = collection(firestore, 'users');
  const q = query(userRef, where('username', '==', username));
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}


export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}