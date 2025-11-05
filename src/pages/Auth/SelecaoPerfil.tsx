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
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const { ingressarComoProfissionalPorCodigo } = useApp();

  const handleContinuar = async () => {
    if (perfilSelecionado === 'admin') {
      navigate('/onboarding-setup');
      return;
    }
    if (perfilSelecionado === 'profissional') {
      if (!codigo.trim()) {
        toast.error('Digite o código de acesso do administrador');
        return;
      }
      const ok = await ingressarComoProfissionalPorCodigo(codigo.trim());
      if (ok) {
        toast.success('Vínculo criado!');
        navigate('/onboarding-profissional');
      } else {
        toast.error('Código inválido ou erro ao vincular');
      }
      return;
    }
    if (perfilSelecionado === 'cliente') {
      navigate('/onboarding-cliente');
      return;
    }
  };

  if (!perfilSelecionado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-2">Como você quer usar?</h1>
          <p className="text-muted-foreground text-center mb-8">Escolha seu tipo de conta</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg" onClick={() => setPerfilSelecionado('admin')}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Administrador</h3>
                  <p className="text-sm text-muted-foreground">Criar estabelecimento e gerenciar tudo</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg" onClick={() => setPerfilSelecionado('profissional')}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Profissional</h3>
                  <p className="text-sm text-muted-foreground">Ingressar com código do administrador</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg" onClick={() => setPerfilSelecionado('cliente')}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cliente</h3>
                  <p className="text-sm text-muted-foreground">Vincular com código e agendar</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <Button variant="ghost" onClick={() => setPerfilSelecionado(null)} className="mb-4">← Voltar</Button>
        <h2 className="text-2xl font-bold mb-6">
          {perfilSelecionado === 'admin' && 'Começar como Administrador'}
          {perfilSelecionado === 'profissional' && 'Ingressar como Profissional'}
          {perfilSelecionado === 'cliente' && 'Continuar como Cliente'}
        </h2>

        {perfilSelecionado === 'profissional' && (
          <div className="space-y-4 mb-4">
            <div>
              <Label>Código de acesso do administrador</Label>
              <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: ABC123" />
            </div>
          </div>
        )}

        <Button onClick={handleContinuar} className="w-full">
          Continuar
        </Button>
      </Card>
    </div>
  );
}
