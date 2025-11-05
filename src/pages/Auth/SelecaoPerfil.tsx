import { useState } from 'react';
import { Crown, Briefcase, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type PerfilSelecionado = 'admin' | 'profissional' | 'cliente' | null;

export default function SelecaoPerfil() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilSelecionado>(null);
  const { usuario } = useApp();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Faça login para continuar.</p>
      </div>
    );
  }

  if (!perfilSelecionado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-2">Escolha seu perfil</h1>
          <p className="text-muted-foreground text-center mb-8">Selecione como você deseja usar o sistema</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
              onClick={() => {
                toast.success('Vamos configurar seu estabelecimento');
                navigate('/onboarding-setup');
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Dono/Administrador</h3>
                  <p className="text-sm text-muted-foreground">Gerencie seu estabelecimento, profissionais e clientes</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
              onClick={() => navigate('/onboarding-profissional')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Profissional</h3>
                  <p className="text-sm text-muted-foreground">Gerencie sua agenda e seus atendimentos</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
              onClick={() => navigate('/onboarding-cliente')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Cliente</h3>
                  <p className="text-sm text-muted-foreground">Agende serviços e acompanhe seus atendimentos</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
