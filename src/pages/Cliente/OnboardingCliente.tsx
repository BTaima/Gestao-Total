import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingCliente() {
  const { vincularClientePorCodigo } = useApp();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');

  const handleContinuar = async () => {
    if (!nome.trim()) {
      toast.error('Digite seu nome');
      return;
    }
    if (!codigo.trim()) {
      toast.error('Digite o código de acesso');
      return;
    }
    const ok = await vincularClientePorCodigo(codigo.trim());
    if (ok) {
      toast.success('Tudo pronto!');
      navigate('/cliente/home');
    } else {
      toast.error('Código inválido ou erro ao vincular');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-bold">Bem-vindo(a)!</h2>
        <div>
          <Label>Seu nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como devemos te chamar?" />
        </div>
        <div>
          <Label>Código de acesso do estabelecimento</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: ABC123" />
        </div>
        <Button onClick={handleContinuar} className="w-full">Continuar</Button>
      </Card>
    </div>
  );
}
