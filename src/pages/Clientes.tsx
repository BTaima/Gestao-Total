import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function Clientes() {
  const { clientes, adicionarCliente, atualizarCliente, removerCliente } = useApp();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    observacoes: '',
    status: 'ativo' as 'ativo' | 'inativo',
    dataNascimento: undefined as Date | undefined,
  });

  const listaFiltrada = useMemo(() => {
    return clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [clientes, busca]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: '', telefone: '', email: '', endereco: '', observacoes: '', status: 'ativo', dataNascimento: undefined });
    setModalAberto(true);
  };

  const abrirEditar = (c: any) => {
    setEditando(c);
    setForm({
      nome: c.nome || '',
      telefone: c.telefone || '',
      email: c.email || '',
      endereco: c.endereco || '',
      observacoes: c.observacoes || '',
      status: c.status || 'ativo',
      dataNascimento: c.dataNascimento,
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.telefone) {
      toast.error('Informe nome e telefone');
      return;
    }
    if (editando) {
      await atualizarCliente(editando.id, form as any);
      toast.success('Cliente atualizado');
    } else {
      await adicionarCliente(form as any);
      toast.success('Cliente criado');
    }
    setModalAberto(false);
  };

  const excluir = async (id: string) => {
    if (confirm('Excluir este cliente?')) {
      await removerCliente(id);
      toast.success('Cliente excluído');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-secondary pt-safe px-6 py-6">
        <h1 className="text-white text-2xl font-bold">Clientes</h1>
        <p className="text-white/90 text-sm mt-1">Gerencie sua base de clientes</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar clientes..." className="pl-9" />
          </div>
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button onClick={abrirNovo} className="gap-2"><Plus className="h-4 w-4" /> Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
                </div>
                <Button onClick={salvar}>{editando ? 'Salvar alterações' : 'Criar'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {listaFiltrada.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{c.nome}</h3>
                  <p className="text-sm text-muted-foreground">{c.telefone} {c.email ? `• ${c.email}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(c)}><Edit className="h-4 w-4 mr-1" />Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => excluir(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {listaFiltrada.length === 0 && (
            <div className="card-flat p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
