import { Plus, X, BookOpen, Lock, Calendar } from 'lucide-react';
import { useState } from 'react';

interface FABMenuProps {
  onNovoAgendamento: () => void;
  onListaEspera: () => void;
  onBloqueio: () => void;
}

export function FABMenu({ onNovoAgendamento, onListaEspera, onBloqueio }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        />
      )}

      {/* Menu options */}
      {isOpen && (
        <div className="fixed right-4 bottom-32 z-50 flex flex-col gap-3 animate-scale-in">
          <button
            onClick={() => {
              onListaEspera();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Lista de Espera
            </span>
          </button>

          <button
            onClick={() => {
              onBloqueio();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Novo Compromisso/Bloqueio
            </span>
          </button>

          <button
            onClick={() => {
              onNovoAgendamento();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Novo Agendamento
            </span>
          </button>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={toggleMenu}
        className="fixed right-4 bottom-20 w-16 h-16 rounded-full bg-primary shadow-xl z-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <Plus className="w-7 h-7 text-white" />
        )}
      </button>
    </>
  );
}
