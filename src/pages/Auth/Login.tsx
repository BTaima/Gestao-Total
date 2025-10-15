import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Chrome, Facebook, Instagram, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginComGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, senha);
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        toast.error('Email ou senha incorretos');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider !== 'Google') {
      toast.info(`Login com ${provider} em breve!`);
      return;
    }
    const ok = await loginComGoogle();
    if (!ok) toast.error('Não foi possível iniciar o login com Google');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with gradient */}
      <div className="gradient-hero pt-safe px-6 pb-16 text-center">
        <div className="mt-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Gestão Total</h1>
          <p className="text-white/90 text-lg">Organize seu negócio com facilidade</p>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="flex-1 px-6 -mt-8">
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 text-center">Entrar</h2>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
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
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient h-12 text-base"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="h-12"
              >
                <Chrome className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Facebook')}
                className="h-12"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Instagram')}
                className="h-12"
              >
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/cadastro" className="text-primary font-semibold hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
