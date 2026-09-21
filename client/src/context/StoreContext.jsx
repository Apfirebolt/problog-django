// src/context/StoreContext.jsx
import { createContext, useContext } from 'react';
import { authStore } from '../stores/AuthStore';

const RootStoreContext = createContext({
  authStore,
});

export const StoreProvider = ({ children }) => {
  return (
    <RootStoreContext.Provider value={{ authStore }}>
      {children}
    </RootStoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(RootStoreContext);