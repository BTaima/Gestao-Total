import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function ProfissionalDashboard() {
  const { clientes, agendamentos, transacoes, usuario } = useApp();

  // Filtrar apenas dados deste profissional
  const meusAgendamentos = agendamentos.filter(a => a.profissionalId === usuario?.id);
  const meusClientes = clientes.filter(c => 
    meusAgendamentos.some(a => a.clienteId === c.id)
  ).filter(c => c.status === 'ativo');

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const agendamentosHoje = meusAgendamentos.filter(a => {
    const dataAgendamento = new Date(a.dataHora);
    dataAgendamento.setHours(0, 0, 0, 0);
    return dataAgendamento.getTime() === hoje.getTime();
  }).length;

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const atendimentosMes = meusAgendamentos.filter(a => {
    const dataAgendamento = new Date(a.dataHora);
    return a.status === 'concluido' &&
           dataAgendamento.getMonth() === mesAtual &&
           dataAgendamento.getFullYear() === anoAtual;
  }).length;

  const faturamentoMes = transacoes
    .filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === 'receita' && 
             t.status === 'pago' &&
             t.profissionalId === usuario?.id &&
             dataTransacao.getMonth() === mesAtual &&
             dataTransacao.getFullYear() === anoAtual;
    })
    .reduce((acc, t) => acc + t.valor, 0);

  const proximosAgendamentos = meusAgendamentos
    .filter(a => new Date(a.dataHora) >= new Date() && a.status !== 'cancelado')
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Olá, {usuario?.nome}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo dos seus números</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meus Clientes</p>
                <p className="text-2xl font-bold">{meusClientes.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{agendamentosHoje}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atendimentos</p>
                <p className="text-2xl font-bold">{atendimentosMes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mês</p>
                <p className="text-2xl font-bold">R$ {faturamentoMes.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Metas do Mês */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Metas do Mês</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Atendimentos: {atendimentosMes}/100</span>
                <span>{Math.round((atendimentosMes / 100) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((atendimentosMes / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Faturamento: R$ {faturamentoMes.toFixed(2)}/R$ 10.000,00</span>
                <span>{Math.round((faturamentoMes / 10000) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min((faturamentoMes / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Meus Próximos Agendamentos</h3>
          <div className="space-y-3">
            {proximosAgendamentos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum agendamento futuro</p>
            ) : (
              proximosAgendamentos.map(agendamento => {
                const cliente = clientes.find(c => c.id === agendamento.clienteId);
                return (
                  <div key={agendamento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{cliente?.nome || 'Cliente'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(agendamento.dataHora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">R$ {agendamento.valor.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agendamento.status === 'confirmado' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {agendamento.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
