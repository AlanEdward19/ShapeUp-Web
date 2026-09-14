/* eslint-disable react-refresh/only-export-components -- capture-only profile mock */
import { createContext, useContext } from 'react';

const UserProfileContext = createContext({
  name: 'Coach Alex',
  photo: '',
  email: 'coach@shapeup.test',
  initials: 'CA',
});

export function UserProfileProvider({ children }) {
  return <UserProfileContext.Provider value={useContext(UserProfileContext)}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
