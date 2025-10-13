import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AvaliacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: any;
  onSubmit: (nota: number, comentario: string) => void;
}

export function AvaliacaoModal({ open, onOpenChange, agendamento, onSubmit }: AvaliacaoModalProps) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    if (nota === 0) {
      toast.error('Selecione uma avaliação');
      return;
    }

    onSubmit(nota, comentario);
    setNota(5);
    setComentario('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Atendimento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Como foi seu atendimento?
            </p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNota(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-10 w-10',
                      (hover ? star <= hover : star <= nota)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Comentário (opcional)
            </label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="O que você achou do atendimento?"
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comentario.length}/500 caracteres
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Enviar Avaliação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
