import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/common/BottomNav';
import { FAB } from '@/components/common/FAB';
import { Users } from 'lucide-react';

export default function Clientes() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-secondary pt-safe px-6 py-6">
        <h1 className="text-white text-2xl font-bold">Clientes</h1>
        <p className="text-white/90 text-sm mt-1">Gerencie sua base de clientes</p>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="card-flat p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Em breve: lista completa de clientes</p>
        </div>
      </div>

      <FAB onClick={() => {}} />
      <BottomNav />
    </div>
  );
}
