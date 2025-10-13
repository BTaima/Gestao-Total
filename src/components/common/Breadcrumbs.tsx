import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
  '/home': 'Início',
  '/agenda': 'Agenda',
  '/profissionais': 'Profissionais',
  '/clientes': 'Clientes',
  '/financas': 'Finanças',
  '/configuracoes': 'Configurações',
  '/agendar': 'Agendar',
  '/meus-agendamentos': 'Meus Agendamentos',
  '/perfil': 'Perfil',
  '/relatorios': 'Relatórios',
  '/servicos': 'Serviços',
  '/avaliacoes': 'Avaliações'
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0 || location.pathname === '/home') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link to="/home" className="hover:text-foreground transition-colors">
        Início
      </Link>
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[routeTo] || pathname;

        return (
          <div key={routeTo} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
