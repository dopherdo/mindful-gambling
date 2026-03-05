import React, { createContext, useState, useEffect } from "react";

// Create Balance Context
export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    const parsed = parseInt(localStorage.getItem("balance"), 10);
    return isNaN(parsed) ? 100 : parsed;
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
