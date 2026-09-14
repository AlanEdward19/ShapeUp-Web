/* eslint-disable react-refresh/only-export-components */
export function useUserProfile() {
  return { id: 42, name: 'Nome real', email: '', photo: '', initials: 'NR' };
}

export function UserProfileProvider({ children }) {
  return children;
}
