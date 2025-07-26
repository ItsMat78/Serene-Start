import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserData = {
  name?: string;
  theme?: 'light' | 'dark' | 'custom';
  customWallpaper?: string;
  backgroundDim?: number;
  tasks?: any[];
};

/**
 * Saves user data to a 'users' collection in Firestore.
 * @param userId The user's ID.
 * @param data The data to save.
 */
export const saveUserData = async (userId: string, data: UserData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Use setDoc with merge: true to create or update the document
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

/**
 * Retrieves user data from Firestore.
 * @param userId The user's ID.
 * @returns The user's data, or null if it doesn't exist.
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};
