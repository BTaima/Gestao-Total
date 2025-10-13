import { useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const { notificacoes, marcarNotificacaoLida, marcarTodasLidas, limparNotificacoesAntigas } = useApp();
  const [open, setOpen] = useState(false);

  const naoLidas = notificacoes.filter(n => !n.lida);

  const handleMarcarLida = (id: string) => {
    marcarNotificacaoLida(id);
  };

  const handleMarcarTodasLidas = () => {
    marcarTodasLidas();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {naoLidas.length > 9 ? '9+' : naoLidas.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {naoLidas.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLidas}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notificacoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors",
                    !notificacao.lida && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{notificacao.titulo}</p>
                      <p className="text-sm text-muted-foreground">{notificacao.mensagem}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notificacao.data, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMarcarLida(notificacao.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notificacoes.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={limparNotificacoesAntigas}
              className="w-full text-xs"
            >
              Limpar notificações antigas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
