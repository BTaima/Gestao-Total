import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Agendar() {
  const { servicos, usuario, adicionarAgendamento, clientes } = useApp();
  const [passo, setPasso] = useState(1);
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState<Date>();
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const navigate = useNavigate();

  const servicosAtivos = servicos.filter(s => s.ativo);

  const horariosDisponiveis = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleConfirmar = () => {
    if (!servicoSelecionado || !dataSelecionada || !horaSelecionada) {
      toast.error('Preencha todos os campos');
      return;
    }

    const servico = servicos.find(s => s.id === servicoSelecionado);
    if (!servico || !usuario) return;
    // Mapear o clienteId real (tabela clientes) pelo user atual
    const meuCliente = clientes.find(c => c.email === usuario.email || c.telefone === usuario.telefone);
    const clienteId = meuCliente?.id || usuario.id; // fallback

    const [hora, minuto] = horaSelecionada.split(':').map(Number);
    const dataHora = new Date(dataSelecionada);
    dataHora.setHours(hora, minuto);

    adicionarAgendamento({
      clienteId,
      servicoId: servicoSelecionado,
      dataHora,
      duracao: servico.duracao,
      status: 'agendado',
      valor: servico.valor,
      pagamentoAntecipado: false,
      pagamentoStatus: 'pendente',
      observacoes: '',
      estabelecimentoId: usuario.estabelecimentoId
    });

    toast.success('Agendamento realizado com sucesso!');
    navigate('/meus-agendamentos');
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => passo > 1 ? setPasso(passo - 1) : navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Novo Agendamento</h1>

        {passo === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Escolha o Serviço</h3>
            <div className="grid gap-3">
              {servicosAtivos.map(servico => (
                <Card 
                  key={servico.id}
                  className={`p-4 cursor-pointer transition-all ${servicoSelecionado === servico.id ? 'border-primary' : ''}`}
                  onClick={() => {
                    setServicoSelecionado(servico.id);
                    setPasso(2);
                  }}
                >
                  <h4 className="font-semibold">{servico.nome}</h4>
                  <p className="text-sm text-muted-foreground">{servico.duracao} min - R$ {servico.valor.toFixed(2)}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {passo === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Escolha a Data</h3>
            <Card className="p-4 flex justify-center">
              <Calendar mode="single" selected={dataSelecionada} onSelect={(date) => {
                setDataSelecionada(date);
                if (date) setPasso(3);
              }} />
            </Card>
          </div>
        )}

        {passo === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Escolha o Horário</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {horariosDisponiveis.map(hora => (
                <Button
                  key={hora}
                  variant={horaSelecionada === hora ? 'default' : 'outline'}
                  onClick={() => setHoraSelecionada(hora)}
                >
                  {hora}
                </Button>
              ))}
            </div>
            <Button onClick={handleConfirmar} className="w-full" disabled={!horaSelecionada}>
              Confirmar Agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
