import { Menu, Globe, Megaphone, Calendar as CalendarIcon, Search, BookOpen, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { importarGoogleEventosComoBloqueio } = useApp();
  return (
    <div className="bg-white border-b sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => { try { const n = await importarGoogleEventosComoBloqueio(); if (n > 0) alert(`Importados ${n} eventos do Google`); else alert('Nada importado'); } catch {} }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Importar Google Calendar"
          >
            <Download className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Globe className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Megaphone className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
