import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProfileProvider } from '../contexts/UserProfileContext';
import { WorkspaceNavigation } from '../components/Workspace/WorkspaceNavigation';

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <UserProfileProvider>
      <MemoryRouter initialEntries={['/dashboard/clients']}>
        <WorkspaceNavigation isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    </UserProfileProvider>
  </AuthProvider>,
);
