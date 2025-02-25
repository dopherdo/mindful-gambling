import React, { createContext, useState, useEffect } from "react";

// Create Balance Context
export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance !== null ? parseInt(savedBalance, 10) : 100; // Keep 0 if balance is 0
  });

  // Sync balance with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
