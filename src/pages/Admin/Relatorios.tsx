import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useApp } from '@/context/AppContext';
import { Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { BottomNav } from '@/components/common/BottomNav';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Relatorios() {
  const { agendamentos, clientes, servicos, transacoes, profissionais, usuario } = useApp();
  const [periodo, setPeriodo] = useState('mes');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('');
  const [servicoSelecionado, setServicoSelecionado] = useState<string>('');
  const [clienteBusca, setClienteBusca] = useState('');

  const agendamentosEstabelecimento = agendamentos.filter(a => a.estabelecimentoId === usuario?.estabelecimentoId);
  const clientesEstabelecimento = clientes.filter(c => c.estabelecimentoId === usuario?.estabelecimentoId);
  const servicosEstabelecimento = servicos.filter(s => s.estabelecimentoId === usuario?.estabelecimentoId);
  const profissionaisEstabelecimento = profissionais?.filter(p => p.estabelecimentoId === usuario?.estabelecimentoId) || [];

  // Dados Gerais
  const dadosGerais = useMemo(() => {
    const agendamentosConcluidos = agendamentosEstabelecimento.filter(a => a.status === 'concluido');
    const totalFaturado = agendamentosConcluidos.reduce((acc, a) => acc + a.valor, 0);
    const totalAtendimentos = agendamentosConcluidos.length;
    const ticketMedio = totalAtendimentos > 0 ? totalFaturado / totalAtendimentos : 0;

    const faturamentoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const mes = subMonths(new Date(), i);
      const inicio = startOfMonth(mes);
      const fim = endOfMonth(mes);
      
      const faturamentoMes = agendamentosConcluidos
        .filter(a => a.dataHora >= inicio && a.dataHora <= fim)
        .reduce((acc, a) => acc + a.valor, 0);
      
      faturamentoMensal.push({
        mes: format(mes, 'MMM', { locale: ptBR }),
        valor: faturamentoMes
      });
    }

    const servicosMaisRealizados = servicosEstabelecimento
      .map(servico => ({
        nome: servico.nome,
        quantidade: agendamentosConcluidos.filter(a => a.servicoId === servico.id).length
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    return {
      totalFaturado,
      totalAtendimentos,
      ticketMedio,
      faturamentoMensal,
      servicosMaisRealizados
    };
  }, [agendamentosEstabelecimento, servicosEstabelecimento]);

  // Dados por Profissional
  const dadosProfissional = useMemo(() => {
    if (!profissionalSelecionado) return null;

    const agendamentosProfissional = agendamentosEstabelecimento.filter(
      a => a.profissionalId === profissionalSelecionado && a.status === 'concluido'
    );

    const faturamento = agendamentosProfissional.reduce((acc, a) => acc + a.valor, 0);
    const quantidade = agendamentosProfissional.length;
    const ticketMedio = quantidade > 0 ? faturamento / quantidade : 0;
    const clientesUnicos = new Set(agendamentosProfissional.map(a => a.clienteId)).size;

    return {
      faturamento,
      quantidade,
      ticketMedio,
      clientesUnicos
    };
  }, [profissionalSelecionado, agendamentosEstabelecimento]);

  // Dados por Serviço
  const dadosServico = useMemo(() => {
    if (!servicoSelecionado) return null;

    const agendamentosServico = agendamentosEstabelecimento.filter(
      a => a.servicoId === servicoSelecionado && a.status === 'concluido'
    );

    const faturamento = agendamentosServico.reduce((acc, a) => acc + a.valor, 0);
    const quantidade = agendamentosServico.length;
    const ticketMedio = quantidade > 0 ? faturamento / quantidade : 0;

    return {
      faturamento,
      quantidade,
      ticketMedio
    };
  }, [servicoSelecionado, agendamentosEstabelecimento]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="profissional">Profissional</TabsTrigger>
            <TabsTrigger value="servico">Serviço</TabsTrigger>
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Faturado</span>
                </div>
                <p className="text-2xl font-bold">R$ {dadosGerais.totalFaturado.toFixed(2)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Atendimentos</span>
                </div>
                <p className="text-2xl font-bold">{dadosGerais.totalAtendimentos}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Ticket Médio</span>
                </div>
                <p className="text-2xl font-bold">R$ {dadosGerais.ticketMedio.toFixed(2)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Clientes</span>
                </div>
                <p className="text-2xl font-bold">{clientesEstabelecimento.length}</p>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Faturamento Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGerais.faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Top 5 Serviços</h3>
              <div className="space-y-3">
                {dadosGerais.servicosMaisRealizados.map((servico, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{servico.nome}</span>
                    <span className="font-semibold">{servico.quantidade}x</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profissional" className="space-y-4">
            <Select value={profissionalSelecionado} onValueChange={setProfissionalSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionaisEstabelecimento.map(prof => (
                  <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {dadosProfissional && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Faturamento</span>
                  <p className="text-2xl font-bold">R$ {dadosProfissional.faturamento.toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Atendimentos</span>
                  <p className="text-2xl font-bold">{dadosProfissional.quantidade}</p>
                </Card>
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Ticket Médio</span>
                  <p className="text-2xl font-bold">R$ {dadosProfissional.ticketMedio.toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Clientes Únicos</span>
                  <p className="text-2xl font-bold">{dadosProfissional.clientesUnicos}</p>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="servico" className="space-y-4">
            <Select value={servicoSelecionado} onValueChange={setServicoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicosEstabelecimento.map(serv => (
                  <SelectItem key={serv.id} value={serv.id}>{serv.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {dadosServico && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Faturamento</span>
                  <p className="text-2xl font-bold">R$ {dadosServico.faturamento.toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                  <span className="text-sm text-muted-foreground">Vezes Realizado</span>
                  <p className="text-2xl font-bold">{dadosServico.quantidade}</p>
                </Card>
                <Card className="p-4 col-span-2">
                  <span className="text-sm text-muted-foreground">Ticket Médio</span>
                  <p className="text-2xl font-bold">R$ {dadosServico.ticketMedio.toFixed(2)}</p>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cliente" className="space-y-4">
            <Input
              placeholder="Buscar cliente..."
              value={clienteBusca}
              onChange={(e) => setClienteBusca(e.target.value)}
            />

            <div className="space-y-2">
              {clientesEstabelecimento
                .filter(c => c.nome.toLowerCase().includes(clienteBusca.toLowerCase()))
                .map(cliente => {
                  const agendamentosCliente = agendamentosEstabelecimento.filter(
                    a => a.clienteId === cliente.id && a.status === 'concluido'
                  );
                  const totalGasto = agendamentosCliente.reduce((acc, a) => acc + a.valor, 0);

                  return (
                    <Card key={cliente.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{cliente.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {agendamentosCliente.length} atendimentos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R$ {totalGasto.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total gasto</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}
