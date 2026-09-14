import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useUserManagementApi } from '../../hooks/api/useUserManagementApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { readAllPages } from '../../utils/readAllPages';
import './Clients.css';

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
 return <div className="su-clients-dashboard gym-api-page"><style>{`.gym-api-page label{display:flex;flex-direction:column;gap:6px;font-size:13px}.gym-api-page input,.gym-api-page select,.gym-api-page textarea{padding:10px;background:var(--bg-input);color:var(--text-main);border:1px solid var(--border-color);border-radius:6px}.gym-api-page button{padding:8px 12px;border:1px solid var(--border-color);border-radius:6px}.gym-api-page form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;padding:20px 0}.gym-api-page th,.gym-api-page td{padding:14px;text-align:left;border-bottom:1px solid var(--border-color)}`}</style>
  <div className="su-dashboard-header-flex"><h1 className="su-page-title">{title}</h1><select aria-label={tr('Academia','Gym','Gimnasio')} disabled={busy} value={gymId} onChange={e=>{setForm(null);setGymId(e.target.value);}}>{gyms.map(gym=><option key={gym.id} value={gym.id}>{gym.name}</option>)}</select></div>
  {error && <p role="alert">{tr('Não foi possível concluir a operação. Verifique suas permissões e tente novamente.','Could not complete the operation. Check your permissions and try again.','No se pudo completar la operación. Revisa tus permisos e inténtalo de nuevo.')}</p>}
  {loading ? <p role="status">{tr('Carregando…','Loading…','Cargando…')}</p>:!gymId?<><p>{tr('Nenhuma academia vinculada à sua conta como proprietário.','No gyms owned by your account.','No hay gimnasios de tu propiedad vinculados a tu cuenta.')}</p><form onSubmit={async event=>{event.preventDefault();const fields=new FormData(event.currentTarget);setBusy(true);setError(false);try{const gym=await api.createGym({name:fields.get('gymName'),description:fields.get('description'),address:fields.get('address'),platformTierId:null});setGyms([gym]);setGymId(String(gym.id));}catch{setError(true);}finally{setBusy(false);}}}><label>{tr('Nome da academia','Gym name','Nombre del gimnasio')}<input name="gymName" required /></label><label>{tr('Descrição','Description','Descripción')}<input name="description" /></label><label>{tr('Endereço','Address','Dirección')}<input name="address" /></label><button disabled={busy} type="submit">{tr('Cadastrar academia','Register gym','Registrar gimnasio')}</button></form></>:<>
  {mode==='overview'?<><div style={{display:'flex',gap:40,flexWrap:'wrap',padding:'24px 0'}}>{[['clients',tr('Alunos matriculados','Enrolled members','Alumnos matriculados')],['staff',tr('Membros da equipe','Staff members','Miembros del equipo')],['plans',tr('Planos cadastrados','Registered plans','Planes registrados')]].map(([key,label])=><div key={key}><p>{label}</p><strong style={{fontSize:32}}>{data[key].length}</strong></div>)}</div><nav style={{display:'flex',gap:24}}><Link to="/dashboard/clients">{tr('Alunos','Members','Alumnos')}</Link><Link to="/dashboard/staff">{tr('Equipe','Staff','Equipo')}</Link><Link to="/dashboard/financial">{tr('Planos','Plans','Planes')}</Link></nav></>:<>
  <div style={{display:'flex',gap:16,justifyContent:'space-between',margin:'20px 0'}}><input aria-label={tr('Buscar','Search','Buscar')} placeholder={tr('Buscar','Search','Buscar')} value={query} onChange={e=>setQuery(e.target.value)}/><button onClick={()=>setForm({kind:mode==='staff'?'staff':mode==='clients'?'client':'plan'})}>{tr('Adicionar','Add','Añadir')}</button></div>
  {form && <form onSubmit={submit}>
   {['staff','client'].includes(form.kind)&&<label>{tr('ID do usuário','User ID','ID del usuario')}<input name="userId" type="number" min="1" required /></label>}
   {form.kind==='staff'&&<label>{tr('Função','Role','Rol')}<select name="role">{['Trainer','Receptionist','Manager','Finance','Staff'].map(role=><option key={role}>{role}</option>)}</select></label>}
   {form.kind==='client'&&<label>{tr('Plano','Plan','Plan')}<select name="planId" required>{data.plans.filter(plan=>plan.isActive).map(plan=><option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>}
   {['client','assign'].includes(form.kind)&&trainerSelect}
   {form.kind==='plan'&&<><label>{tr('Nome','Name','Nombre')}<input name="name" required defaultValue={form.name}/></label><label>{tr('Descrição','Description','Descripción')}<input name="description" defaultValue={form.description}/></label><label>{tr('Preço','Price','Precio')}<input name="price" type="number" min="0" step="0.01" required defaultValue={form.price}/></label><label>{tr('Duração (dias)','Duration (days)','Duración (días)')}<input name="durationDays" type="number" min="1" required defaultValue={form.durationDays}/></label>{form.id&&<label><input name="isActive" type="checkbox" defaultChecked={form.isActive}/>{tr('Ativo','Active','Activo')}</label>}</>}
   <button disabled={busy} type="submit">{tr('Salvar','Save','Guardar')}</button><button type="button" onClick={()=>setForm(null)}>{tr('Cancelar','Cancel','Cancelar')}</button>
  </form>}
  <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>{mode==='plans'?tr('Plano','Plan','Plan'):tr('Usuário','User','Usuario')}</th><th>{mode==='staff'?tr('Função','Role','Rol'):mode==='clients'?tr('Plano','Plan','Plan'):tr('Preço','Price','Precio')}</th><th>{mode==='clients'?tr('Treinador','Trainer','Entrenador'):mode==='plans'?tr('Duração (dias)','Duration (days)','Duración (días)'):tr('Contratação','Hired','Contratación')}</th><th>{tr('Ações','Actions','Acciones')}</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><td>{mode==='plans'?item.name:`#${item.userId}`}</td><td>{mode==='staff'?item.role:mode==='clients'?item.planName:Number(item.price).toLocaleString(language,{minimumFractionDigits:2})}</td><td>{mode==='clients'?(item.trainerId?`#${item.trainerId}`:'—'):mode==='plans'?item.durationDays:new Date(item.hiredAt).toLocaleDateString(language)}</td><td>{mode==='clients'?<button onClick={()=>setForm({kind:'assign',...item})}>{tr('Alterar treinador','Change trainer','Cambiar entrenador')}</button>:mode==='plans'?<button onClick={()=>setForm({kind:'plan',...item})}>{tr('Editar','Edit','Editar')}</button>:<button disabled={busy} onClick={()=>{if(window.confirm(tr('Remover este membro da equipe?','Remove this staff member?','¿Eliminar este miembro del equipo?')))mutate(()=>api.removeGymStaff(gymId,item.id));}}>{tr('Remover','Remove','Eliminar')}</button>}</td></tr>)}</tbody></table></div>
  {!rows.length&&<p>{tr('Nenhum registro encontrado.','No records found.','No se encontraron registros.')}</p>}
  </>}
  </>}
 </div>;
}
