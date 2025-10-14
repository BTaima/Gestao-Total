import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, User, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

export default function Profissionais() {
  const { profissionais, adicionarProfissional, atualizarProfissional, removerProfissional } = useApp();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    ativo: true,
  });

  const handleSalvar = async () => {
    if (!formData.nome) {
      toast.error('Informe o nome');
      return;
    }
    if (editando) {
      await atualizarProfissional(editando.id, formData as any);
      toast.success('Profissional atualizado');
    } else {
      await adicionarProfissional(formData as any);
      toast.success('Profissional adicionado');
    }
    setModalAberto(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Profissionais</h1>
            <p className="text-muted-foreground">Gerencie sua equipe</p>
          </div>
          <Button onClick={() => { setEditando(null); setFormData({ nome: '', email: '', telefone: '', ativo: true }); setModalAberto(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar profissional..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Profissionais */}
        <div className="space-y-4">
          {profissionais
            .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
            .map((p) => (
              <Card key={p.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{p.nome}</h3>
                      <p className="text-sm text-muted-foreground">{p.email} {p.telefone ? `• ${p.telefone}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditando(p); setFormData({ nome: p.nome, email: p.email, telefone: p.telefone, ativo: p.ativo }); setModalAberto(true); }}
                    >
                      <Edit className="w-4 h-4 mr-1" />Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => { if (confirm('Remover profissional?')) { await removerProfissional(p.id); toast.success('Profissional removido'); } }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          {profissionais.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Nenhum profissional cadastrado</p>
              <Button onClick={() => setModalAberto(true)} variant="outline">
                Adicionar Primeiro Profissional
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Adicionar/Editar Profissional */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Profissional' : 'Adicionar Profissional'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <Button onClick={handleSalvar} className="w-full">
              {editando ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
