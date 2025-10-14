import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function VincularCliente() {
  const { vincularClientePorCodigo, usuario } = useApp();
  const [codigo, setCodigo] = useState('');

  const handleVincular = async () => {
    if (!codigo.trim()) {
      toast.error('Digite o código do estabelecimento');
      return;
    }
    const ok = await vincularClientePorCodigo(codigo.trim());
    if (ok) {
      toast.success('Vinculado ao estabelecimento com sucesso!');
    } else {
      toast.error('Código inválido ou erro ao vincular');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">Vincular ao Estabelecimento</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Peça ao administrador o código de acesso e insira abaixo para ver os serviços.
          </p>
          <div className="space-y-3">
            <div>
              <Label>Código de acesso</Label>
              <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="ex: a1b2c3d4" />
            </div>
            <Button onClick={handleVincular} className="w-full">Vincular</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
