import { Agendamento, Bloqueio, Cliente, Servico } from '@/types';
import { formatCurrency } from '@/utils/storage';

interface GradeHorariosProps {
  data: Date;
  agendamentos: Agendamento[];
  bloqueios: Bloqueio[];
  clientes: Cliente[];
  servicos: Servico[];
  profissionalId: string;
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

export function GradeHorarios({
  data,
  agendamentos,
  bloqueios,
  clientes,
  servicos,
  profissionalId,
  onAgendamentoClick
}: GradeHorariosProps) {
  // Generate time slots from 08:00 to 20:00 (30min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 20 && min > 0) break;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if slot is occupied
  const isSlotOccupied = (timeStr: string) => {
    const [hour, min] = timeStr.split(':').map(Number);
    const slotTime = new Date(data);
    slotTime.setHours(hour, min, 0, 0);

    return agendamentos.some(ag => {
      const agData = new Date(ag.dataHora);
      const agFim = new Date(agData.getTime() + ag.duracao * 60000);
      return slotTime >= agData && slotTime < agFim;
    });
  };

  // Check if slot is blocked
  const isSlotBlocked = (timeStr: string) => {
    const [hour, min] = timeStr.split(':').map(Number);
    const slotTime = new Date(data);
    slotTime.setHours(hour, min, 0, 0);

    return bloqueios.some(bl => {
      const blInicio = new Date(bl.dataInicio);
      const blFim = new Date(bl.dataFim);
      
      // Check date range
      if (slotTime < blInicio || slotTime > blFim) return false;
      
      // Check time range
      const [blHoraIni, blMinIni] = bl.horaInicio.split(':').map(Number);
      const [blHoraFim, blMinFim] = bl.horaFim.split(':').map(Number);
      
      const slotMinutes = hour * 60 + min;
      const blIniMinutes = blHoraIni * 60 + blMinIni;
      const blFimMinutes = blHoraFim * 60 + blMinFim;
      
      return slotMinutes >= blIniMinutes && slotMinutes < blFimMinutes;
    });
  };

  // Get agendamento for slot
  const getAgendamentoForSlot = (timeStr: string) => {
    const [hour, min] = timeStr.split(':').map(Number);
    const slotTime = new Date(data);
    slotTime.setHours(hour, min, 0, 0);

    return agendamentos.find(ag => {
      const agData = new Date(ag.dataHora);
      return agData.getTime() === slotTime.getTime();
    });
  };

  // Calculate slot height based on duration
  const getSlotHeight = (duracao: number) => {
    const slots = duracao / 30;
    return `${slots * 60}px`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="relative">
        {timeSlots.map((timeStr, index) => {
          const agendamento = getAgendamentoForSlot(timeStr);
          const isOccupied = isSlotOccupied(timeStr);
          const isBlocked = isSlotBlocked(timeStr);

          return (
            <div
              key={timeStr}
              className="relative border-b border-gray-200"
              style={{ height: '60px' }}
            >
              {/* Time label */}
              <div className="absolute left-0 top-0 w-16 h-full flex items-start justify-center pt-1">
                <span className="text-xs text-gray-500 font-medium">{timeStr}</span>
              </div>

              {/* Slot area */}
              <div className="ml-16 h-full">
                {agendamento ? (
                  <div
                    onClick={() => onAgendamentoClick(agendamento)}
                    className="absolute left-16 right-2 bg-primary/10 border-l-4 border-primary rounded p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                    style={{ height: getSlotHeight(agendamento.duracao) }}
                  >
                    <div className="text-xs font-semibold text-primary mb-1">
                      {clientes.find(c => c.id === agendamento.clienteId)?.nome || 'Cliente'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {servicos.find(s => s.id === agendamento.servicoId)?.nome || 'Serviço'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {agendamento.duracao}min • {formatCurrency(agendamento.valor)}
                    </div>
                  </div>
                ) : isBlocked ? (
                  <div className="h-full bg-gray-300 bg-stripe rounded mr-2 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">Bloqueado</span>
                  </div>
                ) : (
                  <div className="h-full hover:bg-gray-100 rounded mr-2 transition-colors cursor-pointer" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
