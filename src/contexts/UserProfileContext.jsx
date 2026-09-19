import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUserManagementApi } from '../hooks/api/useUserManagementApi';

const UserProfileContext = createContext(null);
export function UserProfileProvider({ children }) {
  const { currentUser } = useAuth();
  const { getMe } = useUserManagementApi();
  const [record, setRecord] = useState(null);
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getMe().then(profile => {
      if (!active) return;
      setRecord({ uid: currentUser.uid, profile });
      localStorage.setItem('shapeup_user_id', String(profile.userId));
      localStorage.setItem('shapeup_client_id', String(profile.userId));
      localStorage.setItem('shapeup_user_name', profile.displayName || currentUser.displayName || '');
      localStorage.setItem('shapeup_user_email', profile.email || currentUser.email || '');
      window.dispatchEvent(new Event('shapeup_profile_updated'));
    }).catch(() => {});
    return () => { active = false; };
  }, [currentUser, getMe]);
  const profile = record?.uid === currentUser?.uid ? record?.profile : null;
  const name = profile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const value = { id: profile?.userId, name, email: profile?.email || currentUser?.email || '', photo: currentUser?.photoURL || '', initials: initial, initial };
  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  const auth = useAuth();
  const name = auth?.currentUser?.displayName || auth?.currentUser?.email?.split('@')[0] || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return context || { name, photo: auth?.currentUser?.photoURL || '', email: auth?.currentUser?.email || '', initials: initial, initial };
}
