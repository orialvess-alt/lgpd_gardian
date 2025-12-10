import React from 'react';
import { User, Tenant, UserRole } from '../types';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants';
import { LogOut, Menu, User as UserIcon, Building2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  tenant: Tenant | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  tenant, 
  currentView, 
  onNavigate, 
  onLogout 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!user) {
    return <>{children}</>;
  }

  const authorizedItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(user.role)
  );

  // Dynamic Theme Styles
  const theme = tenant?.settings?.theme;
  const sidebarStyle = {
    backgroundColor: theme?.sidebarColor || '#0f172a', // slate-900 default
    color: theme?.sidebarTextColor || '#ffffff'
  };
  const primaryColor = theme?.primaryColor || '#10b981'; // emerald-500 default

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        style={sidebarStyle}
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-lg">
            {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
                <ShieldCheckIcon className="w-8 h-8" style={{ color: primaryColor }} />
            )}
            {isSidebarOpen && <span className="tracking-wide truncate max-w-[150px]">{tenant?.name || 'LGPD Guardian'}</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {authorizedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id 
                  ? 'text-white shadow-md' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              style={{
                backgroundColor: currentView === item.id ? primaryColor : 'transparent'
              }}
            >
              <item.icon className="w-5 h-5 min-w-[20px]" />
              {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                 <UserIcon className="w-5 h-5" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs opacity-60 truncate">{user.role}</p>
                </div>
              )}
            </div>
            <button 
              onClick={onLogout}
              className={`mt-4 w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-red-900/20 rounded transition-colors ${!isSidebarOpen && 'justify-center'}`}
            >
              <LogOut className="w-4 h-4" />
              {isSidebarOpen && "Sair"}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-6">
            {tenant && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                <Building2 className="w-4 h-4" />
                <span>{tenant.name}</span>
                <span className="text-blue-300">|</span>
                <span className="opacity-75">{tenant.cnpj}</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const ShieldCheckIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);