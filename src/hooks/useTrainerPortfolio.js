import { useEffect, useState } from 'react';
import { useGymManagementApi } from './api/useGymManagementApi';
import { useAuthorizationApi } from './api/useAuthorizationApi';
import { readAllPages } from '../utils/readAllPages';
export function useTrainerPortfolio() {
 const {getTrainerClients,getTrainerPlans}=useGymManagementApi();
 const {getMe}=useAuthorizationApi();
 const [data,setData]=useState({clients:[],plans:[],loading:true,error:false});
 useEffect(()=>{let active=true;getMe().then(async me=>{
  const clients=await readAllPages(cursor=>getTrainerClients(me.userId || me.id,cursor));
  const plans=await readAllPages(cursor=>getTrainerPlans(me.userId || me.id,cursor));
  if(active)setData({clients:clients.map(item=>({...item,id:item.clientId,name:item.clientName,email:item.email || '',activePlan:item.planName,compliance:item.adherencePercentage,joinDate:item.enrolledAt,billingPlanId:plans.find(plan=>plan.name===item.planName)?.id,billingType:'plan'})),plans,loading:false,error:false});
 }).catch(()=>{if(active)setData({clients:[],plans:[],loading:false,error:true});});return()=>{active=false;};},[getMe,getTrainerClients,getTrainerPlans]);
 return data;
}
