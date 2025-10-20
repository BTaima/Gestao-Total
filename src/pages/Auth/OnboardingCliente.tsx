import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User2, KeyRound, Palette } from 'lucide-react';

export default function OnboardingCliente() {
  const navigate = useNavigate();
  const { vincularClientePorCodigo } = useApp();
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cor, setCor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error('Informe seu nome');
      return;
    }
    let ok = true;
    if (codigo.trim()) {
      setLoading(true);
      ok = await vincularClientePorCodigo(codigo.trim());
      setLoading(false);
    }
    if (ok) {
      localStorage.setItem('cliente_app_cor', cor);
      toast.success('Perfil de cliente configurado!');
      navigate('/cliente/home');
    } else {
      toast.error('Código inválido ou erro ao vincular');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="pt-safe px-6 py-6 text-center">
        <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <User2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Entrar como Cliente</h1>
        <p className="text-muted-foreground">Vincule-se a um estabelecimento (opcional)</p>
      </div>

      <div className="flex-1 px-6 pb-8 -mt-2">
        <div className="bg-card rounded-2xl shadow-xl p-6 space-y-4">
          <div>
            <Label>Seu nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maria Silva" />
          </div>
          <div>
            <Label>Código de acesso do estabelecimento (opcional)</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input className="pl-10" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: ABC123" />
            </div>
          </div>
          <div>
            <Label>Cor do app (opcional)</Label>
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <Input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-16 h-10 p-1" />
            </div>
          </div>
          <Button onClick={handleSalvar} className="w-full btn-gradient h-12" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
