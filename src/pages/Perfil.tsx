import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Briefcase, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function Perfil() {
  const navigate = useNavigate();
  const { usuario, logout } = useApp();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero pt-safe px-6 py-6">
        <h1 className="text-white text-2xl font-bold">Perfil</h1>
        <p className="text-white/90 text-sm mt-1">Suas configurações</p>
      </div>

      {/* Profile info */}
      <div className="px-6 py-6">
        <div className="card-flat p-6 mb-6 text-center">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">
              {usuario?.nome?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1">{usuario?.nome}</h2>
          <p className="text-muted-foreground">{usuario?.email}</p>
        </div>

        {/* Business Info */}
        {usuario?.profissao && (
          <div className="card-flat p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Profissão</p>
                <p className="font-semibold">{usuario.profissao}</p>
              </div>
            </div>
            {usuario.nomeNegocio && (
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Negócio</p>
                  <p className="font-semibold">{usuario.nomeNegocio}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            className="w-full h-14 justify-start text-left"
            onClick={() => toast.info('Em breve!')}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Configurações</span>
          </Button>
        </div>

        <Button
          variant="destructive"
          className="w-full h-14"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
