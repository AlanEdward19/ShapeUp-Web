/* eslint-disable react-refresh/only-export-components -- capture-only auth mock */
import { createContext, useContext } from 'react';

const defaultAuth = {
  currentUser: { uid: 'capture', displayName: 'Coach Alex', email: 'coach@shapeup.test' },
  signOut: async () => {},
};

const AuthContext = createContext(defaultAuth);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={defaultAuth}>{children}</AuthContext.Provider>
);
