import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useUserManagementApi } from '../../hooks/api/useUserManagementApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { readAllPages } from '../../utils/readAllPages';
import './Clients.css';
import './GymManagement.css';

export default function GymManagement({ mode = 'overview' }) {
 const api = useGymManagementApi();
 const { getMe } = useUserManagementApi();
 const { language } = useLanguage();
 const tr = (pt,en,es) => ({'pt-BR':pt,en,es}[language] || en);
 const [gyms,setGyms] = useState([]);
 const [gymId,setGymId] = useState('');
 const [data,setData] = useState({staff:[],clients:[],plans:[]});
 const request = useRef(0);
 const [loading,setLoading] = useState(true);
 const [error,setError] = useState(false);
 const [busy,setBusy] = useState(false);
 const [form,setForm] = useState(null);
 const [query,setQuery] = useState('');
 const {getGyms,getGymStaff,getGymClients,getGymPlans} = api;
 useEffect(()=>{let active=true;getMe().then(me=>readAllPages(cursor=>getGyms(cursor,50,me.userId))).then(items=>{if(active){setGyms(items);setGymId(String(items[0]?.id || ''));setLoading(false);}}).catch(()=>{if(active){setError(true);setLoading(false);}});return()=>{active=false;};},[getMe,getGyms]);
 const reload = useCallback(async()=>{
  if(!gymId)return;
  const revision = ++request.current;
  const [staff,clients,plans]=await Promise.all([readAllPages(cursor=>getGymStaff(gymId,cursor,50)),readAllPages(cursor=>getGymClients(gymId,cursor,50)),readAllPages(cursor=>getGymPlans(gymId,cursor,50))]);
  if (revision === request.current) setData({staff,clients,plans});
 },[gymId,getGymStaff,getGymClients,getGymPlans]);
 useEffect(()=>{if(!gymId)return;let active=true;const revision=request.current+1;setLoading(true);setError(false);reload().catch(()=>{if(active)setError(true);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;request.current=revision+1;};},[gymId,reload]);
 const mutate = async(action)=>{if(busy)return;setBusy(true);setError(false);try{await action();setForm(null);await reload();}catch{setError(true);}finally{setBusy(false);}};
 const submit = event => {
  event.preventDefault();const fields=new FormData(event.currentTarget);
  if(form.kind==='staff')return mutate(()=>api.addGymStaff(gymId,{userId:Number(fields.get('userId')),role:fields.get('role')}));
  if(form.kind==='client')return mutate(()=>api.enrollGymClient(gymId,{userId:Number(fields.get('userId')),gymPlanId:Number(fields.get('planId')),trainerId:fields.get('trainerId')?Number(fields.get('trainerId')):null}));
  if(form.kind==='assign')return mutate(()=>api.assignClientTrainer(gymId,form.id,{trainerId:fields.get('trainerId')?Number(fields.get('trainerId')):null}));
  const payload={name:fields.get('name'),description:fields.get('description'),price:Number(fields.get('price')),durationDays:Number(fields.get('durationDays')),isActive:fields.get('isActive')==='on'};
  return mutate(()=>form.id?api.updateGymPlan(gymId,form.id,payload):api.createGymPlan(gymId,payload));
 };
 const title=mode==='staff'?tr('Equipe','Staff','Equipo'):mode==='clients'?tr('Alunos da academia','Gym members','Alumnos del gimnasio'):mode==='plans'?tr('Planos da academia','Gym plans','Planes del gimnasio'):tr('Visão geral da academia','Gym overview','Resumen del gimnasio');
 const trainers=data.staff.filter(item=>String(item.role).toLowerCase()==='trainer');
 const trainerSelect=<label>{tr('Treinador','Trainer','Entrenador')}<select name="trainerId" defaultValue={form?.trainerId || ''}><option value="">{tr('Sem vínculo','Unassigned','Sin asignar')}</option>{trainers.map(item=><option key={item.id} value={item.id}>#{item.userId}</option>)}</select></label>;
 const rows=(data[mode] || []).filter(item=>JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));

 const createGym = async event => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  setBusy(true);
  setError(false);
  try {
   const gym = await api.createGym({ name: fields.get('gymName'), description: fields.get('description'), address: fields.get('address'), platformTierId: null });
   setGyms([gym]);
   setGymId(String(gym.id));
  } catch {
   setError(true);
  } finally {
   setBusy(false);
  }
 };
 const openAdd = () => setForm({ kind: mode === 'staff' ? 'staff' : mode === 'clients' ? 'client' : 'plan' });
 const stats = [
  ['clients', tr('Alunos matriculados', 'Enrolled members', 'Alumnos matriculados'), 'group', '/dashboard/clients'],
  ['staff', tr('Membros da equipe', 'Staff members', 'Miembros del equipo'), 'badge', '/dashboard/staff'],
  ['plans', tr('Planos cadastrados', 'Registered plans', 'Planes registrados'), 'sell', '/dashboard/financial'],
 ];
 const columns = {
  staff: [tr('Usuário', 'User', 'Usuario'), tr('Função', 'Role', 'Rol'), tr('Contratação', 'Hired', 'Contratación')],
  clients: [tr('Usuário', 'User', 'Usuario'), tr('Plano', 'Plan', 'Plan'), tr('Treinador', 'Trainer', 'Entrenador')],
  plans: [tr('Plano', 'Plan', 'Plan'), tr('Preço', 'Price', 'Precio'), tr('Duração (dias)', 'Duration (days)', 'Duración (días)')],
 }[mode];
 const cells = item => mode === 'staff'
  ? [`#${item.userId}`, item.role, new Date(item.hiredAt).toLocaleDateString(language)]
  : mode === 'clients'
   ? [`#${item.userId}`, item.planName, item.trainerId ? `#${item.trainerId}` : '—']
   : [item.name, Number(item.price).toLocaleString(language, { minimumFractionDigits: 2 }), item.durationDays];
 const rowAction = item => mode === 'clients'
  ? <button type="button" className="gm-soft" onClick={() => setForm({ kind: 'assign', ...item })}>{tr('Alterar treinador', 'Change trainer', 'Cambiar entrenador')}</button>
  : mode === 'plans'
   ? <button type="button" className="gm-soft" onClick={() => setForm({ kind: 'plan', ...item })}>{tr('Editar', 'Edit', 'Editar')}</button>
   : <button type="button" className="gm-soft is-danger" disabled={busy} onClick={() => { if (window.confirm(tr('Remover este membro da equipe?', 'Remove this staff member?', '¿Eliminar este miembro del equipo?'))) mutate(() => api.removeGymStaff(gymId, item.id)); }}>{tr('Remover', 'Remove', 'Eliminar')}</button>;

 return (
  <div className="su-clients-dashboard gym-api-page">
   <div className="su-dashboard-header-flex">
    <h1 className="su-page-title">{title}</h1>
    {gyms.length > 1 && (
     <select aria-label={tr('Academia', 'Gym', 'Gimnasio')} disabled={busy} value={gymId} onChange={e => { setForm(null); setGymId(e.target.value); }}>
      {gyms.map(gym => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
     </select>
    )}
   </div>
   {error && <p role="alert">{tr('Não foi possível concluir a operação. Verifique suas permissões e tente novamente.', 'Could not complete the operation. Check your permissions and try again.', 'No se pudo completar la operación. Revisa tus permisos e inténtalo de nuevo.')}</p>}
   {loading ? <p role="status" className="gm-note">{tr('Carregando…', 'Loading…', 'Cargando…')}</p> : !gymId ? (
    <section className="gm-onboarding">
     <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
     <h2>{tr('Cadastre sua academia', 'Register your gym', 'Registra tu gimnasio')}</h2>
     <p>{tr('Nenhuma academia vinculada à sua conta como proprietário.', 'No gyms owned by your account.', 'No hay gimnasios de tu propiedad vinculados a tu cuenta.')}</p>
     <form onSubmit={createGym}>
      <label>{tr('Nome da academia', 'Gym name', 'Nombre del gimnasio')}<input name="gymName" required /></label>
      <label>{tr('Descrição', 'Description', 'Descripción')}<input name="description" /></label>
      <label>{tr('Endereço', 'Address', 'Dirección')}<input name="address" /></label>
      <button className="gm-primary" disabled={busy} type="submit">{tr('Cadastrar academia', 'Register gym', 'Registrar gimnasio')}</button>
     </form>
    </section>
   ) : mode === 'overview' ? (
    <section className="gm-stats">
     {stats.map(([key, label, icon, href]) => (
      <Link key={key} to={href} className="gm-stat">
       <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
       <strong>{data[key].length}</strong>
       <span>{label}</span>
      </Link>
     ))}
    </section>
   ) : (
    <>
     <div className="gm-toolbar">
      <input type="search" aria-label={tr('Buscar', 'Search', 'Buscar')} placeholder={tr('Buscar', 'Search', 'Buscar')} value={query} onChange={e => setQuery(e.target.value)} />
      <button type="button" className="gm-primary" onClick={openAdd}>{tr('Adicionar', 'Add', 'Añadir')}</button>
     </div>
     {form && (
      <form className="gm-form" onSubmit={submit}>
       {['staff', 'client'].includes(form.kind) && <label>{tr('ID do usuário', 'User ID', 'ID del usuario')}<input name="userId" type="number" min="1" required /></label>}
       {form.kind === 'staff' && <label>{tr('Função', 'Role', 'Rol')}<select name="role">{['Trainer', 'Receptionist', 'Manager', 'Finance', 'Staff'].map(role => <option key={role}>{role}</option>)}</select></label>}
       {form.kind === 'client' && <label>{tr('Plano', 'Plan', 'Plan')}<select name="planId" required>{data.plans.filter(plan => plan.isActive).map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>}
       {['client', 'assign'].includes(form.kind) && trainerSelect}
       {form.kind === 'plan' && <>
        <label>{tr('Nome', 'Name', 'Nombre')}<input name="name" required defaultValue={form.name} /></label>
        <label>{tr('Descrição', 'Description', 'Descripción')}<input name="description" defaultValue={form.description} /></label>
        <label>{tr('Preço', 'Price', 'Precio')}<input name="price" type="number" min="0" step="0.01" required defaultValue={form.price} /></label>
        <label>{tr('Duração (dias)', 'Duration (days)', 'Duración (días)')}<input name="durationDays" type="number" min="1" required defaultValue={form.durationDays} /></label>
        {form.id && <label className="gm-check"><input name="isActive" type="checkbox" defaultChecked={form.isActive} />{tr('Ativo', 'Active', 'Activo')}</label>}
       </>}
       <div className="gm-form-actions">
        <button className="gm-primary" disabled={busy} type="submit">{tr('Salvar', 'Save', 'Guardar')}</button>
        <button className="gm-soft" type="button" onClick={() => setForm(null)}>{tr('Cancelar', 'Cancel', 'Cancelar')}</button>
       </div>
      </form>
     )}
     {rows.length ? (
      <div className="gm-table-wrap">
       <table>
        <thead><tr>{columns.map(column => <th key={column}>{column}</th>)}<th><span className="gm-sr">{tr('Ações', 'Actions', 'Acciones')}</span></th></tr></thead>
        <tbody>{rows.map(item => <tr key={item.id}>{cells(item).map((cell, index) => <td key={index}>{cell}</td>)}<td className="gm-actions">{rowAction(item)}</td></tr>)}</tbody>
       </table>
      </div>
     ) : <p className="gm-note">{tr('Nenhum registro encontrado.', 'No records found.', 'No se encontraron registros.')}</p>}
    </>
   )}
  </div>
 );
}
