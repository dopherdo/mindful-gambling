import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const newUserDoc = (username, email) => ({
  username,
  email,
  createdAt: serverTimestamp(),
  balance: 100,
  chips: 500,
  globalStats: {
    totalGamesPlayed: 0,
    videosWatched: 0,
  },
  mindfulStats: {
    blackjackGames: 0,
    rouletteGames: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    totalWagered: 0,
  },
  counterStats: {
    handsPlayed: 0,
    correctCounts: 0,
    accuracy: 0,
  },
  lastUpdated: serverTimestamp(),
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkUsernameAvailable = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    return snap.empty;
  };

  const register = async (email, password, username) => {
    const available = await checkUsernameAvailable(username);
    if (!available) {
      const err = new Error("Username is already taken.");
      err.code = "username-taken";
      throw err;
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    await setDoc(doc(db, "users", credential.user.uid), newUserDoc(username, email));
    return credential;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", credential.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const username = "user_" + Math.floor(Math.random() * 90000000 + 10000000);
      await updateProfile(credential.user, { displayName: username });
      await setDoc(userRef, newUserDoc(username, credential.user.email));
    }
    return credential;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, register, login, loginWithGoogle, logout }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};
