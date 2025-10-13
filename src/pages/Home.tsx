import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { FAB } from '@/components/common/FAB';
import { Users, Calendar, DollarSign, Bell } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/storage';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const { usuario, clientes, agendamentos, transacoes, lembretes } = useApp();

  // Calculate metrics
  const metrics = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
    
    const agendamentosHoje = agendamentos.filter(a => {
      const agendDate = new Date(a.dataHora);
      agendDate.setHours(0, 0, 0, 0);
      return agendDate.getTime() === hoje.getTime() && a.status !== 'cancelado';
    }).length;

    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const faturamentoMes = transacoes
      .filter(t => {
        const tDate = new Date(t.data);
        return t.tipo === 'receita' && 
               t.status === 'pago' && 
               tDate.getMonth() === mesAtual && 
               tDate.getFullYear() === anoAtual;
      })
      .reduce((sum, t) => sum + t.valor, 0);

    const lembretesPendentes = lembretes.filter(l => !l.concluido).length;

    return {
      clientesAtivos,
      agendamentosHoje,
      faturamentoMes,
      lembretesPendentes,
    };
  }, [clientes, agendamentos, transacoes, lembretes]);

  // Get next appointments
  const proximosAgendamentos = useMemo(() => {
    const agora = new Date();
    return agendamentos
      .filter(a => new Date(a.dataHora) >= agora && a.status !== 'cancelado')
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
      .slice(0, 5);
  }, [agendamentos]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero pt-safe px-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-fade-in">
            <h2 className="text-white/80 text-sm mb-1">Bem-vindo de volta</h2>
            <h1 className="text-white text-2xl font-bold">
              {usuario?.nome || 'Usuário'}
            </h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {usuario?.nome?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        <p className="text-white/90 text-sm">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 -mt-4 mb-6">
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {metrics.clientesAtivos}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Clientes ativos</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-secondary" />
              <span className="text-2xl font-bold text-foreground">
                {metrics.agendamentosHoje}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Agendamentos hoje</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(metrics.faturamentoMes)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Faturamento mês</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                {metrics.lembretesPendentes}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Lembretes pendentes</p>
          </div>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Próximos Agendamentos</h2>
          <button 
            onClick={() => navigate('/agenda')}
            className="text-sm text-primary font-semibold"
          >
            Ver todos
          </button>
        </div>

        {proximosAgendamentos.length === 0 ? (
          <div className="card-flat p-6 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum agendamento próximo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique no + para adicionar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proximosAgendamentos.map((agendamento) => {
              const cliente = clientes.find(c => c.id === agendamento.clienteId);
              const dataHora = new Date(agendamento.dataHora);
              
              return (
                <div
                  key={agendamento.id}
                  className="card-flat p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/agenda')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">
                        {cliente?.nome?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {cliente?.nome || 'Cliente'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dataHora.toLocaleDateString('pt-BR')} às{' '}
                        {dataHora.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(agendamento.valor)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FAB onClick={() => navigate('/agenda')} />
      <BottomNav />
    </div>
  );
}
