import { useState } from 'react';
import { Crown, Briefcase, User, Building2, Users, Key, Palette, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type PerfilSelecionado = 'admin' | 'profissional' | 'cliente' | null;

const CATEGORIAS_ESTABELECIMENTO = [
  'Salão de Beleza',
  'Barbearia',
  'Clínica de Estética',
  'Spa',
  'Studio de Tatuagem',
  'Clínica Médica',
  'Clínica Odontológica',
  'Academia',
  'Studio de Pilates',
  'Consultório',
  'Outro'
];

const CATEGORIAS_SERVICO = [
  'Cabelo',
  'Unha',
  'Pele/Estética',
  'Massagem',
  'Maquiagem',
  'Barba',
  'Depilação',
  'Sobrancelha',
  'Saúde',
  'Fitness',
  'Outro'
];

const CORES_APP = [
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Laranja', valor: '#F97316' },
  { nome: 'Vermelho', valor: '#EF4444' },
];

export default function SelecaoPerfil() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilSelecionado>(null);
  const [loading, setLoading] = useState(false);
  const { criarEstabelecimento, atualizarUsuario, vincularClientePorCodigo, usuario } = useApp();
  const navigate = useNavigate();

  // Dados do Administrador
  const [adminData, setAdminData] = useState({
    nomeEstabelecimento: '',
    categoriaEstabelecimento: '',
    corPrimaria: '#3B82F6',
    numProfissionais: '1',
    telefone: '',
  });

  // Dados do Profissional
  const [profData, setProfData] = useState({
    nome: usuario?.nome || '',
    telefone: '',
    codigoAdmin: '',
    categorias: [''],
    servicos: [{ nome: '', preco: '', descricao: '', categoria: '' }],
  });

  // Dados do Cliente
  const [clienteData, setClienteData] = useState({
    nome: usuario?.nome || '',
    telefone: '',
    codigoAcesso: '',
    corPreferida: '#3B82F6',
  });

  const handleAdminSubmit = async () => {
    if (!adminData.nomeEstabelecimento || !adminData.categoriaEstabelecimento || !adminData.telefone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const result = await criarEstabelecimento(
        adminData.nomeEstabelecimento,
        adminData.telefone,
        adminData.categoriaEstabelecimento
      );

      if (result) {
        toast.success(`Estabelecimento criado! Seu código de acesso é: ${result.codigoAcesso}`, {
          duration: 10000,
          description: 'Compartilhe este código com seus profissionais e clientes'
        });
        
        await atualizarUsuario({
          telefone: adminData.telefone,
          configuracoes: {
            ...usuario?.configuracoes,
            corPrimaria: adminData.corPrimaria,
          } as any,
        });
        
        navigate('/home');
      } else {
        toast.error('Erro ao criar estabelecimento');
      }
    } catch (error) {
      toast.error('Erro ao criar estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleProfissionalSubmit = async () => {
    if (!profData.nome || !profData.telefone || !profData.codigoAdmin) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Primeiro, criar role de profissional
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Criar role de profissional
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'profissional'
      });

      // Vincular ao estabelecimento usando código do admin
      const vinculado = await vincularClientePorCodigo(profData.codigoAdmin);
      
      if (vinculado) {
        await atualizarUsuario({
          nome: profData.nome,
          telefone: profData.telefone,
        });

        toast.success('Cadastro profissional solicitado! Aguarde aprovação do administrador.');
        
        // Recarregar a página para atualizar o contexto
        window.location.href = '/agenda';
      } else {
        // Remover role se falhou
        await supabase.from('user_roles').delete().eq('user_id', user.id).eq('role', 'profissional');
        toast.error('Código de acesso inválido');
      }
    } catch (error) {
      toast.error('Erro ao vincular profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSubmit = async () => {
    if (!clienteData.nome || !clienteData.telefone || !clienteData.codigoAcesso) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Primeiro, criar role de cliente
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Criar role de cliente
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'cliente'
      });

      const vinculado = await vincularClientePorCodigo(clienteData.codigoAcesso);
      
      if (vinculado) {
        await atualizarUsuario({
          nome: clienteData.nome,
          telefone: clienteData.telefone,
          configuracoes: {
            ...usuario?.configuracoes,
            corPrimaria: clienteData.corPreferida,
          } as any,
        });

        toast.success('Conta vinculada com sucesso!');
        
        // Recarregar a página para atualizar o contexto
        window.location.href = '/cliente/home';
      } else {
        // Remover role se falhou
        await supabase.from('user_roles').delete().eq('user_id', user.id).eq('role', 'cliente');
        toast.error('Código de acesso inválido');
      }
    } catch (error) {
      toast.error('Erro ao vincular cliente');
    } finally {
      setLoading(false);
    }
  };

  const addCategoria = () => {
    setProfData({ ...profData, categorias: [...profData.categorias, ''] });
  };

  const addServico = () => {
    setProfData({
      ...profData,
      servicos: [...profData.servicos, { nome: '', preco: '', descricao: '', categoria: '' }]
    });
  };

  const updateCategoria = (index: number, value: string) => {
    const newCategorias = [...profData.categorias];
    newCategorias[index] = value;
    setProfData({ ...profData, categorias: newCategorias });
  };

  const updateServico = (index: number, field: string, value: string) => {
    const newServicos = [...profData.servicos];
    newServicos[index] = { ...newServicos[index], [field]: value };
    setProfData({ ...profData, servicos: newServicos });
  };

  if (!perfilSelecionado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Escolha seu perfil</h1>
            <p className="text-muted-foreground">Como você deseja usar o sistema?</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:scale-105"
              onClick={() => setPerfilSelecionado('admin')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Administrador</h3>
                  <p className="text-sm text-muted-foreground">
                    Sou dono de um estabelecimento e quero gerenciar meu negócio
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:scale-105"
              onClick={() => setPerfilSelecionado('profissional')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Profissional</h3>
                  <p className="text-sm text-muted-foreground">
                    Trabalho em um estabelecimento e quero gerenciar minha agenda
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:scale-105"
              onClick={() => setPerfilSelecionado('cliente')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Cliente</h3>
                  <p className="text-sm text-muted-foreground">
                    Quero agendar serviços e acompanhar meus atendimentos
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Formulário do Administrador
  if (perfilSelecionado === 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <Button 
            variant="ghost" 
            onClick={() => setPerfilSelecionado(null)}
            className="mb-4"
          >
            ← Voltar
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Configurar Estabelecimento</h2>
              <p className="text-sm text-muted-foreground">Preencha os dados do seu negócio</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nome do Estabelecimento */}
            <div className="space-y-2">
              <Label htmlFor="nome-estabelecimento">Nome do Estabelecimento *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="nome-estabelecimento"
                  placeholder="Ex: Salão Beleza Total"
                  value={adminData.nomeEstabelecimento}
                  onChange={(e) => setAdminData({ ...adminData, nomeEstabelecimento: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria do Estabelecimento */}
            <div className="space-y-2">
              <Label htmlFor="categoria-estabelecimento">Categoria do Estabelecimento *</Label>
              <Select
                value={adminData.categoriaEstabelecimento}
                onValueChange={(value) => setAdminData({ ...adminData, categoriaEstabelecimento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone do Estabelecimento *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={adminData.telefone}
                  onChange={(e) => setAdminData({ ...adminData, telefone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Personalização - Cor do App */}
            <div className="space-y-2">
              <Label htmlFor="cor-app">Personalizar Cor do Aplicativo</Label>
              <div className="flex gap-3">
                {CORES_APP.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setAdminData({ ...adminData, corPrimaria: cor.valor })}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      adminData.corPrimaria === cor.valor ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>

            {/* Número de Profissionais */}
            <div className="space-y-2">
              <Label htmlFor="num-profissionais">Quantos profissionais trabalham com você?</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="num-profissionais"
                  type="number"
                  min="1"
                  placeholder="Ex: 5"
                  value={adminData.numProfissionais}
                  onChange={(e) => setAdminData({ ...adminData, numProfissionais: e.target.value })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Você poderá adicionar profissionais depois usando o código de acesso que será gerado
              </p>
            </div>

            {/* Informação sobre códigos */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2 items-start">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Códigos de Acesso
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Após criar o estabelecimento, você receberá um código único. 
                    Compartilhe este código com seus profissionais e clientes para que eles possam se vincular ao seu estabelecimento.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAdminSubmit}
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? 'Criando estabelecimento...' : 'Criar Estabelecimento'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Formulário do Profissional
  if (perfilSelecionado === 'profissional') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
          <Button 
            variant="ghost" 
            onClick={() => setPerfilSelecionado(null)}
            className="mb-4"
          >
            ← Voltar
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cadastro Profissional</h2>
              <p className="text-sm text-muted-foreground">Configure seu perfil profissional</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome-prof">Seu Nome Completo *</Label>
              <Input
                id="nome-prof"
                placeholder="Digite seu nome"
                value={profData.nome}
                onChange={(e) => setProfData({ ...profData, nome: e.target.value })}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone-prof">Seu Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="telefone-prof"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={profData.telefone}
                  onChange={(e) => setProfData({ ...profData, telefone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Código do Administrador */}
            <div className="space-y-2">
              <Label htmlFor="codigo-admin">Código de Acesso do Administrador *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="codigo-admin"
                  placeholder="Digite o código fornecido pelo administrador"
                  value={profData.codigoAdmin}
                  onChange={(e) => setProfData({ ...profData, codigoAdmin: e.target.value.toUpperCase() })}
                  className="pl-10 uppercase"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Peça ao administrador do estabelecimento o código de acesso
              </p>
            </div>

            {/* Categorias de Serviços */}
            <div className="space-y-2">
              <Label>Categorias de Serviços que você oferece (opcional)</Label>
              {profData.categorias.map((categoria, index) => (
                <Select
                  key={index}
                  value={categoria}
                  onValueChange={(value) => updateCategoria(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_SERVICO.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCategoria}
                className="w-full"
              >
                + Adicionar Categoria
              </Button>
            </div>

            {/* Serviços */}
            <div className="space-y-3">
              <Label>Seus Serviços (opcional - pode adicionar depois)</Label>
              {profData.servicos.map((servico, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <Input
                    placeholder="Nome do serviço (ex: Corte feminino)"
                    value={servico.nome}
                    onChange={(e) => updateServico(index, 'nome', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Preço (R$)"
                      type="number"
                      value={servico.preco}
                      onChange={(e) => updateServico(index, 'preco', e.target.value)}
                    />
                    <Select
                      value={servico.categoria}
                      onValueChange={(value) => updateServico(index, 'categoria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS_SERVICO.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Descrição (opcional)"
                    value={servico.descricao}
                    onChange={(e) => updateServico(index, 'descricao', e.target.value)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addServico}
                className="w-full"
              >
                + Adicionar Serviço
              </Button>
            </div>

            <Button
              onClick={handleProfissionalSubmit}
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? 'Cadastrando...' : 'Completar Cadastro'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Formulário do Cliente
  if (perfilSelecionado === 'cliente') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <Button 
            variant="ghost" 
            onClick={() => setPerfilSelecionado(null)}
            className="mb-4"
          >
            ← Voltar
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cadastro Cliente</h2>
              <p className="text-sm text-muted-foreground">Configure seu perfil</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome-cliente">Seu Nome *</Label>
              <Input
                id="nome-cliente"
                placeholder="Digite seu nome"
                value={clienteData.nome}
                onChange={(e) => setClienteData({ ...clienteData, nome: e.target.value })}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone-cliente">Seu Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="telefone-cliente"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={clienteData.telefone}
                  onChange={(e) => setClienteData({ ...clienteData, telefone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Código de Acesso */}
            <div className="space-y-2">
              <Label htmlFor="codigo-acesso">Código de Acesso do Estabelecimento *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="codigo-acesso"
                  placeholder="Digite o código do estabelecimento"
                  value={clienteData.codigoAcesso}
                  onChange={(e) => setClienteData({ ...clienteData, codigoAcesso: e.target.value.toUpperCase() })}
                  className="pl-10 uppercase"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Peça o código de acesso ao estabelecimento onde deseja agendar
              </p>
            </div>

            {/* Personalização - Cor Preferida */}
            <div className="space-y-2">
              <Label>Personalizar Cor do App</Label>
              <div className="flex gap-3">
                {CORES_APP.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setClienteData({ ...clienteData, corPreferida: cor.valor })}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      clienteData.corPreferida === cor.valor ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleClienteSubmit}
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? 'Vinculando...' : 'Completar Cadastro'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
