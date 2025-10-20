import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Briefcase, KeyRound } from 'lucide-react';

export default function OnboardingProfissional() {
  const navigate = useNavigate();
  const { vincularProfissionalPorCodigo } = useApp();
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVincular = async () => {
    if (!codigo.trim()) {
      toast.error('Informe o código do administrador');
      return;
    }
    setLoading(true);
    const ok = await vincularProfissionalPorCodigo(codigo.trim(), nome || undefined, telefone || undefined);
    setLoading(false);
    if (ok) {
      toast.success('Vinculado como profissional!');
      navigate('/agenda');
    } else {
      toast.error('Não foi possível vincular com esse código');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="pt-safe px-6 py-6 text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Entrar como Profissional</h1>
        <p className="text-muted-foreground">Use o código fornecido pelo administrador</p>
      </div>

      <div className="flex-1 px-6 pb-8 -mt-2">
        <div className="bg-card rounded-2xl shadow-xl p-6 space-y-4">
          <div>
            <Label>Código de acesso do estabelecimento</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input className="pl-10" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: ABC123" />
            </div>
          </div>
          <div>
            <Label>Seu nome (opcional)</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como aparecerá aos clientes" />
          </div>
          <div>
            <Label>Seu telefone (opcional)</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <Button onClick={handleVincular} className="w-full btn-gradient h-12" disabled={loading}>
            {loading ? 'Vinculando...' : 'Vincular e continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
