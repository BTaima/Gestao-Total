import { useState } from 'react';
import { Crown, Briefcase, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { TipoUsuario } from '@/types';
import { toast } from 'sonner';
import { generateId } from '@/utils/storage';

type PerfilSelecionado = 'admin' | 'profissional' | 'cliente' | null;

export default function SelecaoPerfil() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilSelecionado>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    nomeEstabelecimento: '',
    cnpj: '',
    codigoConvite: ''
  });
  const { cadastrar, atualizarUsuario } = useApp();
  const navigate = useNavigate();

  const handleCadastro = async () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.telefone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const sucesso = await cadastrar({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      telefone: formData.telefone,
      nomeEstabelecimento: formData.nomeEstabelecimento,
      categoria: 'Outro',
      tipo: perfilSelecionado === 'admin' ? 'administrador' : perfilSelecionado === 'profissional' ? 'profissional' : 'cliente'
    });
    
    if (sucesso) {
      if (perfilSelecionado === 'admin') {
        const estabelecimentoId = generateId();
        atualizarUsuario({
          tipo: TipoUsuario.ADMINISTRADOR,
          telefone: formData.telefone,
          estabelecimentoNome: formData.nomeEstabelecimento,
          estabelecimentoId,
          setupCompleto: true
        });
        toast.success('Estabelecimento criado com sucesso!');
        navigate('/home');
      } else if (perfilSelecionado === 'profissional') {
        atualizarUsuario({
          tipo: TipoUsuario.PROFISSIONAL,
          telefone: formData.telefone,
          setupCompleto: false
        });
        toast.success('Solicitação de cadastro enviada!');
        navigate('/home');
      } else if (perfilSelecionado === 'cliente') {
        atualizarUsuario({
          tipo: TipoUsuario.CLIENTE,
          telefone: formData.telefone,
          setupCompleto: true
        });
        toast.success('Conta criada com sucesso!');
        navigate('/home');
      }
    } else {
      toast.error('Email já cadastrado');
    }
  };

  if (!perfilSelecionado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-2">Escolha seu perfil</h1>
          <p className="text-muted-foreground text-center mb-8">Selecione como você deseja usar o sistema</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
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
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
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
              className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-lg"
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <Button 
          variant="ghost" 
          onClick={() => setPerfilSelecionado(null)}
          className="mb-4"
        >
          ← Voltar
        </Button>

        <h2 className="text-2xl font-bold mb-6">
          {perfilSelecionado === 'admin' && 'Criar Estabelecimento'}
          {perfilSelecionado === 'profissional' && 'Cadastro Profissional'}
          {perfilSelecionado === 'cliente' && 'Cadastro Cliente'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Nome Completo</Label>
            <Input 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label>Senha</Label>
            <Input 
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              placeholder="Sua senha"
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input 
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              placeholder="(00) 00000-0000"
            />
          </div>

          {perfilSelecionado === 'admin' && (
            <>
              <div>
                <Label>Nome do Estabelecimento</Label>
                <Input 
                  value={formData.nomeEstabelecimento}
                  onChange={(e) => setFormData({...formData, nomeEstabelecimento: e.target.value})}
                  placeholder="Nome do seu negócio"
                />
              </div>
              <div>
                <Label>CNPJ (opcional)</Label>
                <Input 
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </>
          )}

          {perfilSelecionado === 'profissional' && (
            <>
              <div>
                <Label>Nome do Estabelecimento</Label>
                <Input 
                  value={formData.nomeEstabelecimento}
                  onChange={(e) => setFormData({...formData, nomeEstabelecimento: e.target.value})}
                  placeholder="Buscar estabelecimento"
                />
              </div>
              <div>
                <Label>Código de Convite</Label>
                <Input 
                  value={formData.codigoConvite}
                  onChange={(e) => setFormData({...formData, codigoConvite: e.target.value})}
                  placeholder="Código fornecido pelo administrador"
                />
              </div>
            </>
          )}

          {perfilSelecionado === 'cliente' && (
            <div>
              <Label>Nome do Estabelecimento</Label>
              <Input 
                value={formData.nomeEstabelecimento}
                onChange={(e) => setFormData({...formData, nomeEstabelecimento: e.target.value})}
                placeholder="Buscar estabelecimento"
              />
            </div>
          )}

          <Button onClick={handleCadastro} className="w-full">
            {perfilSelecionado === 'admin' && 'Criar Estabelecimento'}
            {perfilSelecionado === 'profissional' && 'Solicitar Cadastro'}
            {perfilSelecionado === 'cliente' && 'Criar Conta'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
