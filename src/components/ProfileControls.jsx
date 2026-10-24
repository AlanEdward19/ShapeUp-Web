import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';
import ProfileAvatar from './ProfileAvatar';

const roles = { Trainer: 'professional', Nutritionist: 'professional', GymOwner: 'gym', IndependentClient: 'independent', Client: 'client', GymClient: 'client' };
const labels = {
 'pt-BR': ['Perfil ativo','Sua conta tem estes perfis. Toque em um para usar.','Personal trainer','Dono de academia','Atleta independente','Atleta acompanhado','Não foi possível carregar seus perfis.','Tentar novamente','Alterar foto','Remover foto','Enviando…','Use JPG, PNG ou WebP de até 2 MB.','Não foi possível salvar a foto. Tente novamente.','Foto atualizada.','Em uso','Nutricionista','Personal trainer e nutricionista','Alunos, treinos, dieta e planos de atendimento','Equipe, alunos e financeiro','Seus treinos e sua nutrição, sem profissional','Treinos prescritos pelo seu profissional'],
 en: ['Active profile','Your account has these profiles. Tap one to use it.','Personal trainer','Gym owner','Independent athlete','Coached athlete','Could not load your profiles.','Try again','Change photo','Remove photo','Uploading…','Use JPG, PNG or WebP up to 2 MB.','Could not save the photo. Please try again.','Photo updated.','In use','Nutritionist','Personal trainer and nutritionist','Clients, workouts, diets and service plans','Staff, members and finances','Your own training and nutrition','Workouts prescribed by your coach'],
 es: ['Perfil activo','Tu cuenta tiene estos perfiles. Toca uno para usarlo.','Entrenador personal','Dueño de gimnasio','Atleta independiente','Atleta con entrenador','No se pudieron cargar tus perfiles.','Reintentar','Cambiar foto','Eliminar foto','Subiendo…','Usa JPG, PNG o WebP de hasta 2 MB.','No se pudo guardar la foto. Inténtalo de nuevo.','Foto actualizada.','En uso','Nutricionista','Entrenador personal y nutricionista','Alumnos, entrenamientos, dietas y planes','Equipo, alumnos y finanzas','Tu entrenamiento y nutrición','Entrenamientos de tu profesional']
};
const buttonStyle = {padding:'8px 12px',border:0,borderRadius:12,background:'var(--bg-surface-high)',color:'var(--text-main)',minHeight:44,fontWeight:600,cursor:'pointer'};
const optionStyle = active => ({display:'flex',alignItems:'center',gap:12,width:'100%',minHeight:64,padding:'12px 14px',textAlign:'left',border:active ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',borderRadius:18,background:active ? 'color-mix(in oklab, var(--primary) 10%, var(--bg-card))' : 'var(--bg-card)',color:'var(--text-main)',cursor:active ? 'default' : 'pointer',font:'inherit'});
export function ProfileSwitcher() {
 const { language } = useLanguage(); const text=labels[language] || labels['pt-BR'];
 const { currentUser, persistSession } = useAuth(); const navigate=useNavigate();
 const { getMyUserRoles }=useGymManagementApi();
 const [apiRoles,setApiRoles]=useState([]);const [error,setError]=useState(false);const [revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;getMyUserRoles().then(result=>{if(active){setApiRoles([...new Set((result.items || result || []).map(item=>item.role).filter(role=>roles[role]))]);setError(false);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[getMyUserRoles,revision]);
 const available=[...new Set(apiRoles.map(role=>roles[role]))];
 const both=apiRoles.includes('Trainer') && apiRoles.includes('Nutritionist');
 const names={professional:both ? text[16] : (apiRoles.includes('Nutritionist') && !apiRoles.includes('Trainer') ? text[15] : text[2]),gym:text[3],independent:text[4],client:text[5]};
 const hints={professional:text[17],gym:text[18],independent:text[19],client:text[20]};
 const current=localStorage.getItem('shapeup_role') || '';
 const choose=role=>{if(role===current || !currentUser)return;persistSession(currentUser,currentUser.email,role);navigate('/dashboard');};
 return <div style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border-color)'}}><p id="active-profile-label" style={{display:'block',fontWeight:600,margin:0}}>{text[0]}</p><p style={{fontSize:13,color:'var(--text-muted)',margin:'6px 0 12px'}}>{text[1]}</p>{error ? <p role="alert">{text[6]} <button type="button" style={buttonStyle} onClick={()=>setRevision(value=>value+1)}>{text[7]}</button></p> : <div role="radiogroup" aria-labelledby="active-profile-label" style={{display:'grid',gap:8}}>{available.map(role=>{const active=role===current;return <button key={role} type="button" role="radio" aria-checked={active} style={optionStyle(active)} onClick={()=>choose(role)}><span style={{flex:1,minWidth:0,display:'grid'}}><strong style={{fontSize:16}}>{names[role]}</strong><small style={{color:'var(--text-muted)',fontSize:13}}>{hints[role]}</small></span>{active && <span style={{flex:'none',padding:'3px 10px',borderRadius:999,background:'var(--primary-solid)',color:'#fff8f5',fontSize:12,fontWeight:700}}>{text[14]}</span>}</button>;})}</div>}</div>;
}
export function ProfilePhoto() {
 const { language }=useLanguage();const text=labels[language] || labels['pt-BR'];const profile=useUserProfile();const { updateProfilePhoto }=useAuth();const input=useRef(null);
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null);
 const upload=async file=>{setBusy(true);setNotice(null);try{await updateProfilePhoto(file);setNotice(13);}catch(error){setNotice(error.message==='profile/invalid-photo'?11:12);}finally{setBusy(false);if(input.current)input.current.value='';}};
 return <div><div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}><ProfileAvatar name={profile.name} photo={profile.photo} size={64} style={{border:'1px solid var(--border-color)'}}/><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event=>{const file=event.target.files?.[0];if(file)upload(file);}}/><button type="button" style={buttonStyle} disabled={busy} onClick={()=>input.current.click()}>{busy?text[10]:text[8]}</button>{profile.photo && <button type="button" style={buttonStyle} disabled={busy} onClick={()=>upload(null)}>{text[9]}</button>}</div><p style={{fontSize:12,color:'var(--text-muted)',marginTop:8}}>{text[11]}</p>{notice!==null && <p role={notice===13?'status':'alert'}>{text[notice]}</p>}</div>;
}
