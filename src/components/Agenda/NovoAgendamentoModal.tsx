import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Cliente, Servico, Agendamento } from '@/types';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

interface NovoAgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSelecionada: Date;
  clientes: Cliente[];
  servicos: Servico[];
}

export function NovoAgendamentoModal({
  open,
  onOpenChange,
  dataSelecionada,
  clientes,
  servicos
}: NovoAgendamentoModalProps) {
  const { adicionarAgendamento, usuario } = useApp();
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [data, setData] = useState(dataSelecionada.toISOString().split('T')[0]);
  const [hora, setHora] = useState('09:00');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId || !servicoId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione cliente e serviço.',
        variant: 'destructive'
      });
      return;
    }

    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return;

    const [year, month, day] = data.split('-').map(Number);
    const [hour, min] = hora.split(':').map(Number);
    const dataHora = new Date(year, month - 1, day, hour, min);

    const novoAgendamento: Omit<Agendamento, 'id' | 'dataCriacao' | 'dataAtualizacao'> = {
      clienteId,
      servicoId,
      profissionalId: usuario?.id,
      dataHora,
      duracao: servico.duracao,
      status: 'agendado',
      valor: servico.valor,
      pagamentoAntecipado: servico.exigePagamentoAntecipado,
      pagamentoStatus: 'pendente',
      observacoes,
      estabelecimentoId: usuario?.estabelecimentoId || ''
    };

    adicionarAgendamento(novoAgendamento);

    toast({
      title: 'Agendamento criado!',
      description: 'O agendamento foi adicionado com sucesso.',
    });

    // Reset form
    setClienteId('');
    setServicoId('');
    setObservacoes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(cliente => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="servico">Serviço *</Label>
            <Select value={servicoId} onValueChange={setServicoId}>
              <SelectTrigger id="servico">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map(servico => (
                  <SelectItem key={servico.id} value={servico.id}>
                    {servico.nome} - {servico.duracao}min - R$ {servico.valor.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Salvar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
