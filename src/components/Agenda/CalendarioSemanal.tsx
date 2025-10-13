import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioSemanalProps {
  dataSelecionada: Date;
  onDataChange: (data: Date) => void;
}

export function CalendarioSemanal({ dataSelecionada, onDataChange }: CalendarioSemanalProps) {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Get current week dates
  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const week = [];
    
    // Start from Sunday
    curr.setDate(curr.getDate() - curr.getDay());
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    return week;
  };

  const weekDates = getWeekDates(dataSelecionada);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const handlePrevWeek = () => {
    const newDate = new Date(dataSelecionada);
    newDate.setDate(newDate.getDate() - 7);
    onDataChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(dataSelecionada);
    newDate.setDate(newDate.getDate() + 7);
    onDataChange(newDate);
  };

  const isToday = (date: Date) => {
    return date.getTime() === hoje.getTime();
  };

  const isSelecionado = (date: Date) => {
    const sel = new Date(dataSelecionada);
    sel.setHours(0, 0, 0, 0);
    return date.getTime() === sel.getTime();
  };

  return (
    <div className="bg-white border-b">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-sm font-semibold text-gray-700">
          {weekDates[0].toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
        </h2>
        
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 px-2 pb-3">
        {weekDates.map((date, index) => {
          const isHoje = isToday(date);
          const selected = isSelecionado(date);
          
          return (
            <button
              key={index}
              onClick={() => onDataChange(date)}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                isHoje
                  ? 'bg-red-500 text-white font-bold'
                  : selected
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className={`text-xs mb-1 ${isHoje || selected ? 'text-white' : 'text-gray-500'}`}>
                {diasSemana[date.getDay()]}
              </span>
              <span className={`text-lg font-semibold ${isHoje || selected ? 'text-white' : 'text-gray-700'}`}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
