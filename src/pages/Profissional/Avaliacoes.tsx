import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/common/BottomNav';
import { useApp } from '@/context/AppContext';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Avaliacoes() {
  const { avaliacoes, clientes, usuario, atualizarAvaliacao } = useApp();
  const [respostaAberta, setRespostaAberta] = useState<string | null>(null);
  const [textoResposta, setTextoResposta] = useState('');

  const avaliacoesProfissional = avaliacoes.filter(
    a => a.profissionalId === usuario?.id
  );

  const mediaAvaliacoes = avaliacoesProfissional.length > 0
    ? avaliacoesProfissional.reduce((acc, a) => acc + a.nota, 0) / avaliacoesProfissional.length
    : 0;

  const distribuicao = [5, 4, 3, 2, 1].map(nota => ({
    nota,
    quantidade: avaliacoesProfissional.filter(a => a.nota === nota).length
  }));

  const handleResponder = (avaliacaoId: string) => {
    if (!textoResposta.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    atualizarAvaliacao(avaliacaoId, { resposta: textoResposta });
    toast.success('Resposta enviada');
    setRespostaAberta(null);
    setTextoResposta('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Minhas Avaliações</h1>

        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">{mediaAvaliacoes.toFixed(1)}</span>
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-muted-foreground">
              {avaliacoesProfissional.length} avaliações
            </p>
          </div>

          <div className="space-y-2">
            {distribuicao.map(({ nota, quantidade }) => (
              <div key={nota} className="flex items-center gap-2">
                <span className="text-sm w-8">{nota} ★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${avaliacoesProfissional.length > 0 ? (quantidade / avaliacoesProfissional.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{quantidade}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          {avaliacoesProfissional.map(avaliacao => {
            const cliente = clientes.find(c => c.id === avaliacao.clienteId);
            
            return (
              <Card key={avaliacao.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{cliente?.nome[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{cliente?.nome || 'Cliente'}</p>
                    <div className="flex items-center gap-1 mb-1">
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
                      {format(avaliacao.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {avaliacao.comentario && (
                  <p className="text-sm mb-3">{avaliacao.comentario}</p>
                )}

                {avaliacao.resposta ? (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Sua resposta:</p>
                    <p className="text-sm">{avaliacao.resposta}</p>
                  </div>
                ) : respostaAberta === avaliacao.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={textoResposta}
                      onChange={(e) => setTextoResposta(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResponder(avaliacao.id)}>
                        Enviar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRespostaAberta(null);
                          setTextoResposta('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRespostaAberta(avaliacao.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                )}
              </Card>
            );
          })}

          {avaliacoesProfissional.length === 0 && (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
