import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '@/utils/storage';

export default function Servicos() {
  const { servicos, profissionais, usuario, adicionarServico, atualizarServico, removerServico } = useApp();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    duracao: 60,
    valor: 0,
    ativo: true,
    destaque: false,
    profissionaisIds: [] as string[]
  });

  const servicosEstabelecimento = servicos.filter(s => s.estabelecimentoId === usuario?.estabelecimentoId);
  const profissionaisEstabelecimento = profissionais?.filter(p => p.estabelecimentoId === usuario?.estabelecimentoId) || [];

  const servicosFiltrados = servicosEstabelecimento.filter(s =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirModal = (servico?: any) => {
    if (servico) {
      setServicoEditando(servico);
      setFormData({
        nome: servico.nome,
        categoria: servico.categoria || '',
        descricao: servico.descricao || '',
        duracao: servico.duracao,
        valor: servico.valor,
        ativo: servico.ativo,
        destaque: servico.destaque,
        profissionaisIds: servico.profissionaisIds || []
      });
    } else {
      setServicoEditando(null);
      setFormData({
        nome: '',
        categoria: '',
        descricao: '',
        duracao: 60,
        valor: 0,
        ativo: true,
        destaque: false,
        profissionaisIds: []
      });
    }
    setModalAberto(true);
  };

  const handleSubmit = () => {
    if (!formData.nome || formData.duracao <= 0 || formData.valor < 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.profissionaisIds.length === 0) {
      toast.error('Selecione pelo menos um profissional');
      return;
    }

    if (servicoEditando) {
      atualizarServico(servicoEditando.id, formData);
      toast.success('Serviço atualizado');
    } else {
      adicionarServico({
        ...formData,
        cor: '#8B5CF6',
        exigePagamentoAntecipado: false,
        estabelecimentoId: usuario?.estabelecimentoId || ''
      });
      toast.success('Serviço criado');
    }

    setModalAberto(false);
  };

  const handleDuplicar = (servico: any) => {
    adicionarServico({
      ...servico,
      id: generateId(),
      nome: `${servico.nome} (Cópia)`,
      estabelecimentoId: usuario?.estabelecimentoId || ''
    });
    toast.success('Serviço duplicado');
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      removerServico(id);
      toast.success('Serviço excluído');
    }
  };

  const toggleProfissional = (profId: string) => {
    setFormData(prev => ({
      ...prev,
      profissionaisIds: prev.profissionaisIds.includes(profId)
        ? prev.profissionaisIds.filter(id => id !== profId)
        : [...prev.profissionaisIds, profId]
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Serviços</h1>
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{servicoEditando ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Serviço *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Corte de Cabelo"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ex: Cabelo"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o serviço..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duração (minutos) *</Label>
                    <Input
                      type="number"
                      value={formData.duracao}
                      onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Profissionais que realizam *</Label>
                  <div className="space-y-2">
                    {profissionaisEstabelecimento.map(prof => (
                      <div key={prof.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.profissionaisIds.includes(prof.id)}
                          onChange={() => toggleProfissional(prof.id)}
                          className="rounded"
                        />
                        <span>{prof.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Destaque no app</Label>
                  <Switch
                    checked={formData.destaque}
                    onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {servicoEditando ? 'Salvar Alterações' : 'Criar Serviço'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {servicosFiltrados.map(servico => (
            <Card key={servico.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{servico.nome}</h3>
                    {!servico.ativo && <Badge variant="secondary">Inativo</Badge>}
                    {servico.destaque && <Badge>Destaque</Badge>}
                  </div>
                  {servico.categoria && (
                    <p className="text-sm text-muted-foreground">{servico.categoria}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {servico.valor.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{servico.duracao}min</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {profissionaisEstabelecimento
                  .filter(p => servico.profissionaisIds.includes(p.id))
                  .slice(0, 3)
                  .map(prof => (
                    <Avatar key={prof.id} className="h-6 w-6">
                      <AvatarFallback className="text-xs">{prof.nome[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                {servico.profissionaisIds.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{servico.profissionaisIds.length - 3}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirModal(servico)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicar(servico)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleExcluir(servico.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
