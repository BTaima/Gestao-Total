import { useState } from 'react';
import { Crown, Briefcase, User, Building2, Phone, ArrowLeft, Eye, EyeOff, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { TipoUsuario } from '@/types';
import { toast } from 'sonner';
import { generateId } from '@/utils/storage';

type PerfilSelecionado = 'admin' | 'profissional' | 'cliente' | null;

const CATEGORIAS = [
  'Cabeleireiro(a)',
  'Manicure/Pedicure',
  'Massagista',
  'Esteticista',
  'Barbeiro(a)',
  'Maquiador(a)',
  'Depilador(a)',
  'Designer de Sobrancelhas',
  'Fisioterapeuta',
  'Nutricionista',
  'Personal Trainer',
  'Outro'
];

interface ServicoForm {
  nome: string;
  preco: string;
  descricao: string;
  duracao: string;
  imagem?: string;
}

export default function SelecaoPerfil() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilSelecionado>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    nomeEstabelecimento: '',
    categoria: '',
    cnpj: '',
    codigoConvite: '',
    numeroProfissionais: '1',
    corPrimaria: '#6366f1',
    mensagemBoasVindas: 'Bem-vindo ao nosso estabelecimento!'
  });
  const [servicos, setServicos] = useState<ServicoForm[]>([]);
  const [categoriasServicos, setCategoriasServicos] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const { cadastrar, atualizarUsuario, criarEstabelecimento, vincularClientePorCodigo, definirTipoUsuario } = useApp();
  const navigate = useNavigate();

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const adicionarServico = () => {
    setServicos([...servicos, { nome: '', preco: '', descricao: '', duracao: '30' }]);
  };

  const removerServico = (index: number) => {
    setServicos(servicos.filter((_, i) => i !== index));
  };

  const atualizarServico = (index: number, campo: keyof ServicoForm, valor: string) => {
    const novosServicos = [...servicos];
    novosServicos[index] = { ...novosServicos[index], [campo]: valor };
    setServicos(novosServicos);
  };

  const adicionarCategoria = () => {
    if (novaCategoria.trim() && !categoriasServicos.includes(novaCategoria.trim())) {
      setCategoriasServicos([...categoriasServicos, novaCategoria.trim()]);
      setNovaCategoria('');
    }
  };

  const removerCategoria = (categoria: string) => {
    setCategoriasServicos(categoriasServicos.filter(c => c !== categoria));
  };

  const handleCadastroAdmin = async () => {
    if (!formData.nome || !formData.nomeEstabelecimento || !formData.categoria || !formData.telefone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Primeiro define o tipo de usuário como administrador
      const tipoDefinido = await definirTipoUsuario(TipoUsuario.ADMINISTRADOR);
      if (!tipoDefinido) {
        toast.error('Erro ao definir tipo de usuário');
        return;
      }

      const result = await criarEstabelecimento(
        formData.nomeEstabelecimento,
        formData.telefone,
        formData.categoria
      );

      if (result) {
        toast.success('Estabelecimento criado com sucesso!');
        navigate('/home');
      } else {
        toast.error('Erro ao criar estabelecimento');
      }
    } catch (error) {
      toast.error('Erro ao criar estabelecimento');
    }
  };

  const handleCadastroProfissional = async () => {
    if (!formData.nome || !formData.codigoConvite || servicos.length === 0) {
      toast.error('Preencha todos os campos obrigatórios e adicione pelo menos um serviço');
      return;
    }

    try {
      // Primeiro define o tipo de usuário como profissional
      const tipoDefinido = await definirTipoUsuario(TipoUsuario.PROFISSIONAL);
      if (!tipoDefinido) {
        toast.error('Erro ao definir tipo de usuário');
        return;
      }

      const sucesso = await vincularClientePorCodigo(formData.codigoConvite);
      if (sucesso) {
        toast.success('Cadastro profissional realizado com sucesso!');
        navigate('/agenda');
      } else {
        toast.error('Código de acesso inválido');
      }
    } catch (error) {
      toast.error('Erro ao vincular ao estabelecimento');
    }
  };

  const handleCadastroCliente = async () => {
    if (!formData.nome || !formData.codigoConvite) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Primeiro define o tipo de usuário como cliente
      const tipoDefinido = await definirTipoUsuario(TipoUsuario.CLIENTE);
      if (!tipoDefinido) {
        toast.error('Erro ao definir tipo de usuário');
        return;
      }

      const sucesso = await vincularClientePorCodigo(formData.codigoConvite);
      if (sucesso) {
        toast.success('Cadastro de cliente realizado com sucesso!');
        navigate('/cliente/home');
      } else {
        toast.error('Código de acesso inválido');
      }
    } catch (error) {
      toast.error('Erro ao vincular ao estabelecimento');
    }
  };

  if (!perfilSelecionado) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="gradient-hero pt-safe px-6 pb-16">
          <div className="text-center animate-fade-in mt-12">
            <h1 className="text-3xl font-bold text-white mb-2">Escolha seu perfil</h1>
            <p className="text-white/90">Selecione como você deseja usar o sistema</p>
          </div>
        </div>

        {/* Cards de seleção */}
        <div className="flex-1 px-6 -mt-8 pb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg animate-slide-up"
              onClick={() => setPerfilSelecionado('admin')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Dono/Administrador</h3>
                  <p className="text-sm text-muted-foreground">Gerencie seu estabelecimento, profissionais e clientes</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg animate-slide-up"
              onClick={() => setPerfilSelecionado('profissional')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Profissional</h3>
                  <p className="text-sm text-muted-foreground">Gerencie sua agenda e seus atendimentos</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg animate-slide-up"
              onClick={() => setPerfilSelecionado('cliente')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sou Cliente</h3>
                  <p className="text-sm text-muted-foreground">Agende serviços e acompanhe seus atendimentos</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero pt-safe px-6 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => setPerfilSelecionado(null)}
          className="text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            {perfilSelecionado === 'admin' && 'Criar Estabelecimento'}
            {perfilSelecionado === 'profissional' && 'Cadastro Profissional'}
            {perfilSelecionado === 'cliente' && 'Cadastro Cliente'}
          </h1>
          <p className="text-white/90">
            {perfilSelecionado === 'admin' && 'Configure seu estabelecimento'}
            {perfilSelecionado === 'profissional' && 'Complete seu perfil profissional'}
            {perfilSelecionado === 'cliente' && 'Conecte-se ao estabelecimento'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 -mt-8 pb-8">
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 animate-slide-up max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Seu nome completo"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (com DDD)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: formatTelefone(e.target.value)})}
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* Formulário específico para Administrador */}
            {perfilSelecionado === 'admin' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="estabelecimento">Nome do Estabelecimento</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="estabelecimento"
                      value={formData.nomeEstabelecimento}
                      onChange={(e) => setFormData({...formData, nomeEstabelecimento: e.target.value})}
                      placeholder="Nome do seu negócio"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria do Estabelecimento</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroProfissionais">Quantos profissionais vão trabalhar com você?</Label>
                  <Select value={formData.numeroProfissionais} onValueChange={(value) => setFormData({...formData, numeroProfissionais: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o número" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} profissional{num > 1 ? 'is' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corPrimaria">Cor Primária do App</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="color"
                      value={formData.corPrimaria}
                      onChange={(e) => setFormData({...formData, corPrimaria: e.target.value})}
                      className="w-16 h-10 p-1"
                    />
                    <Input 
                      value={formData.corPrimaria}
                      onChange={(e) => setFormData({...formData, corPrimaria: e.target.value})}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagemBoasVindas">Mensagem de Boas-vindas</Label>
                  <Textarea 
                    id="mensagemBoasVindas"
                    value={formData.mensagemBoasVindas}
                    onChange={(e) => setFormData({...formData, mensagemBoasVindas: e.target.value})}
                    placeholder="Digite uma mensagem de boas-vindas para seus clientes"
                    rows={3}
                  />
                </div>

                <Button onClick={handleCadastroAdmin} className="w-full btn-gradient h-12 text-base">
                  Criar Estabelecimento
                </Button>
              </>
            )}

            {/* Formulário específico para Profissional */}
            {perfilSelecionado === 'profissional' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="codigoConvite">Código de Acesso do Administrador</Label>
                  <Input 
                    id="codigoConvite"
                    value={formData.codigoConvite}
                    onChange={(e) => setFormData({...formData, codigoConvite: e.target.value.toUpperCase()})}
                    placeholder="Digite o código fornecido pelo administrador"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Categorias de Serviços</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Nova categoria"
                        className="w-40"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarCategoria())}
                      />
                      <Button type="button" onClick={adicionarCategoria} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoriasServicos.map((cat, index) => (
                      <div key={index} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {cat}
                        <button
                          type="button"
                          onClick={() => removerCategoria(cat)}
                          className="ml-2 hover:text-primary/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Serviços</Label>
                    <Button type="button" onClick={adicionarServico} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Serviço
                    </Button>
                  </div>
                  
                  {servicos.map((servico, index) => (
                    <Card key={index} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Serviço {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removerServico(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Nome do serviço"
                          value={servico.nome}
                          onChange={(e) => atualizarServico(index, 'nome', e.target.value)}
                        />
                        <Input 
                          placeholder="Preço (R$)"
                          value={servico.preco}
                          onChange={(e) => atualizarServico(index, 'preco', e.target.value)}
                        />
                        <Input 
                          placeholder="Duração (min)"
                          value={servico.duracao}
                          onChange={(e) => atualizarServico(index, 'duracao', e.target.value)}
                        />
                        <Input 
                          placeholder="URL da imagem (opcional)"
                          value={servico.imagem || ''}
                          onChange={(e) => atualizarServico(index, 'imagem', e.target.value)}
                        />
                      </div>
                      <Textarea 
                        placeholder="Descrição do serviço"
                        value={servico.descricao}
                        onChange={(e) => atualizarServico(index, 'descricao', e.target.value)}
                        rows={2}
                      />
                    </Card>
                  ))}
                </div>

                <Button onClick={handleCadastroProfissional} className="w-full btn-gradient h-12 text-base">
                  Cadastrar como Profissional
                </Button>
              </>
            )}

            {/* Formulário específico para Cliente */}
            {perfilSelecionado === 'cliente' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="codigoConvite">Código de Acesso</Label>
                  <Input 
                    id="codigoConvite"
                    value={formData.codigoConvite}
                    onChange={(e) => setFormData({...formData, codigoConvite: e.target.value.toUpperCase()})}
                    placeholder="Digite o código fornecido pelo estabelecimento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corPrimaria">Cor Preferida do App</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="color"
                      value={formData.corPrimaria}
                      onChange={(e) => setFormData({...formData, corPrimaria: e.target.value})}
                      className="w-16 h-10 p-1"
                    />
                    <Input 
                      value={formData.corPrimaria}
                      onChange={(e) => setFormData({...formData, corPrimaria: e.target.value})}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button onClick={handleCadastroCliente} className="w-full btn-gradient h-12 text-base">
                  Cadastrar como Cliente
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
