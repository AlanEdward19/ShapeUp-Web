import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';

const roles = { Trainer: 'professional', GymOwner: 'gym', IndependentClient: 'independent', Client: 'client', GymClient: 'client' };
const labels = {
 'pt-BR': ['Perfil ativo','Troque entre os perfis já vinculados à sua conta.','Personal trainer','Dono de academia','Atleta independente','Atleta acompanhado','Não foi possível carregar seus perfis.','Tentar novamente','Alterar foto','Remover foto','Enviando…','Use JPG, PNG ou WebP de até 2 MB.','Não foi possível salvar a foto. Tente novamente.','Foto atualizada.'],
 en: ['Active profile','Switch between profiles already linked to your account.','Personal trainer','Gym owner','Independent athlete','Coached athlete','Could not load your profiles.','Try again','Change photo','Remove photo','Uploading…','Use JPG, PNG or WebP up to 2 MB.','Could not save the photo. Please try again.','Photo updated.'],
 es: ['Perfil activo','Cambia entre los perfiles ya vinculados a tu cuenta.','Entrenador personal','Dueño de gimnasio','Atleta independiente','Atleta con entrenador','No se pudieron cargar tus perfiles.','Reintentar','Cambiar foto','Eliminar foto','Subiendo…','Usa JPG, PNG o WebP de hasta 2 MB.','No se pudo guardar la foto. Inténtalo de nuevo.','Foto actualizada.']
};
const buttonStyle = {padding:'8px 12px',border:'1px solid var(--border-color)',borderRadius:5,background:'#211a17',color:'var(--text-main)',cursor:'pointer'};
export function ProfileSwitcher() {
 const { language } = useLanguage(); const text=labels[language] || labels['pt-BR'];
 const { currentUser, persistSession } = useAuth(); const navigate=useNavigate();
 const { getMyUserRoles }=useGymManagementApi();
 const [available,setAvailable]=useState([]);const [error,setError]=useState(false);const [revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;getMyUserRoles().then(result=>{if(active){setAvailable([...new Set((result.items || result || []).map(item=>roles[item.role]).filter(Boolean))]);setError(false);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[getMyUserRoles,revision]);
 const names={professional:text[2],gym:text[3],independent:text[4],client:text[5]};
 return <div style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border-color)'}}><label htmlFor="active-profile" style={{display:'block',fontWeight:600}}>{text[0]}</label><p style={{fontSize:13,color:'#968882',margin:'6px 0 12px'}}>{text[1]}</p>{error ? <p role="alert">{text[6]} <button type="button" style={buttonStyle} onClick={()=>setRevision(value=>value+1)}>{text[7]}</button></p> : <select id="active-profile" style={buttonStyle} value={localStorage.getItem('shapeup_role') || ''} disabled={!available.length} onChange={event=>{if(!available.includes(event.target.value) || !currentUser)return;persistSession(currentUser,currentUser.email,event.target.value);navigate('/dashboard');}}>{!available.includes(localStorage.getItem('shapeup_role')) && <option value={localStorage.getItem('shapeup_role') || ''}>—</option>}{available.map(role=><option key={role} value={role}>{names[role]}</option>)}</select>}</div>;
}
export function ProfilePhoto() {
 const { language }=useLanguage();const text=labels[language] || labels['pt-BR'];const profile=useUserProfile();const { updateProfilePhoto }=useAuth();const input=useRef(null);
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null);
 const upload=async file=>{setBusy(true);setNotice(null);try{await updateProfilePhoto(file);setNotice(13);}catch(error){setNotice(error.message==='profile/invalid-photo'?11:12);}finally{setBusy(false);if(input.current)input.current.value='';}};
 return <div><div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>{profile.photo ? <img src={profile.photo} alt="" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover'}}/> : <span style={{width:64,height:64,borderRadius:'50%',display:'grid',placeItems:'center',background:'#29211d',color:'#e06c43'}}>{profile.initials}</span>}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event=>{const file=event.target.files?.[0];if(file)upload(file);}}/><button type="button" style={buttonStyle} disabled={busy} onClick={()=>input.current.click()}>{busy?text[10]:text[8]}</button>{profile.photo && <button type="button" style={buttonStyle} disabled={busy} onClick={()=>upload(null)}>{text[9]}</button>}</div><p style={{fontSize:12,color:'#968882',marginTop:8}}>{text[11]}</p>{notice!==null && <p role={notice===13?'status':'alert'}>{text[notice]}</p>}</div>;
}
