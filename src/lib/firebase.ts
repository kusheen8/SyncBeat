import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SAMPLE_SONGS } from '../data/songs';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const seedSongs = async () => {
  const songsSnap = await getDocs(collection(db, 'songs'));
  if (songsSnap.empty) {
    console.log("Seeding songs...");
    const batch = writeBatch(db);
    SAMPLE_SONGS.forEach((song) => {
      const songRef = doc(collection(db, 'songs'), song.id);
      batch.set(songRef, song);
    });
    await batch.commit();
    console.log("Songs seeded.");
  }
};
