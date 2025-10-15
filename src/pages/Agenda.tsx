import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { useState } from 'react';
import { TopBar } from '@/components/Agenda/TopBar';
import { CalendarioSemanal } from '@/components/Agenda/CalendarioSemanal';
import { GradeHorarios } from '@/components/Agenda/GradeHorarios';
import { FABMenu } from '@/components/Agenda/FABMenu';
import { NovoAgendamentoModal } from '@/components/Agenda/NovoAgendamentoModal';
import { ListaEsperaModal } from '@/components/Agenda/ListaEsperaModal';
import { BloqueioModal } from '@/components/Agenda/BloqueioModal';
import { MenuLateral } from '@/components/Agenda/MenuLateral';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Agendamento } from '@/types';
import { Profissional } from '@/types';
import { AgendamentoDetalhesModal } from '@/components/Agenda/AgendamentoDetalhesModal';

export default function Agenda() {
  const { usuario, clientes, servicos, agendamentos, bloqueios, profissionais } = useApp() as any;
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('todos');
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  const [modalListaEspera, setModalListaEspera] = useState(false);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [menuLateralAberto, setMenuLateralAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  // Filter agendamentos for selected date and professional
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const agData = new Date(ag.dataHora);
    const dataSel = new Date(dataSelecionada);
    
    agData.setHours(0, 0, 0, 0);
    dataSel.setHours(0, 0, 0, 0);
    
    const mesmaData = agData.getTime() === dataSel.getTime();
    const mesmoProf = profissionalSelecionado === 'todos' || ag.profissionalId === profissionalSelecionado;
    return mesmaData && mesmoProf;
  });

  const bloqueiosFiltrados = bloqueios.filter(bl => {
    const dataSel = new Date(dataSelecionada);
    dataSel.setHours(0, 0, 0, 0);
    
    const blInicio = new Date(bl.dataInicio);
    const blFim = new Date(bl.dataFim);
    blInicio.setHours(0, 0, 0, 0);
    blFim.setHours(0, 0, 0, 0);
    
    const noDia = dataSel >= blInicio && dataSel <= blFim;
    const mesmoProf = profissionalSelecionado === 'todos' || bl.profissionalId === profissionalSelecionado;
    return noDia && mesmoProf;
  });

  const handleIrParaHoje = () => {
    setDataSelecionada(new Date());
  };

  const handleAgendamentoClick = (agendamento: Agendamento) => {
    // If clicking on empty slot (synthetic id), open create modal preset to that time
    if (agendamento.id.startsWith('slot-')) {
      setModalNovoAgendamento(true);
      setDataSelecionada(new Date(agendamento.dataHora));
      return;
    }
    setAgendamentoSelecionado(agendamento);
  };

  const dataFormatada = dataSelecionada.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      <TopBar onMenuClick={() => setMenuLateralAberto(true)} />
      
      <CalendarioSemanal
        dataSelecionada={dataSelecionada}
        onDataChange={setDataSelecionada}
      />

      {/* Date display */}
      <div className="px-4 py-3 bg-white border-b">
        <p className="text-sm text-primary font-semibold capitalize">
          Hoje, {dataFormatada}
        </p>
      </div>

      {/* Professional selector */}
      <div className="px-4 py-3 bg-white border-b">
        <Select value={profissionalSelecionado} onValueChange={setProfissionalSelecionado}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os profissionais</SelectItem>
            {profissionais?.map((p: Profissional) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedule grid */}
      <GradeHorarios
        data={dataSelecionada}
        agendamentos={agendamentosFiltrados}
        bloqueios={bloqueiosFiltrados}
        clientes={clientes}
        servicos={servicos}
        profissionalId={profissionalSelecionado}
        onAgendamentoClick={handleAgendamentoClick}
      />

      {/* Today button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
        <Button
          onClick={handleIrParaHoje}
          className="bg-primary hover:bg-primary/90 shadow-lg"
        >
          Hoje
        </Button>
      </div>

      {/* FAB Menu */}
      <FABMenu
        onNovoAgendamento={() => setModalNovoAgendamento(true)}
        onListaEspera={() => setModalListaEspera(true)}
        onBloqueio={() => setModalBloqueio(true)}
      />

      {/* Modals */}
      <NovoAgendamentoModal
        open={modalNovoAgendamento}
        onOpenChange={setModalNovoAgendamento}
        dataSelecionada={dataSelecionada}
        clientes={clientes}
        servicos={servicos}
        profissionais={profissionais || []}
        profissionalDefaultId={profissionalSelecionado !== 'todos' ? profissionalSelecionado : (usuario?.id || '')}
      />

      <ListaEsperaModal
        open={modalListaEspera}
        onOpenChange={setModalListaEspera}
        clientes={clientes}
        servicos={servicos}
      />

      <BloqueioModal
        open={modalBloqueio}
        onOpenChange={setModalBloqueio}
        profissionalId={usuario?.id || ''}
      />

      {/* Sidebar */}
      <MenuLateral
        open={menuLateralAberto}
        onClose={() => setMenuLateralAberto(false)}
      />

      <BottomNav />

      {agendamentoSelecionado && (
        <AgendamentoDetalhesModal
          open={!!agendamentoSelecionado}
          onOpenChange={(o) => !o && setAgendamentoSelecionado(null)}
          agendamento={agendamentoSelecionado}
          clientes={clientes}
          servicos={servicos}
        />
      )}
    </div>
  );
}
