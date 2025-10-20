import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { TipoUsuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Lock, Phone, Building2, Briefcase, ArrowLeft, Eye, EyeOff, Chrome } from 'lucide-react';

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

export default function Cadastro() {
  const navigate = useNavigate();
  const { cadastrar, loginComGoogle } = useApp();
  const [nome, setNome] = useState('');
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(senha)) {
      toast.error('A senha deve ter 8+ caracteres, 1 maiúscula, 1 número e 1 caractere especial');
      return;
    }

    if (senha !== confirmSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (telefone.replace(/\D/g, '').length < 10) {
      toast.error('Digite um telefone válido com DDD');
      return;
    }

    if (!categoria) {
      toast.error('Selecione uma categoria de trabalho');
      return;
    }

    setLoading(true);

    try {
      const success = await cadastrar({
        nome,
        email,
        senha,
        telefone,
        nomeEstabelecimento,
        categoria,
      });

      if (success) {
        toast.success('Cadastro realizado! Verifique seu email para confirmar sua conta.');
        navigate('/selecao-perfil');
      } else {
        toast.error('Este email já está cadastrado');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider !== 'Google') {
      toast.info(`Cadastro com ${provider} em breve!`);
      return;
    }
    const ok = await loginComGoogle();
    if (!ok) toast.error('Não foi possível iniciar o cadastro com Google');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-hero pt-safe px-6 pb-16">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/login')}
          className="text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/90">Comece a organizar seu negócio</p>
        </div>
      </div>

      {/* Cadastro Form */}
      <div className="flex-1 px-6 -mt-8 pb-8">
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 animate-slide-up">
          <form onSubmit={handleCadastro} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Nome do Estabelecimento */}
            <div className="space-y-2">
              <Label htmlFor="estabelecimento">Nome do estabelecimento</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="estabelecimento"
                  type="text"
                  placeholder="Nome do seu negócio"
                  value={nomeEstabelecimento}
                  onChange={(e) => setNomeEstabelecimento(e.target.value)}
                  className="pl-10"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  className="pl-10"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* Categoria de Trabalho */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria de trabalho</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione sua categoria" />
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
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmSenha"
                  type={mostrarConfirmSenha ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmSenha(!mostrarConfirmSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarConfirmSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient h-12 text-base"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Ou cadastre-se com</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="h-12 w-full max-w-xs"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Continuar com Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
