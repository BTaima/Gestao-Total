import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp, User, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FAB } from '@/components/common/FAB';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/common/BottomNav';
import { useState } from 'react';

export default function AdminDashboard() {
  const { clientes, agendamentos, transacoes, usuario, profissionais } = useApp();
  const navigate = useNavigate();
  const [novoAgendamentoModal, setNovoAgendamentoModal] = useState(false);

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
  
  // Faturamento total do mês
  const faturamentoMes = transacoes
    .filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === 'receita' && 
             dataTransacao.getMonth() === mesAtual &&
             dataTransacao.getFullYear() === anoAtual;
    })
    .reduce((acc, t) => acc + t.valor, 0);

  // Comissões pagas no mês (apenas transações com profissional vinculado)
  const comissoesMes = transacoes
    .filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === 'receita' && 
             t.profissionalId &&
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
    .slice(0, 5);

  // Dados para gráfico de pizza de profissionais
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const profissionaisAtivos = profissionais.filter(p => p.ativo);
  const dadosProfissionais = profissionaisAtivos.slice(0, 6).map((p, idx) => ({
    name: p.nome.split(' ')[0],
    value: agendamentos.filter(a => a.profissionalId === p.id).length,
    color: COLORS[idx % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{usuario?.estabelecimentoNome || 'Dashboard Administrativo'}</h1>
          <p className="text-muted-foreground">Visão geral completa do seu estabelecimento</p>
        </div>

        {/* Estatísticas - Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/clientes')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-3xl font-bold">{clientesAtivos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/agenda')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-3xl font-bold">{agendamentosHoje}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/financas')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mês</p>
                <p className="text-2xl font-bold">R$ {faturamentoMes.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/financas')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comissões Mês</p>
                <p className="text-2xl font-bold">R$ {comissoesMes.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Faturamento Mensal */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Faturamento dos Últimos 6 Meses
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="faturamento" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Distribuição por Profissional */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Agendamentos por Profissional
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosProfissionais}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosProfissionais.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Profissionais Cadastrados */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profissionais da Equipe
            </h3>
            <button 
              onClick={() => navigate('/profissionais')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profissionaisAtivos.slice(0, 6).map(profissional => {
              const agendamentosProfissional = agendamentos.filter(a => a.profissionalId === profissional.id);
              const servicosConcluidos = agendamentosProfissional.filter(a => a.status === 'concluido').length;
              const comissaoTotal = transacoes
                .filter(t => t.profissionalId === profissional.id && t.tipo === 'receita')
                .reduce((acc, t) => acc + t.valor, 0);
              
              return (
                <Card key={profissional.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profissionais')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
                      {profissional.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{profissional.nome}</h4>
                      <p className="text-xs text-muted-foreground">{profissional.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviços:</span>
                      <span className="font-medium">{servicosConcluidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comissão total:</span>
                      <span className="font-medium text-green-600">R$ {comissaoTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
            {profissionaisAtivos.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum profissional cadastrado</p>
              </div>
            )}
          </div>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximos Agendamentos
            </h3>
            <button 
              onClick={() => navigate('/agenda')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver agenda completa <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {proximosAgendamentos.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Nenhum agendamento futuro</p>
              </div>
            ) : (
              proximosAgendamentos.map(agendamento => {
                const cliente = clientes.find(c => c.id === agendamento.clienteId);
                const profissional = profissionais.find(p => p.id === agendamento.profissionalId);
                return (
                  <div key={agendamento.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/agenda')}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{cliente?.nome || 'Cliente'}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {profissional?.nome || 'Profissional'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(agendamento.dataHora).toLocaleString('pt-BR', { 
                          dateStyle: 'short', 
                          timeStyle: 'short' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">R$ {agendamento.valor.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agendamento.status === 'confirmado' ? 'bg-green-500/10 text-green-600' : 
                        agendamento.status === 'concluido' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-yellow-500/10 text-yellow-600'
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

      {/* FAB para Novo Agendamento */}
      <FAB onClick={() => navigate('/agenda')} />
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
