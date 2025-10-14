import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Cliente, Servico, ListaEspera } from '@/types';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Trash2 } from 'lucide-react';

interface ListaEsperaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  servicos: Servico[];
}

export function ListaEsperaModal({
  open,
  onOpenChange,
  clientes,
  servicos
}: ListaEsperaModalProps) {
  const { listaEspera, adicionarListaEspera, removerListaEspera, adicionarAgendamento, usuario } = useApp();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [preferenciaHorario, setPreferenciaHorario] = useState('');
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

    const novaEspera: Omit<ListaEspera, 'id' | 'dataCriacao'> = {
      clienteId,
      servicoId,
      preferenciaHorario,
      observacoes
    };

    adicionarListaEspera(novaEspera);

    toast({
      title: 'Adicionado à lista!',
      description: 'Cliente adicionado à lista de espera.',
    });

    // Reset form
    setClienteId('');
    setServicoId('');
    setPreferenciaHorario('');
    setObservacoes('');
    setMostrarForm(false);
  };

  const handleRemover = (id: string) => {
    removerListaEspera(id);
    toast({
      title: 'Removido',
      description: 'Cliente removido da lista de espera.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-600">Lista de Espera</DialogTitle>
        </DialogHeader>

        {!mostrarForm ? (
          <div className="space-y-4">
            <Button
              onClick={() => setMostrarForm(true)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Adicionar à Lista
            </Button>

            {listaEspera.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente na lista de espera
              </div>
            ) : (
              <div className="space-y-3">
                {listaEspera.map(item => {
                  const cliente = clientes.find(c => c.id === item.clienteId);
                  const servico = servicos.find(s => s.id === item.servicoId);

                  return (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="font-semibold text-gray-800">{cliente?.nome}</div>
                      <div className="text-sm text-gray-600">{servico?.nome}</div>
                      {item.preferenciaHorario && (
                        <div className="text-sm text-gray-500">
                          Preferência: {item.preferenciaHorario}
                        </div>
                      )}
                      {item.observacoes && (
                        <div className="text-sm text-gray-500">{item.observacoes}</div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            if (!cliente || !servico || !usuario) return;
                            const agora = new Date();
                            adicionarAgendamento({
                              clienteId: cliente.id,
                              servicoId: servico.id,
                              profissionalId: usuario.id,
                              dataHora: agora,
                              duracao: servico.duracao,
                              status: 'agendado',
                              valor: servico.valor,
                              pagamentoAntecipado: false,
                              pagamentoStatus: 'pendente',
                              observacoes: item.observacoes || '',
                              estabelecimentoId: usuario.estabelecimentoId,
                            });
                            toast({ title: 'Agendado', description: 'Agendamento criado a partir da lista de espera.' });
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Agendar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemover(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
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
                      {servico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferencia">Preferência de Horário</Label>
              <Input
                id="preferencia"
                value={preferenciaHorario}
                onChange={(e) => setPreferenciaHorario(e.target.value)}
                placeholder="Ex: Manhã, tarde, após 15h..."
              />
            </div>

            <div>
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarForm(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                Adicionar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
