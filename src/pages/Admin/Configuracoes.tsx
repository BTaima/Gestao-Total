import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

export default function Configuracoes() {
  const { regenerarCodigoAcesso } = useApp();
  const [config, setConfig] = useState({
    mostrarNomeProfissional: true,
    mostrarFotoProfissional: true,
    mostrarValorServicos: true,
    mostrarDuracao: true,
    permitirEscolherProfissional: true,
    mostrarAvaliacoes: true,
    permitirObservacoes: true,
    antecedenciaMinima: 2,
    antecedenciaMaxima: 30,
    cancelamentoPermitido: 24,
    limiteAgendamentos: 3,
    mensagemBoasVindas: 'Bem-vindo! Agende seu horário.',
    corPrimaria: '#6366f1'
  });

  const handleSalvar = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  const [codigo, setCodigo] = useState<string>('********');
  const handleRegerarCodigo = async () => {
    const novo = await regenerarCodigoAcesso();
    if (novo) {
      setCodigo(novo);
      try { await navigator.clipboard.writeText(novo); } catch {}
      toast.success('Código regenerado e copiado');
    } else {
      toast.error('Não foi possível regenerar o código');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configurações do App Cliente
          </h1>
          <p className="text-muted-foreground">Configure como os clientes visualizam o sistema</p>
        </div>

        <div className="space-y-6">
          {/* Visibilidade de Informações */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Visibilidade de Informações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mostrar nome do profissional</Label>
                <Switch
                  checked={config.mostrarNomeProfissional}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, mostrarNomeProfissional: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar foto do profissional</Label>
                <Switch
                  checked={config.mostrarFotoProfissional}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, mostrarFotoProfissional: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar valor dos serviços</Label>
                <Switch
                  checked={config.mostrarValorServicos}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, mostrarValorServicos: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar duração estimada</Label>
                <Switch
                  checked={config.mostrarDuracao}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, mostrarDuracao: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Permitir cliente escolher profissional</Label>
                <Switch
                  checked={config.permitirEscolherProfissional}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, permitirEscolherProfissional: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar avaliações</Label>
                <Switch
                  checked={config.mostrarAvaliacoes}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, mostrarAvaliacoes: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Permitir observações no agendamento</Label>
                <Switch
                  checked={config.permitirObservacoes}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, permitirObservacoes: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Regras de Agendamento */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Regras de Agendamento</h3>
            <div className="space-y-6">
              <div>
                <Label>Antecedência mínima: {config.antecedenciaMinima}h</Label>
                <Slider
                  value={[config.antecedenciaMinima]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, antecedenciaMinima: value })
                  }
                  min={1}
                  max={48}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Antecedência máxima: {config.antecedenciaMaxima} dias</Label>
                <Slider
                  value={[config.antecedenciaMaxima]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, antecedenciaMaxima: value })
                  }
                  min={7}
                  max={90}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Cancelamento permitido até: {config.cancelamentoPermitido}h antes</Label>
                <Slider
                  value={[config.cancelamentoPermitido]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, cancelamentoPermitido: value })
                  }
                  min={1}
                  max={48}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Limite de agendamentos por dia</Label>
                <Input
                  type="number"
                  value={config.limiteAgendamentos}
                  onChange={(e) =>
                    setConfig({ ...config, limiteAgendamentos: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                  max={10}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Aparência */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aparência do App Cliente</h3>
            <div className="space-y-4">
              <div>
                <Label>Mensagem de boas-vindas</Label>
                <Input
                  value={config.mensagemBoasVindas}
                  onChange={(e) =>
                    setConfig({ ...config, mensagemBoasVindas: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Cor primária</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={config.corPrimaria}
                    onChange={(e) => setConfig({ ...config, corPrimaria: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input value={config.corPrimaria} readOnly />
                </div>
              </div>
            </div>
          </Card>

          {/* Código de acesso do estabelecimento */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Código de acesso para clientes</h3>
            <p className="text-sm text-muted-foreground mb-2">Compartilhe este código com seus clientes para que possam vincular e ver seus serviços.</p>
            <div className="flex gap-2">
              <Input readOnly value={codigo} />
              <Button variant="outline" onClick={() => { try { navigator.clipboard.writeText(codigo); toast.success('Código copiado'); } catch {} }}>Copiar</Button>
              <Button onClick={handleRegerarCodigo}>Regenerar</Button>
            </div>
          </Card>

          <Button onClick={handleSalvar} className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
