import React, { createContext, useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [balance, setBalanceState] = useState(() => {
    const saved = localStorage.getItem("balance");
    return saved !== null ? parseInt(saved, 10) : 100;
  });
  const syncTimeoutRef = useRef(null);

  // When user logs in, load their balance from Firestore
  useEffect(() => {
    if (!currentUser) return;
    const loadBalance = async () => {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        const firestoreBalance = snap.data().balance ?? 100;
        setBalanceState(firestoreBalance);
        localStorage.setItem("balance", firestoreBalance);
      }
    };
    loadBalance();
  }, [currentUser]);

  const setBalance = (newBalance) => {
    setBalanceState(newBalance);
    localStorage.setItem("balance", newBalance);

    if (currentUser) {
      // Debounce Firestore writes to avoid excessive calls
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        updateDoc(doc(db, "users", currentUser.uid), {
          balance: newBalance,
          lastUpdated: serverTimestamp(),
        }).catch(console.error);
      }, 1000);
    }
  };

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
