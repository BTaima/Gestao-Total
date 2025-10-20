import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingProfissional() {
  const { usuario, adicionarServico } = useApp();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([{ nome: '', valor: '', descricao: '' }, { nome: '', valor: '', descricao: '' }]);

  useEffect(() => {
    if (usuario?.tipo !== 'profissional') return;
    if (!usuario.estabelecimentoId) {
      toast.info('Vincule a um estabelecimento para continuar');
      navigate('/selecao-perfil');
    }
  }, [usuario?.tipo, usuario?.estabelecimentoId]);

  const addServico = () => setServicos([...servicos, { nome: '', valor: '', descricao: '' }]);

  const handleSalvar = async () => {
    if (!usuario?.estabelecimentoId) return;
    const preenchidos = servicos.filter(s => s.nome.trim());
    try {
      for (const s of preenchidos) {
        await adicionarServico({
          nome: s.nome.trim(),
          descricao: s.descricao || '',
          duracao: 60,
          valor: Number(s.valor) || 0,
          categoria: '',
          cor: '#6366f1',
          ativo: true,
          exigePagamentoAntecipado: false,
          destaque: false,
          profissionaisIds: [],
          estabelecimentoId: usuario.estabelecimentoId,
        });
      }
      toast.success('Serviços adicionados!');
      navigate('/agenda');
    } catch (e) {
      toast.error('Erro ao salvar serviços');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-bold">Configure seus serviços</h2>
        {servicos.map((s, i) => (
          <div key={i} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Serviço</Label>
                <Input value={s.nome} onChange={e => {
                  const arr = [...servicos];
                  arr[i].nome = e.target.value;
                  setServicos(arr);
                }} placeholder="Ex: Corte masculino" />
              </div>
              <div>
                <Label>Preço</Label>
                <Input type="number" value={s.valor} onChange={e => {
                  const arr = [...servicos];
                  arr[i].valor = e.target.value;
                  setServicos(arr);
                }} placeholder="0,00" />
              </div>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input value={s.descricao} onChange={e => {
                const arr = [...servicos];
                arr[i].descricao = e.target.value;
                setServicos(arr);
              }} placeholder="Ex: Inclui lavagem e finalização" />
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addServico}>+ Adicionar serviço</Button>
        <Button onClick={handleSalvar} className="w-full">Salvar e continuar</Button>
      </Card>
    </div>
  );
}
