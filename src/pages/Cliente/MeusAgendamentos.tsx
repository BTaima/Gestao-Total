import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Star, CheckCircle, XCircle } from 'lucide-react';
import { AvaliacaoModal } from '@/components/Avaliacoes/AvaliacaoModal';
import { BottomNav } from '@/components/common/BottomNav';
import { generateId } from '@/utils/storage';
import { toast } from 'sonner';

export default function MeusAgendamentos() {
  const { agendamentos, servicos, usuario, clientes, avaliacoes, adicionarAvaliacao, atualizarAgendamento } = useApp();
  const [avaliacaoAberta, setAvaliacaoAberta] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [tabAtiva, setTabAtiva] = useState('proximos');

  const meuClienteId = (() => {
    const c = clientes.find(x => x.email === usuario?.email || x.telefone === usuario?.telefone);
    return c?.id || usuario?.id;
  })();
  const meusAgendamentos = agendamentos.filter(a => a.clienteId === meuClienteId);

  const proximos = meusAgendamentos.filter(a => 
    new Date(a.dataHora) >= new Date() && 
    (a.status === 'agendado' || a.status === 'confirmado')
  ).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

  const concluidos = meusAgendamentos.filter(a => 
    a.status === 'concluido'
  ).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  const cancelados = meusAgendamentos.filter(a => 
    a.status === 'cancelado'
  ).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  const handleAvaliar = (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setAvaliacaoAberta(true);
  };

  const handleSubmitAvaliacao = (nota: number, comentario: string) => {
    if (!agendamentoSelecionado) return;

    adicionarAvaliacao({
      id: generateId(),
      clienteId: usuario?.id || '',
      profissionalId: agendamentoSelecionado.profissionalId || '',
      agendamentoId: agendamentoSelecionado.id,
      servicoId: agendamentoSelecionado.servicoId,
      nota: nota as 1 | 2 | 3 | 4 | 5,
      comentario,
      data: new Date(),
      visivel: true,
      estabelecimentoId: usuario?.estabelecimentoId || ''
    });

    toast.success('Avaliação enviada com sucesso!');
  };

  const handleCancelar = (agendamentoId: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      atualizarAgendamento(agendamentoId, { status: 'cancelado' });
      toast.success('Agendamento cancelado');
    }
  };

  const jaAvaliou = (agendamentoId: string) => {
    return avaliacoes.some(a => a.agendamentoId === agendamentoId);
  };

  const renderAgendamento = (agendamento: typeof agendamentos[0], mostrarAcoes: boolean = false) => {
    const servico = servicos.find(s => s.id === agendamento.servicoId);
    
    return (
      <Card key={agendamento.id} className="p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold mb-1">{servico?.nome || 'Serviço'}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(agendamento.dataHora).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            agendamento.status === 'confirmado' ? 'bg-green-500/10 text-green-500' :
            agendamento.status === 'agendado' ? 'bg-yellow-500/10 text-yellow-500' :
            agendamento.status === 'concluido' ? 'bg-blue-500/10 text-blue-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {agendamento.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {agendamento.duracao} min
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            R$ {agendamento.valor.toFixed(2)}
          </span>
        </div>

        {agendamento.observacoes && (
          <p className="text-sm text-muted-foreground mb-3 italic">
            "{agendamento.observacoes}"
          </p>
        )}

        {mostrarAcoes && (agendamento.status === 'agendado' || agendamento.status === 'confirmado') && (
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleCancelar(agendamento.id)}>
              Cancelar
            </Button>
          </div>
        )}
        {mostrarAcoes && agendamento.status === 'concluido' && !jaAvaliou(agendamento.id) && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => handleAvaliar(agendamento)}>
            <Star className="h-4 w-4 mr-2" />
            Avaliar Atendimento
          </Button>
        )}
        {mostrarAcoes && agendamento.status === 'concluido' && jaAvaliou(agendamento.id) && (
          <p className="text-sm text-center text-muted-foreground mt-2">
            Você já avaliou este atendimento
          </p>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>

        <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
            <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
          </TabsList>

          <TabsContent value="proximos">
            {proximos.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum agendamento futuro</p>
              </div>
            ) : (
              proximos.map(ag => renderAgendamento(ag, true))
            )}
          </TabsContent>

          <TabsContent value="concluidos">
            {concluidos.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum agendamento concluído</p>
              </div>
            ) : (
              concluidos.map(ag => renderAgendamento(ag, true))
            )}
          </TabsContent>

          <TabsContent value="cancelados">
            {cancelados.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum agendamento cancelado</p>
              </div>
            ) : (
              cancelados.map(ag => renderAgendamento(ag, false))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {agendamentoSelecionado && (
        <AvaliacaoModal
          open={avaliacaoAberta}
          onOpenChange={setAvaliacaoAberta}
          agendamento={agendamentoSelecionado}
          onSubmit={handleSubmitAvaliacao}
        />
      )}

      <BottomNav />
    </div>
  );
}
