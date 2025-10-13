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

export default function Agenda() {
  const { usuario, clientes, servicos, agendamentos, bloqueios } = useApp();
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(usuario?.id || 'todos');
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  const [modalListaEspera, setModalListaEspera] = useState(false);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [menuLateralAberto, setMenuLateralAberto] = useState(false);

  // Filter agendamentos for selected date and professional
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const agData = new Date(ag.dataHora);
    const dataSel = new Date(dataSelecionada);
    
    agData.setHours(0, 0, 0, 0);
    dataSel.setHours(0, 0, 0, 0);
    
    return agData.getTime() === dataSel.getTime();
  });

  const bloqueiosFiltrados = bloqueios.filter(bl => {
    const dataSel = new Date(dataSelecionada);
    dataSel.setHours(0, 0, 0, 0);
    
    const blInicio = new Date(bl.dataInicio);
    const blFim = new Date(bl.dataFim);
    blInicio.setHours(0, 0, 0, 0);
    blFim.setHours(0, 0, 0, 0);
    
    return dataSel >= blInicio && dataSel <= blFim;
  });

  const handleIrParaHoje = () => {
    setDataSelecionada(new Date());
  };

  const handleAgendamentoClick = (agendamento: Agendamento) => {
    // TODO: Abrir modal de detalhes/edição do agendamento
    console.log('Agendamento clicado:', agendamento);
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
            <SelectItem value={usuario?.id || ''}>{usuario?.nome || 'Você'}</SelectItem>
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
    </div>
  );
}
