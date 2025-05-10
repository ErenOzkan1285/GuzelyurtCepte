// utils/BusContext.js
import React, { createContext, useState } from 'react';

export const BusContext = createContext({
  busPosition: null,
  setBusPosition: () => {},
});

export function BusProvider({ children }) {
  const [busPosition, setBusPosition] = useState(null);
  return (
    <BusContext.Provider value={{ busPosition, setBusPosition }}>
      {children}
    </BusContext.Provider>
  );
}
