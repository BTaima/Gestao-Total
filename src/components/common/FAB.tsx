import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-xl z-40",
        "flex items-center justify-center",
        "gradient-primary text-primary-foreground",
        "transform transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
