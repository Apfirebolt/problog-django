// src/context/StoreContext.jsx
import { createContext, useContext } from 'react';
import { authStore } from '../stores/AuthStore';
import BlogStore from '../stores/BlogStore';

// Instantiate the stores once globally
const blogStore = new BlogStore();

const RootStoreContext = createContext({
  authStore,
  blogStore,
});

export const StoreProvider = ({ children }) => {
  return (
    <RootStoreContext.Provider value={{ authStore, blogStore }}>
      {children}
    </RootStoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(RootStoreContext);