import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider } from '../lib/firebase';
import { DEFAULT_SUBJECT } from '../data/defaultSubject';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userData, setUserData] = useState({
    profile: null, // { name, year, college }
    subjects: [DEFAULT_SUBJECT],
    subjectProgress: { [DEFAULT_SUBJECT.id]: [] },
    studyLogs: []
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        setUserData({
          subjects: [DEFAULT_SUBJECT],
          subjectProgress: { [DEFAULT_SUBJECT.id]: [] },
          studyLogs: []
        });
      }
    });
    return unsubscribe;
  }, []);

  // Firestore sync
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    // Check if document exists, if not initialize it
    const checkAndInit = async () => {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        // Initial migration or setup
        const localSubjects = JSON.parse(localStorage.getItem('subjects'));
        const localProgress = JSON.parse(localStorage.getItem('subjectProgress'));
        const localLogs = JSON.parse(localStorage.getItem('studyLogs'));

        const initialData = {
          subjects: localSubjects || [DEFAULT_SUBJECT],
          subjectProgress: localProgress || { [DEFAULT_SUBJECT.id]: [] },
          studyLogs: localLogs || [],
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, initialData);
      }
    };

    checkAndInit();

    // Listen for real-time changes
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const login = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError(err.message);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError('Please signup first');
      } else {
        setAuthError(err.message);
      }
      throw err;
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      setAuthError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => signOut(auth);

  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const updateData = async (newData) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { ...newData, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const value = {
    user,
    userData,
    loading,
    authError,
    login,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateData,
    uploadFile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
