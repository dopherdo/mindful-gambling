import React, { createContext, useState, useEffect } from "react";

// Create Context
export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
    const [balance, setBalance] = useState(() => {
        return parseInt(localStorage.getItem("balance")) || 100; // Load balance from localStorage
    });

    // Sync balance with localStorage
    useEffect(() => {
        localStorage.setItem("balance", balance);
    }, [balance]);

    return (
        <BalanceContext.Provider value={{ balance, setBalance }}>
        {children}
        </BalanceContext.Provider>
    );
};
