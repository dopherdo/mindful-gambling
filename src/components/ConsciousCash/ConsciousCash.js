import React, { useContext, useEffect, useRef, useState } from "react";
import { BalanceContext } from "../../context/BalanceContext";

let _id = 0;

const ConsciousCash = () => {
  const { balance } = useContext(BalanceContext);
  const prevRef = useRef(balance);
  const [deltas, setDeltas] = useState([]);

  useEffect(() => {
    const diff = balance - prevRef.current;
    if (diff !== 0) {
      const id = ++_id;
      setDeltas(d => [...d, { id, diff }]);
      setTimeout(() => setDeltas(d => d.filter(x => x.id !== id)), 1400);
    }
    prevRef.current = balance;
  }, [balance]);

  return (
    <div className="cc-wrapper">
      <span className="conscious-cash">
        Conscious Cash: <span>${balance}</span>
      </span>
      {deltas.map(({ id, diff }) => (
        <span
          key={id}
          className={`cc-delta ${diff > 0 ? "cc-gain" : "cc-loss"}`}
        >
          {diff > 0 ? `+$${diff}` : `-$${Math.abs(diff)}`}
        </span>
      ))}
    </div>
  );
};

export default ConsciousCash;
