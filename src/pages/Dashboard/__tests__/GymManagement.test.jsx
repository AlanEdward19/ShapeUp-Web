import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {expect,it,vi} from 'vitest';
import {LanguageProvider} from '../../../contexts/LanguageContext';
import GymManagement from '../GymManagement';
const api=vi.hoisted(()=>({getGyms:vi.fn().mockResolvedValue({items:[{id:3,name:'Academia real'}]}),getGymClients:vi.fn().mockResolvedValue({items:[{id:7,userId:42,planName:'Plano real',trainerId:null}]}),getGymStaff:vi.fn().mockResolvedValue({items:[{id:8,userId:99,role:'Trainer'}]}),getGymPlans:vi.fn().mockResolvedValue({items:[{id:2,name:'Plano real',isActive:true}]}),assignClientTrainer:vi.fn().mockResolvedValue({})}));
const getMe=vi.hoisted(()=>vi.fn().mockResolvedValue({userId:1}));
vi.mock('../../../hooks/api/useUserManagementApi',()=>({useUserManagementApi:()=>({getMe})}));
vi.mock('../../../hooks/api/useGymManagementApi',()=>({useGymManagementApi:()=>api}));
it('assigns the gym membership and staff IDs instead of user IDs',async()=>{
 localStorage.setItem('shapeup_language','pt-BR');
 render(<LanguageProvider><MemoryRouter><GymManagement mode="clients"/></MemoryRouter></LanguageProvider>);
 fireEvent.click(await screen.findByRole('button',{name:'Alterar treinador'}));
 fireEvent.change(screen.getByLabelText('Treinador'),{target:{value:'8'}});
 fireEvent.click(screen.getByRole('button',{name:'Salvar'}));
 await waitFor(()=>expect(api.assignClientTrainer).toHaveBeenCalledWith('3',7,{trainerId:8}));
 expect(screen.queryByText('Marcos Gomes')).not.toBeInTheDocument();
});
