import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RopaManager } from './pages/RopaManager';
import { IncidentManager } from './pages/IncidentManager';
import { LegalGenerator } from './pages/LegalGenerator';
import { AwarenessModule } from './pages/AwarenessModule';
import { Settings } from './pages/Settings';
import { User, Tenant, UserRole, RopaEntry, Incident, IncidentSeverity, IncidentStatus, MOCK_TENANT_ID, MOCK_CNPJ, LegalDoc, DocType, AwarenessPost, AwarenessCategory } from './types';
import { ShieldCheck } from 'lucide-react';

const App = () => {
  // --- Global State (Simulating Backend) ---
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [view, setView] = useState('dashboard');
  
  // Mock Database State
  const [ropas, setRopas] = useState<RopaEntry[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDoc[]>([]);
  const [awarenessPosts, setAwarenessPosts] = useState<AwarenessPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Simulate Login
  const handleLogin = () => {
    // In a real app, this would be Google OAuth response
    const mockTenant: Tenant = {
      id: MOCK_TENANT_ID,
      cnpj: MOCK_CNPJ,
      name: "Acme Corp Ltda.",
      planStatus: 'active',
      createdAt: new Date().toISOString(),
      settings: {
        dpoName: "Dr. João Silva",
        dpoEmail: "dpo@acmecorp.com",
        privacyCommittee: [
            { id: 'cm-1', name: 'Maria Souza', function: 'RH', email: 'maria.rh@acmecorp.com' },
            { id: 'cm-2', name: 'Carlos Tech', function: 'CTO', email: 'carlos.ti@acmecorp.com' }
        ],
        theme: {
            primaryColor: '#059669', // Emerald-600
            sidebarColor: '#1e293b', // Slate-800
            sidebarTextColor: '#ffffff'
        }
      }
    };

    const mockUser: User = {
      id: 'user-1',
      tenantId: MOCK_TENANT_ID,
      email: 'admin@acmecorp.com',
      name: 'Alice Admin',
      role: UserRole.COMPANY_ADMIN,
      isActive: true
    };

    setTenant(mockTenant);
    setUser(mockUser);
    
    // Seed initial data if empty
    if (ropas.length === 0) {
      setRopas([
        { id: '1', tenantId: MOCK_TENANT_ID, processName: 'Folha de Pagamento', department: 'RH', dataTypes: ['Nome', 'CPF', 'Dados Bancários'], dataSubjects: 'Funcionários', legalBasis: 'Execução de Contrato', retentionPeriod: '5 Anos', updatedAt: new Date().toISOString() },
        { id: '2', tenantId: MOCK_TENANT_ID, processName: 'Email Marketing', department: 'Marketing', dataTypes: ['Email', 'Nome'], dataSubjects: 'Leads', legalBasis: 'Consentimento', retentionPeriod: 'Até Revogação', updatedAt: new Date().toISOString() }
      ]);
    }

    // Seed initial docs
    if (legalDocs.length === 0) {
        setLegalDocs([
            {
                id: 'doc-1',
                tenantId: MOCK_TENANT_ID,
                title: 'Política de Privacidade v1',
                content: '<h1>Política de Privacidade</h1><p>Esta é uma versão de rascunho...</p>',
                type: DocType.PRIVACY_POLICY,
                version: 1,
                isPublished: false,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ]);
    }

    // Seed initial awareness posts
    if (awarenessPosts.length === 0) {
        setAwarenessPosts([
            {
                id: 'post-1',
                tenantId: MOCK_TENANT_ID,
                title: '🔒 A Importância de Senhas Fortes',
                content: '## Proteja suas credenciais\n\nVocê sabia que "123456" ainda é uma das senhas mais comuns? Para garantir a segurança dos dados da nossa empresa (e os seus pessoais), siga estas dicas:\n\n- Use no mínimo 12 caracteres.\n- Misture letras maiúsculas, minúsculas, números e símbolos.\n- Nunca reutilize senhas do trabalho em sites pessoais.\n\n**Fique seguro!**',
                category: AwarenessCategory.SECURITY,
                isPublished: true,
                viewCount: 42,
                date: new Date(Date.now() - 172800000).toISOString(),
                quiz: {
                    question: "Qual a recomendação mínima de caracteres para uma senha forte?",
                    options: ["4 caracteres", "8 caracteres", "12 caracteres", "6 caracteres"],
                    correctAnswerIndex: 2,
                    explanation: "Senhas com 12 ou mais caracteres são exponencialmente mais difíceis de quebrar."
                }
            },
            {
                id: 'post-2',
                tenantId: MOCK_TENANT_ID,
                title: '🎣 Alerta de Phishing: Fique Atento',
                content: '## Não morda a isca!\n\nRecebemos relatos de e-mails suspeitos fingindo ser do suporte de TI. Lembre-se:\n\n1. Verifique sempre o remetente.\n2. Não clique em links estranhos.\n3. Nunca solicitaremos sua senha por e-mail.\n\nNa dúvida, contate o DPO.',
                category: AwarenessCategory.SECURITY,
                isPublished: true,
                viewCount: 15,
                date: new Date().toISOString(),
                quiz: {
                    question: "O que você deve fazer ao receber um e-mail suspeito pedindo sua senha?",
                    options: ["Responder com a senha antiga", "Clicar no link para verificar", "Ignorar e reportar ao DPO/TI", "Encaminhar para todos os colegas"],
                    correctAnswerIndex: 2,
                    explanation: "Nunca compartilhe senhas. Reporte imediatamente ao time de segurança."
                }
            }
        ]);
    }

    // Seed Users for Settings
    if (users.length === 0) {
        setUsers([
            mockUser,
            { id: 'user-2', tenantId: MOCK_TENANT_ID, email: 'bob@acmecorp.com', name: 'Bob Silva', role: UserRole.USER, isActive: true },
            { id: 'user-3', tenantId: MOCK_TENANT_ID, email: 'carol@acmecorp.com', name: 'Carol DPO', role: UserRole.DPO, isActive: true }
        ]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTenant(null);
    setView('dashboard');
  };

  // --- Render Views ---
  const renderView = () => {
    if (!tenant || !user) return null;

    switch (view) {
      case 'dashboard':
        return <Dashboard ropas={ropas} incidents={incidents} />;
      case 'ropa':
        return (
          <RopaManager 
            entries={ropas}
            onAdd={(entry) => setRopas([...ropas, { ...entry, id: Math.random().toString(36).substr(2, 9), tenantId: tenant.id, updatedAt: new Date().toISOString() }])}
            onUpdate={(id, entry) => setRopas(ropas.map(r => r.id === id ? { ...r, ...entry, updatedAt: new Date().toISOString() } : r))}
            onDelete={(id) => setRopas(ropas.filter(r => r.id !== id))}
          />
        );
      case 'incidents':
        return (
          <IncidentManager 
            currentUser={user}
            incidents={incidents}
            onReport={(inc) => setIncidents([ { ...inc, id: Math.random().toString(36).substr(2, 9), tenantId: tenant.id, dateReported: new Date().toISOString() }, ...incidents])}
            onUpdate={(updatedIncident) => setIncidents(incidents.map(i => i.id === updatedIncident.id ? updatedIncident : i))}
          />
        );
      case 'documents':
        return (
            <LegalGenerator 
                tenant={tenant}
                documents={legalDocs}
                onSaveDocument={(doc) => setLegalDocs([doc, ...legalDocs])}
                onUpdateDocument={(updatedDoc) => setLegalDocs(legalDocs.map(d => d.id === updatedDoc.id ? updatedDoc : d))}
                onDeleteDocument={(id) => setLegalDocs(legalDocs.filter(d => d.id !== id))}
            />
        );
      case 'awareness':
        return (
            <AwarenessModule 
                posts={awarenessPosts}
                currentUser={user}
                onNavigate={setView}
                onAddPost={(post) => setAwarenessPosts([ { ...post, id: Math.random().toString(36).substr(2, 9), tenantId: tenant.id, date: new Date().toISOString(), viewCount: 0 }, ...awarenessPosts])}
                onDeletePost={(id) => setAwarenessPosts(awarenessPosts.filter(p => p.id !== id))}
            />
        );
      case 'settings':
        return (
            <Settings 
                tenant={tenant}
                users={users}
                onUpdateTenant={(updated) => setTenant(updated)}
                onAddUser={(u) => setUsers([...users, { ...u, id: Math.random().toString(36).substr(2, 9), tenantId: tenant.id }])}
                onUpdateUser={(id, u) => setUsers(users.map(user => user.id === id ? { ...user, ...u } : user))}
                onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
            />
        );
      default:
        return <div>Página não encontrada</div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <ShieldCheck className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LGPD Guardian</h1>
          <p className="text-gray-500 mb-8">Plataforma de Conformidade Segura e Multilocatário.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Entrar com Google
          </button>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
            <p>Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
            <p className="mt-2">Simulando Fluxo OAuth 2.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      tenant={tenant} 
      currentView={view} 
      onNavigate={setView}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;