import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Bloqueio } from '@/types';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

interface BloqueioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissionalId: string;
}

export function BloqueioModal({
  open,
  onOpenChange,
  profissionalId
}: BloqueioModalProps) {
  const { adicionarBloqueio } = useApp();
  const [motivo, setMotivo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo || !dataInicio || !dataFim) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive'
      });
      return;
    }

    const [yearIni, monthIni, dayIni] = dataInicio.split('-').map(Number);
    const [yearFim, monthFim, dayFim] = dataFim.split('-').map(Number);

    const novoBloqueio: Omit<Bloqueio, 'id' | 'dataCriacao'> = {
      profissionalId,
      motivo,
      dataInicio: new Date(yearIni, monthIni - 1, dayIni),
      dataFim: new Date(yearFim, monthFim - 1, dayFim),
      horaInicio,
      horaFim
    };

    adicionarBloqueio(novoBloqueio);

    toast({
      title: 'Bloqueio criado!',
      description: 'Horário bloqueado com sucesso.',
    });

    // Reset form
    setMotivo('');
    setDataInicio('');
    setDataFim('');
    setHoraInicio('08:00');
    setHoraFim('18:00');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-700">Novo Bloqueio de Horário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo do Bloqueio *</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Férias, Manutenção, Almoço..."
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horaInicio">Hora Início *</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="horaFim">Hora Fim *</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-700 hover:bg-gray-800"
            >
              Bloquear Horário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
