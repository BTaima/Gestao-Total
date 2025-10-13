import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClienteHome() {
  const { servicos, agendamentos, usuario } = useApp();
  const navigate = useNavigate();

  const servicosAtivos = servicos.filter(s => s.ativo);

  const proximosAgendamentos = agendamentos
    .filter(a => 
      a.clienteId === usuario?.id && 
      new Date(a.dataHora) >= new Date() && 
      a.status !== 'cancelado'
    )
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{usuario?.estabelecimentoNome}</h1>
          <p className="text-muted-foreground">Bem-vindo, {usuario?.nome}!</p>
        </div>

        {/* Próximos Agendamentos */}
        {proximosAgendamentos.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/meus-agendamentos')}>
                Ver todos
              </Button>
            </div>
            <div className="space-y-3">
              {proximosAgendamentos.map(agendamento => {
                const servico = servicos.find(s => s.id === agendamento.servicoId);
                return (
                  <div key={agendamento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{servico?.nome || 'Serviço'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(agendamento.dataHora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      {agendamento.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Serviços Disponíveis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Serviços Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicosAtivos.map(servico => (
              <Card key={servico.id} className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold mb-1">{servico.nome}</h4>
                  {servico.descricao && (
                    <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {servico.duracao} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    R$ {servico.valor.toFixed(2)}
                  </span>
                </div>
                <Button 
                  onClick={() => navigate('/agendar')} 
                  className="w-full"
                  size="sm"
                >
                  Agendar
                </Button>
              </Card>
            ))}
          </div>

          {servicosAtivos.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum serviço disponível no momento</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Button
        onClick={() => navigate('/agendar')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
