import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Briefcase, Store, Scissors, CheckCircle2 } from 'lucide-react';

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const { criarEstabelecimento, adicionarServico, usuario } = useApp();
  const [step, setStep] = useState(1);
  const [profissao, setProfissao] = useState('');
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [servicos, setServicos] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);

  const handleProfissaoNext = () => {
    if (!profissao.trim()) {
      toast.error('Digite sua profissão');
      return;
    }
    setStep(2);
  };

  const handleNegocioNext = () => {
    if (!nomeNegocio.trim()) {
      toast.error('Digite o nome do seu negócio');
      return;
    }
    setStep(3);
  };

  const handleServicoChange = (index: number, value: string) => {
    const newServicos = [...servicos];
    newServicos[index] = value;
    setServicos(newServicos);
  };

  const addServicoField = () => {
    setServicos([...servicos, '']);
  };

  const handleFinalizar = async () => {
    const servicosPreenchidos = servicos.filter(s => s.trim());
    
    if (servicosPreenchidos.length < 3) {
      toast.error('Adicione pelo menos 3 serviços');
      return;
    }

    if (!telefone.trim()) {
      toast.error('Digite um telefone');
      return;
    }

    setLoading(true);

    try {
      // Criar estabelecimento e promover usuário
      const result = await criarEstabelecimento(nomeNegocio, telefone, profissao);

      if (!result) {
        toast.error('Erro ao criar estabelecimento');
        setLoading(false);
        return;
      }

      // Add services
      for (const nome of servicosPreenchidos) {
        await adicionarServico({
          nome,
          duracao: 60,
          valor: 0,
          cor: '#6366f1',
          ativo: true,
          exigePagamentoAntecipado: false,
          destaque: false,
          profissionaisIds: [],
          estabelecimentoId: result.estabelecimentoId,
        });
      }

      toast.success(`Estabelecimento criado! Código: ${result.codigoAcesso}`);
      navigate('/home');
    } catch (error) {
      console.error('Erro no onboarding:', error);
      toast.error('Erro ao finalizar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <div className="pt-safe px-6 py-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Passo {step} de 3
        </p>
      </div>

      <div className="flex-1 px-6 py-8">
        {/* Step 1: Profissão */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Qual é a sua profissão?</h2>
              <p className="text-muted-foreground">
                Isso nos ajuda a personalizar sua experiência
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  type="text"
                  placeholder="Ex: Cabeleireira, Personal Trainer, Advogado..."
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleProfissaoNext}
                className="w-full btn-gradient h-12 text-base"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Nome do Negócio */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Qual o nome do seu negócio?</h2>
              <p className="text-muted-foreground">
                Como seus clientes te conhecem?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="negocio">Nome do negócio</Label>
                <Input
                  id="negocio"
                  type="text"
                  placeholder="Ex: Salão Beleza Total, Studio Fit..."
                  value={nomeNegocio}
                  onChange={(e) => setNomeNegocio(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleNegocioNext}
                  className="flex-1 btn-gradient h-12"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Serviços */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Quais serviços você oferece?</h2>
              <p className="text-muted-foreground">
                Adicione pelo menos 3 serviços principais
              </p>
            </div>

            <div className="space-y-4 mb-4">
              {servicos.map((servico, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`servico-${index}`}>Serviço {index + 1}</Label>
                  <Input
                    id={`servico-${index}`}
                    type="text"
                    placeholder="Ex: Corte feminino, Coloração..."
                    value={servico}
                    onChange={(e) => handleServicoChange(index, e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addServicoField}
                className="w-full h-12"
              >
                + Adicionar mais serviço
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-12"
              >
                Voltar
              </Button>
              <Button
                onClick={handleFinalizar}
                className="flex-1 btn-gradient h-12"
                disabled={loading}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {loading ? 'Criando...' : 'Finalizar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
