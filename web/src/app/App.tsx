import { UserDashboard } from '../features/users/pages/UserDashboard';
import { TenantApprovals } from '../features/tenants/pages/TenantApprovals';
import { TenantRegistrationPage } from '../features/tenants/pages/TenantRegistrationPage';
import { AuthPage } from '../features/auth/pages/AuthPage';
import { RoleDashboard } from '../features/dashboard/pages/RoleDashboard';
import { RoleMembersPage } from '../features/people/pages/RoleMembersPage';
import { LandingPage } from '../features/marketing/pages/LandingPage';

export function App() {
  const path=window.location.pathname;
  if(path==='/')return localStorage.getItem('ai_lms_token')?(new URLSearchParams(window.location.search).get('view')==='tenants'?<TenantApprovals/>:<UserDashboard/>):<LandingPage/>;
  if(path==='/tenant-register')return <TenantRegistrationPage/>;
  if(path==='/signup')return <AuthPage mode="signup"/>;
  if(path==='/signin')return <AuthPage mode="signin"/>;
  if(path==='/forgot-password')return <AuthPage mode="forgot"/>;
  if(path==='/reset-password')return <AuthPage mode="reset"/>;
  if(path==='/change-password')return <AuthPage mode="change"/>;
  if(path==='/super-admin')return <RoleDashboard role="super"/>;
  if(path==='/super-admin/users')return <UserDashboard/>;
  if(path==='/super-admin/tenants')return <TenantApprovals/>;
  if(path==='/super-admin/admins')return <RoleMembersPage kind="administrators"/>;
  if(path==='/admin')return <RoleDashboard role="admin"/>;
  if(path==='/admin/teachers'||path==='/tenant/teachers')return <RoleMembersPage kind="teachers"/>;
  if(path==='/tenant')return <RoleDashboard role="tenant"/>;
  return <LandingPage/>;
}
