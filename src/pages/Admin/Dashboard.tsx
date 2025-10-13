import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { clientes, agendamentos, transacoes, usuario } = useApp();

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const agendamentosHoje = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.dataHora);
    dataAgendamento.setHours(0, 0, 0, 0);
    return dataAgendamento.getTime() === hoje.getTime();
  }).length;

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const faturamentoMes = transacoes
    .filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === 'receita' && 
             t.status === 'pago' &&
             dataTransacao.getMonth() === mesAtual &&
             dataTransacao.getFullYear() === anoAtual;
    })
    .reduce((acc, t) => acc + t.valor, 0);

  // Dados para o gráfico (últimos 6 meses)
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const mes = new Date();
    mes.setMonth(mes.getMonth() - (5 - i));
    const mesNum = mes.getMonth();
    const ano = mes.getFullYear();
    
    const faturamento = transacoes
      .filter(t => {
        const dataTransacao = new Date(t.data);
        return t.tipo === 'receita' && 
               t.status === 'pago' &&
               dataTransacao.getMonth() === mesNum &&
               dataTransacao.getFullYear() === ano;
      })
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
      faturamento: faturamento
    };
  });

  const proximosAgendamentos = agendamentos
    .filter(a => new Date(a.dataHora) >= new Date() && a.status !== 'cancelado')
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{usuario?.estabelecimentoNome || 'Dashboard'}</h1>
          <p className="text-muted-foreground">Visão geral do estabelecimento</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{clientesAtivos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{agendamentosHoje}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento do Mês</p>
                <p className="text-2xl font-bold">R$ {faturamentoMes.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de Faturamento */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Faturamento Mensal
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
              />
              <Bar dataKey="faturamento" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos</h3>
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
