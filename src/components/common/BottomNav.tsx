import { Home, Calendar, Users, DollarSign, User, Settings, BarChart3, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

const getNavItemsByProfile = (isAdmin: boolean, isProfissional: boolean, isCliente: boolean) => {
  if (isAdmin) {
    return [
      { icon: Home, label: 'Dashboard', path: '/home' },
      { icon: Users, label: 'Profissionais', path: '/profissionais' },
      { icon: Calendar, label: 'Agenda', path: '/agenda' },
      { icon: DollarSign, label: 'Financeiro', path: '/financas' },
      { icon: Settings, label: 'Config', path: '/configuracoes' },
    ];
  }
  
  if (isProfissional) {
    return [
      { icon: Home, label: 'Início', path: '/home' },
      { icon: Calendar, label: 'Agenda', path: '/agenda' },
      { icon: Users, label: 'Clientes', path: '/clientes' },
      { icon: DollarSign, label: 'Finanças', path: '/financas' },
      { icon: User, label: 'Perfil', path: '/perfil' },
    ];
  }
  
  if (isCliente) {
    return [
      { icon: Home, label: 'Início', path: '/cliente/home' },
      { icon: Calendar, label: 'Agendar', path: '/agendar' },
      { icon: ClipboardList, label: 'Agendamentos', path: '/meus-agendamentos' },
      { icon: User, label: 'Perfil', path: '/perfil' },
    ];
  }
  
  return [];
};

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isProfissional, isCliente } = usePermissions();
  
  const navItems = getNavItemsByProfile(isAdmin, isProfissional, isCliente);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 bottom-nav-safe">
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors touch-feedback",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
