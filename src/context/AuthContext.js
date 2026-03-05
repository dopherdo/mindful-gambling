import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const register = async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(db, "users", credential.user.uid), {
      displayName,
      email,
      createdAt: serverTimestamp(),
      balance: 100,
      stats: {
        totalGamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        biggestWin: 0,
        totalWagered: 0,
        videosWatched: 0,
        blackjackGames: 0,
        rouletteGames: 0,
      },
      lastUpdated: serverTimestamp(),
    });
    return credential;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", credential.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: credential.user.displayName,
        email: credential.user.email,
        createdAt: serverTimestamp(),
        balance: 100,
        stats: {
          totalGamesPlayed: 0,
          totalWins: 0,
          totalLosses: 0,
          biggestWin: 0,
          totalWagered: 0,
          videosWatched: 0,
          blackjackGames: 0,
          rouletteGames: 0,
        },
        lastUpdated: serverTimestamp(),
      });
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
