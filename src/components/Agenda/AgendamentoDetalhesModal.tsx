import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agendamento, Cliente, Servico } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Scissors, DollarSign, FileText } from 'lucide-react';

interface AgendamentoDetalhesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento;
  clientes: Cliente[];
  servicos: Servico[];
}

export function AgendamentoDetalhesModal({
  open,
  onOpenChange,
  agendamento,
  clientes,
  servicos,
}: AgendamentoDetalhesModalProps) {
  const cliente = clientes.find(c => c.id === agendamento.clienteId);
  const servico = servicos.find(s => s.id === agendamento.servicoId);

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-blue-100 text-blue-800',
      confirmado: 'bg-green-100 text-green-800',
      concluido: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(agendamento.status)}>
              {agendamento.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">{cliente?.nome || 'N/A'}</p>
                {cliente?.telefone && (
                  <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Serviço</p>
                <p className="text-sm text-muted-foreground">{servico?.nome || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(agendamento.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Horário</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(agendamento.dataHora), 'HH:mm')} ({agendamento.duracao} min)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Valor</p>
                <p className="text-sm text-muted-foreground">
                  R$ {agendamento.valor?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {agendamento.observacoes && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground">{agendamento.observacoes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              variant="outline"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
