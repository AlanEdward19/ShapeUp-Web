import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { UserProfileProvider, useUserProfile } from './UserProfileContext';
const mocks=vi.hoisted(()=>({user:{uid:'firebase-real',email:'real@example.com',photoURL:'https://example.com/photo.png'},getMe:vi.fn().mockResolvedValue({userId:42,displayName:'Nome do backend',email:'real@example.com'})}));
vi.mock('./AuthContext',()=>({useAuth:()=>({currentUser:mocks.user})}));
vi.mock('../hooks/api/useUserManagementApi',()=>({useUserManagementApi:()=>({getMe:mocks.getMe})}));
function Profile(){const user=useUserProfile();return <><p>{user.name}</p><img src={user.photo} alt="Perfil"/></>;}
it('reads displayName and numeric ID from the backend and photo from the authenticated account',async()=>{
 localStorage.setItem('shapeup_user_name','Rodrigo fake');
 render(<UserProfileProvider><Profile/></UserProfileProvider>);
 await screen.findByText('Nome do backend');
 expect(screen.getByAltText('Perfil')).toHaveAttribute('src','https://example.com/photo.png');
 await waitFor(()=>expect(localStorage.getItem('shapeup_user_id')).toBe('42'));
 expect(localStorage.getItem('shapeup_client_id')).toBe('42');
 expect(screen.queryByText('Rodrigo fake')).not.toBeInTheDocument();
});
