import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DollarSign, Plus, Trash2, Edit } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function Financas() {
  const { transacoes, adicionarTransacao, atualizarTransacao, removerTransacao, profissionais } = useApp();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date(),
    metodoPagamento: 'dinheiro',
    profissionalId: '' as string | undefined,
  });

  const listaFiltrada = useMemo(() => {
    return transacoes.filter(t => t.descricao.toLowerCase().includes(busca.toLowerCase()));
  }, [transacoes, busca]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ tipo: 'receita', categoria: '', descricao: '', valor: 0, data: new Date(), metodoPagamento: 'dinheiro', profissionalId: '' });
    setModalAberto(true);
  };

  const abrirEditar = (t: any) => {
    setEditando(t);
    setForm({ tipo: t.tipo, categoria: t.categoria, descricao: t.descricao, valor: t.valor, data: new Date(t.data), metodoPagamento: t.metodoPagamento, profissionalId: t.profissionalId });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.categoria || !form.descricao) {
      toast.error('Informe categoria e descrição');
      return;
    }
    if (editando) {
      await atualizarTransacao(editando.id, form as any);
      toast.success('Transação atualizada');
    } else {
      await adicionarTransacao(form as any);
      toast.success('Transação adicionada');
    }
    setModalAberto(false);
  };

  const excluir = async (id: string) => {
    if (confirm('Excluir transação?')) {
      await removerTransacao(id);
      toast.success('Transação excluída');
    }
  };

  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-success pt-safe px-6 py-6">
        <h1 className="text-white text-2xl font-bold">Finanças</h1>
        <p className="text-white/90 text-sm mt-1">Controle financeiro completo</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar transações..." />
          </div>
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button onClick={abrirNovo} className="gap-2"><Plus className="h-4 w-4" /> Nova</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={form.data.toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, data: new Date(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Método de pagamento</Label>
                    <Input value={form.metodoPagamento} onChange={(e) => setForm({ ...form, metodoPagamento: e.target.value })} />
                  </div>
                  <div>
                    <Label>Profissional (opcional)</Label>
                    <Select value={form.profissionalId || ''} onValueChange={(v: any) => setForm({ ...form, profissionalId: v || undefined })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {profissionais.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={salvar}>{editando ? 'Salvar alterações' : 'Adicionar'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {listaFiltrada.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.categoria} • {t.tipo}</p>
                  <p className="text-sm text-muted-foreground">{t.descricao}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>R$ {t.valor.toFixed(2)}</p>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEditar(t)}><Edit className="h-4 w-4 mr-1" />Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => excluir(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {listaFiltrada.length === 0 && (
            <div className="card-flat p-12 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
