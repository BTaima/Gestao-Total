import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profissionais() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const handleAdicionar = () => {
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    toast.success('Profissional adicionado com sucesso!');
    setModalAberto(false);
    setFormData({ nome: '', email: '', telefone: '', senha: '' });
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
          <Button onClick={() => setModalAberto(true)} className="gap-2">
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
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Você (Administrador)</h3>
                <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
              </div>
            </div>
          </Card>

          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Nenhum profissional cadastrado</p>
            <Button onClick={() => setModalAberto(true)} variant="outline">
              Adicionar Primeiro Profissional
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Profissional */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Profissional</DialogTitle>
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
            <div>
              <Label>Senha Temporária</Label>
              <Input
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Senha inicial"
              />
            </div>
            <Button onClick={handleAdicionar} className="w-full">
              Cadastrar Profissional
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
