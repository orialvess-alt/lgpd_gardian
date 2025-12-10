import { UserRole } from './types';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  BookOpen, 
  Scale, 
  Users, 
  Settings 
} from 'lucide-react';

export const APP_NAME = "LGPD Guardian";

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.DPO, UserRole.USER] },
  { id: 'ropa', label: 'Mapeamento ROPA', icon: FileText, roles: [UserRole.COMPANY_ADMIN, UserRole.DPO] },
  { id: 'incidents', label: 'Incidentes', icon: ShieldAlert, roles: [UserRole.COMPANY_ADMIN, UserRole.DPO, UserRole.USER] },
  { id: 'documents', label: 'Documentos', icon: Scale, roles: [UserRole.COMPANY_ADMIN, UserRole.DPO] },
  { id: 'awareness', label: 'Conscientização', icon: BookOpen, roles: [UserRole.COMPANY_ADMIN, UserRole.DPO, UserRole.USER] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: [UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN] },
];