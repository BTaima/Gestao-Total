import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/common/BottomNav';
import { useApp } from '@/context/AppContext';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AvaliacoesAdmin() {
  const { avaliacoes, clientes, profissionais, servicos, usuario, atualizarAvaliacao } = useApp();
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>('todos');
  const [notaFiltro, setNotaFiltro] = useState<string>('todas');

  const avaliacoesEstabelecimento = avaliacoes.filter(
    a => a.estabelecimentoId === usuario?.estabelecimentoId
  );

  const profissionaisEstabelecimento = profissionais?.filter(
    p => p.estabelecimentoId === usuario?.estabelecimentoId
  ) || [];

  const avaliacoesFiltradas = avaliacoesEstabelecimento.filter(a => {
    if (profissionalFiltro !== 'todos' && a.profissionalId !== profissionalFiltro) return false;
    if (notaFiltro !== 'todas' && a.nota !== parseInt(notaFiltro)) return false;
    return true;
  });

  const mediaGeral = avaliacoesEstabelecimento.length > 0
    ? avaliacoesEstabelecimento.reduce((acc, a) => acc + a.nota, 0) / avaliacoesEstabelecimento.length
    : 0;

  const handleToggleVisibilidade = (avaliacaoId: string, visivel: boolean) => {
    atualizarAvaliacao(avaliacaoId, { visivel });
    toast.success(visivel ? 'Avaliação tornada visível' : 'Avaliação ocultada');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Gerenciar Avaliações</h1>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold">{mediaGeral.toFixed(1)}</span>
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Média geral • {avaliacoesEstabelecimento.length} avaliações
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Select value={profissionalFiltro} onValueChange={setProfissionalFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {profissionaisEstabelecimento.map(prof => (
                <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={notaFiltro} onValueChange={setNotaFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {[5, 4, 3, 2, 1].map(nota => (
                <SelectItem key={nota} value={nota.toString()}>{nota} ★</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {avaliacoesFiltradas.map(avaliacao => {
            const cliente = clientes.find(c => c.id === avaliacao.clienteId);
            const profissional = profissionaisEstabelecimento.find(p => p.id === avaliacao.profissionalId);
            const servico = servicos.find(s => s.id === avaliacao.servicoId);

            return (
              <Card key={avaliacao.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{cliente?.nome[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{cliente?.nome || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground">
                      {profissional?.nome} • {servico?.nome}
                    </p>
                    <div className="flex items-center gap-1 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < avaliacao.nota
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(avaliacao.data, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {avaliacao.comentario && (
                  <p className="text-sm mb-3">{avaliacao.comentario}</p>
                )}

                {avaliacao.resposta && (
                  <div className="bg-muted p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium mb-1">Resposta do profissional:</p>
                    <p className="text-sm">{avaliacao.resposta}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    {avaliacao.visivel ? 'Visível publicamente' : 'Oculta'}
                  </span>
                  <Switch
                    checked={avaliacao.visivel}
                    onCheckedChange={(checked) => handleToggleVisibilidade(avaliacao.id, checked)}
                  />
                </div>
              </Card>
            );
          })}

          {avaliacoesFiltradas.length === 0 && (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
