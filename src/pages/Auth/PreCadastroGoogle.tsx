import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Phone, Building2, Briefcase } from 'lucide-react';

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

export default function PreCadastroGoogle() {
  const navigate = useNavigate();
  const { completarCadastroGoogle } = useApp();
  const [telefone, setTelefone] = useState('');
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const success = await completarCadastroGoogle({
        telefone,
        nomeEstabelecimento,
        categoria,
      });

      if (success) {
        toast.success('Cadastro completado com sucesso!');
        navigate('/');
      } else {
        toast.error('Erro ao completar cadastro');
      }
    } catch (error) {
      toast.error('Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-hero pt-safe px-6 pb-16">
        <div className="text-center animate-fade-in mt-12">
          <h1 className="text-3xl font-bold text-white mb-2">Complete seu Cadastro</h1>
          <p className="text-white/90">Falta pouco para começar</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 -mt-8 pb-8">
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            
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

            <Button
              type="submit"
              className="w-full btn-gradient h-12 text-base"
              disabled={loading}
            >
              {loading ? 'Completando...' : 'Completar Cadastro'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
