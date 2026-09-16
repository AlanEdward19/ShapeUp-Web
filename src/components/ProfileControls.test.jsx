import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ProfileSwitcher, ProfilePhoto } from './ProfileControls';
const mocks=vi.hoisted(()=>({getMyUserRoles:vi.fn(),persistSession:vi.fn(),updateProfilePhoto:vi.fn()}));
vi.mock('../hooks/api/useGymManagementApi',()=>({useGymManagementApi:()=>({getMyUserRoles:mocks.getMyUserRoles})}));
vi.mock('../contexts/AuthContext',()=>({useAuth:()=>({currentUser:{uid:'user',email:'me@example.com'},persistSession:mocks.persistSession,updateProfilePhoto:mocks.updateProfilePhoto})}));
vi.mock('../contexts/UserProfileContext',()=>({useUserProfile:()=>({initials:'ME',photo:''})}));
function Location(){return <output>{useLocation().pathname}</output>;}
beforeEach(()=>{vi.clearAllMocks();localStorage.setItem('shapeup_language','en');localStorage.setItem('shapeup_role','client');});
it('offers only linked profiles and switches to the dashboard',async()=>{
 mocks.getMyUserRoles.mockResolvedValue([{role:'Client'},{role:'Trainer'},{role:'Trainer'},{role:'Unsupported'}]);
 render(<LanguageProvider><MemoryRouter initialEntries={['/dashboard/settings']}><ProfileSwitcher/><Location/></MemoryRouter></LanguageProvider>);
 await screen.findByRole('option',{name:'Personal trainer'});
 expect(screen.getAllByRole('option')).toHaveLength(2);
 expect(screen.queryByRole('option',{name:'Gym owner'})).toBeNull();
 fireEvent.change(screen.getByLabelText('Active profile'),{target:{value:'professional'}});
 expect(mocks.persistSession).toHaveBeenCalledWith(expect.objectContaining({uid:'user'}),'me@example.com','professional');
 expect(screen.getByRole('status')).toHaveTextContent('/dashboard');
});
it('shows upload failures without claiming the photo was saved and permits retry',async()=>{
 mocks.updateProfilePhoto.mockRejectedValueOnce(new Error('storage/unauthorized')).mockResolvedValueOnce();
 const {container}=render(<LanguageProvider><MemoryRouter><ProfilePhoto/></MemoryRouter></LanguageProvider>);
 const file=new File(['image'],'profile.png',{type:'image/png'});
 fireEvent.change(container.querySelector('input[type=file]'),{target:{files:[file]}});
 await screen.findByRole('alert');expect(screen.queryByText('Photo updated.')).toBeNull();
 fireEvent.change(container.querySelector('input[type=file]'),{target:{files:[file]}});
 await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Photo updated.'));
 expect(mocks.updateProfilePhoto).toHaveBeenLastCalledWith(file);
});
