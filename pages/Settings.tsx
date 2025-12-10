import React, { useState, useRef } from 'react';
import { Tenant, User, UserRole, ThemeConfig, SecurityConfig, CommitteeMember } from '../types';
import { Building2, Palette, Users, Shield, Save, Plus, Trash2, Upload, X, UserPlus } from 'lucide-react';

interface SettingsProps {
  tenant: Tenant;
  users: User[];
  onUpdateTenant: (updatedTenant: Tenant) => void;
  onAddUser: (user: Omit<User, 'id' | 'tenantId'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

type Tab = 'profile' | 'branding' | 'users' | 'security';

export const Settings: React.FC<SettingsProps> = ({ 
  tenant, 
  users, 
  onUpdateTenant, 
  onAddUser, 
  onUpdateUser,
  onDeleteUser 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // --- Sub-components for Tabs ---

  const ProfileTab = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
      name: tenant.name,
      cnpj: tenant.cnpj,
      contactEmail: tenant.contactEmail || '',
      dpoName: tenant.settings?.dpoName || '',
      dpoEmail: tenant.settings?.dpoEmail || '',
      logoUrl: tenant.settings?.theme?.logoUrl || ''
    });

    // Committee State
    const [committee, setCommittee] = useState<CommitteeMember[]>(tenant.settings?.privacyCommittee || []);
    const [newMember, setNewMember] = useState({ name: '', function: '', email: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Create a fake local URL/Base64 for the session
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logoUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddMember = () => {
        if (!newMember.name || !newMember.function || !newMember.email) return;
        const member: CommitteeMember = {
            id: Math.random().toString(36).substr(2, 9),
            name: newMember.name,
            function: newMember.function,
            email: newMember.email
        };
        setCommittee([...committee, member]);
        setNewMember({ name: '', function: '', email: '' });
    };

    const handleRemoveMember = (id: string) => {
        setCommittee(committee.filter(m => m.id !== id));
    };

    const handleSave = () => {
      onUpdateTenant({
        ...tenant,
        name: formData.name,
        contactEmail: formData.contactEmail,
        settings: {
          ...tenant.settings,
          dpoName: formData.dpoName,
          dpoEmail: formData.dpoEmail,
          privacyCommittee: committee,
          // Preserve other theme settings but update logo
          theme: {
              primaryColor: tenant.settings?.theme?.primaryColor || '#10b981',
              sidebarColor: tenant.settings?.theme?.sidebarColor || '#0f172a',
              sidebarTextColor: tenant.settings?.theme?.sidebarTextColor || '#ffffff',
              logoUrl: formData.logoUrl
          }
        }
      });
      alert('Perfil, Logotipo e Comitê atualizados com sucesso!');
    };

    return (
      <div className="max-w-3xl animate-fade-in pb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Dados da Organização</h2>
        
        {/* Logo Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="shrink-0 relative group">
                <div className="w-32 h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                    {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Empresa" className="w-full h-full object-contain p-2" />
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-xs text-gray-400">Sem Logo</span>
                        </div>
                    )}
                </div>
                {formData.logoUrl && (
                    <button 
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 transition-colors"
                        title="Remover Logo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <div className="flex-1 space-y-3">
                <h3 className="font-semibold text-gray-800">Logotipo da Empresa</h3>
                <p className="text-sm text-gray-500">
                    Este logotipo será exibido no canto superior esquerdo do sistema e no cabeçalho dos relatórios PDF gerados.
                </p>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        Carregar Imagem
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    <div className="text-xs text-gray-400">
                        <p>Recomendado: <span className="font-medium text-gray-600">200x200px</span></p>
                        <p>Formato: <span className="font-medium text-gray-600">PNG</span> (Fundo Transparente)</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input name="cnpj" value={formData.cnpj} disabled className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-500 cursor-not-allowed" />
             </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
              <input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          
          <div className="border-t border-gray-100 pt-6 mt-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados do Encarregado (DPO)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo do DPO</label>
                    <input name="dpoName" value={formData.dpoName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Dr. João Silva" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Contato DPO</label>
                    <input name="dpoEmail" type="email" value={formData.dpoEmail} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="dpo@empresa.com" />
                </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">Estes dados aparecerão automaticamente em políticas de privacidade e documentos gerados.</p>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Comitê de Privacidade e Grupo de Apoio
            </h3>
            <p className="text-sm text-gray-500 mb-4">Cadastre os membros responsáveis pela governança de dados na empresa.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome do Membro</label>
                        <input 
                            value={newMember.name} 
                            onChange={e => setNewMember({...newMember, name: e.target.value})}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="Nome"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Função</label>
                        <input 
                            value={newMember.function} 
                            onChange={e => setNewMember({...newMember, function: e.target.value})}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="Ex: Jurídico, TI, RH"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">E-mail</label>
                        <input 
                            value={newMember.email} 
                            onChange={e => setNewMember({...newMember, email: e.target.value})}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="email@empresa.com"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleAddMember}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" /> Adicionar Membro
                </button>
            </div>

            {committee.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                            <tr>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Função</th>
                                <th className="p-3">E-mail</th>
                                <th className="p-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {committee.map(member => (
                                <tr key={member.id}>
                                    <td className="p-3 font-medium text-gray-900">{member.name}</td>
                                    <td className="p-3 text-gray-600">{member.function}</td>
                                    <td className="p-3 text-gray-500">{member.email}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm italic py-4">Nenhum membro adicionado ao comitê.</p>
            )}
          </div>

          <div className="pt-6">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BrandingTab = () => {
    const defaultTheme: ThemeConfig = {
      primaryColor: '#10b981',
      sidebarColor: '#0f172a',
      sidebarTextColor: '#ffffff',
      logoUrl: ''
    };

    const [theme, setTheme] = useState<ThemeConfig>(tenant.settings?.theme || defaultTheme);

    const handleColorChange = (key: keyof ThemeConfig, value: string) => {
        setTheme({ ...theme, [key]: value });
    };

    const handleSave = () => {
        onUpdateTenant({
            ...tenant,
            settings: {
                ...tenant.settings,
                theme: {
                    ...theme,
                    logoUrl: tenant.settings?.theme?.logoUrl || '' // Preserve logo from Profile tab
                }
            }
        });
        alert('Cores do tema atualizadas!');
    };

    return (
        <div className="max-w-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Personalização de Cores</h2>
            <p className="text-sm text-gray-500 mb-6">Ajuste as cores do sistema para combinar com a identidade visual da sua marca.</p>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária (Botões)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={theme.primaryColor} 
                                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0 p-0" 
                            />
                            <span className="text-sm font-mono text-gray-600 uppercase">{theme.primaryColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fundo da Barra Lateral</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={theme.sidebarColor} 
                                onChange={(e) => handleColorChange('sidebarColor', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0 p-0" 
                            />
                            <span className="text-sm font-mono text-gray-600 uppercase">{theme.sidebarColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto da Barra Lateral</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={theme.sidebarTextColor} 
                                onChange={(e) => handleColorChange('sidebarTextColor', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0 p-0" 
                            />
                            <span className="text-sm font-mono text-gray-600 uppercase">{theme.sidebarTextColor}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Pré-visualização do Tema</p>
                    <div className="flex gap-4 items-stretch">
                        <div className="w-40 rounded-l-lg shadow-sm flex flex-col p-3 gap-3" style={{ backgroundColor: theme.sidebarColor, color: theme.sidebarTextColor }}>
                            {tenant.settings?.theme?.logoUrl ? (
                                <img src={tenant.settings.theme.logoUrl} className="w-6 h-6 object-contain mb-1" alt="Logo" />
                            ) : (
                                <div className="w-6 h-6 rounded bg-white/20 mb-1"></div>
                            )}
                            <div className="h-2 bg-white/20 rounded w-3/4"></div>
                            <div className="h-2 bg-white/20 rounded w-1/2"></div>
                            <div className="h-2 bg-white/20 rounded w-2/3"></div>
                            <div className="mt-auto flex items-center gap-2 opacity-60">
                                <div className="w-6 h-6 rounded-full bg-white/20"></div>
                                <div className="h-2 bg-white/20 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white rounded-r-lg shadow-sm p-6 flex flex-col items-start justify-center border-y border-r border-gray-200 gap-4">
                             <h4 className="font-bold text-gray-800 text-lg">Exemplo de Conteúdo</h4>
                             <p className="text-sm text-gray-500">Esta é uma demonstração de como as cores escolhidas afetarão a interface do usuário.</p>
                             <div className="flex gap-2">
                                <button className="px-4 py-2 rounded text-white text-sm font-medium shadow-sm" style={{ backgroundColor: theme.primaryColor }}>Ação Principal</button>
                                <button className="px-4 py-2 rounded text-gray-600 bg-gray-100 text-sm font-medium hover:bg-gray-200">Cancelar</button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        <Save className="w-4 h-4" /> Atualizar Cores
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const UsersTab = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.USER });

    const handleAdd = () => {
        onAddUser({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            isActive: true,
            avatarUrl: ''
        });
        setIsAdding(false);
        setNewUser({ name: '', email: '', role: UserRole.USER });
    };

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                <button 
                    onClick={() => setIsAdding(true)} 
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Novo Usuário
                </button>
             </div>

             {isAdding && (
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-inner">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome</label>
                        <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nome do usuário" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">E-mail</label>
                        <input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="email@empresa.com" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Função</label>
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option value={UserRole.USER}>Usuário</option>
                            <option value={UserRole.DPO}>DPO</option>
                            <option value={UserRole.COMPANY_ADMIN}>Admin</option>
                        </select>
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                        <button onClick={handleAdd} className="flex-1 bg-emerald-600 text-white p-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Adicionar</button>
                        <button onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 p-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                    </div>
                 </div>
             )}

             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm border-b border-gray-100">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Função</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-900 font-medium">{user.name}</td>
                                <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                        user.role === UserRole.COMPANY_ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        user.role === UserRole.DPO ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>
                                        {user.role === UserRole.COMPANY_ADMIN ? 'Admin' : user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {user.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onDeleteUser(user.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Remover acesso">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
  };

  const SecurityTab = () => {
    const defaultSecurity: SecurityConfig = { mfaEnabled: false, sessionTimeoutMinutes: 30, passwordPolicy: 'standard' };
    const [config, setConfig] = useState<SecurityConfig>(tenant.settings?.security || defaultSecurity);

    const handleSave = () => {
        onUpdateTenant({
            ...tenant,
            settings: { ...tenant.settings, security: config }
        });
        alert('Políticas de segurança atualizadas.');
    };

    return (
        <div className="max-w-3xl animate-fade-in">
             <h2 className="text-xl font-bold text-gray-800 mb-6">Segurança e Acesso</h2>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base">Autenticação de Dois Fatores (MFA)</h3>
                        <p className="text-sm text-gray-500 mt-1">Exigir código via app autenticador para todos os administradores e DPOs no próximo login.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={config.mfaEnabled} onChange={e => setConfig({...config, mfaEnabled: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base">Timeout de Sessão</h3>
                        <p className="text-sm text-gray-500 mt-1">Tempo de inatividade permitido antes de realizar o logout automático do usuário.</p>
                    </div>
                    <select 
                        value={config.sessionTimeoutMinutes}
                        onChange={e => setConfig({...config, sessionTimeoutMinutes: parseInt(e.target.value)})}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none"
                    >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={240}>4 horas</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        <Shield className="w-4 h-4" /> Atualizar Políticas de Segurança
                    </button>
                </div>
             </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
         <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
         <p className="text-gray-500">Gerencie o perfil da empresa, usuários e preferências do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 h-full">
         {/* Navigation Tabs */}
         <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
            <nav className="flex flex-col">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Building2 className="w-4 h-4" /> Perfil da Empresa
                </button>
                <button 
                    onClick={() => setActiveTab('branding')}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${activeTab === 'branding' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Palette className="w-4 h-4" /> Personalização
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Users className="w-4 h-4" /> Usuários e Acesso
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Shield className="w-4 h-4" /> Segurança
                </button>
            </nav>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
             {activeTab === 'profile' && <ProfileTab />}
             {activeTab === 'branding' && <BrandingTab />}
             {activeTab === 'users' && <UsersTab />}
             {activeTab === 'security' && <SecurityTab />}
         </div>
      </div>
    </div>
  );
};