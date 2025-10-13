import { Calendar, BookOpen, Lock, User, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuLateralProps {
  open: boolean;
  onClose: () => void;
}

export function MenuLateral({ open, onClose }: MenuLateralProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: BookOpen, label: 'Lista de Espera', path: '/lista-espera' },
    { icon: Lock, label: 'Bloqueios', path: '/bloqueios' },
    { icon: User, label: 'Perfil', path: '/perfil' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl animate-slide-in-right">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">Agenda Smart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
