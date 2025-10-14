import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Cliente, Agendamento, Servico, Transacao, Lembrete, ConfiguracoesUsuario, Bloqueio, ListaEspera, Estabelecimento, Profissional, Avaliacao, Notificacao } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AppContextType {
  usuario: Usuario | null;
  estabelecimentos: Estabelecimento[];
  clientes: Cliente[];
  agendamentos: Agendamento[];
  servicos: Servico[];
  transacoes: Transacao[];
  lembretes: Lembrete[];
  bloqueios: Bloqueio[];
  listaEspera: ListaEspera[];
  profissionais: Profissional[];
  avaliacoes: Avaliacao[];
  notificacoes: Notificacao[];
  
  // Auth
  login: (email: string, senha: string) => Promise<boolean>;
  cadastrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    nomeEstabelecimento: string;
    categoria: string;
    tipo: 'administrador' | 'profissional' | 'cliente';
  }) => Promise<boolean>;
  logout: () => void;
  atualizarUsuario: (usuario: Partial<Usuario>) => void;
  
  // Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  
  // Agendamentos
  adicionarAgendamento: (agendamento: Omit<Agendamento, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => void;
  atualizarAgendamento: (id: string, agendamento: Partial<Agendamento>) => void;
  removerAgendamento: (id: string) => void;
  
  // Servicos
  adicionarServico: (servico: Omit<Servico, 'id'>) => void;
  atualizarServico: (id: string, servico: Partial<Servico>) => void;
  removerServico: (id: string) => void;
  
  // Transacoes
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => void;
  atualizarTransacao: (id: string, transacao: Partial<Transacao>) => void;
  removerTransacao: (id: string) => void;
  
  // Lembretes
  adicionarLembrete: (lembrete: Omit<Lembrete, 'id'>) => void;
  atualizarLembrete: (id: string, lembrete: Partial<Lembrete>) => void;
  removerLembrete: (id: string) => void;
  
  // Bloqueios
  adicionarBloqueio: (bloqueio: Omit<Bloqueio, 'id' | 'dataCriacao'>) => void;
  atualizarBloqueio: (id: string, bloqueio: Partial<Bloqueio>) => void;
  removerBloqueio: (id: string) => void;
  
  // Lista de Espera
  adicionarListaEspera: (item: Omit<ListaEspera, 'id' | 'dataCriacao'>) => void;
  removerListaEspera: (id: string) => void;
  
  // Profissionais
  adicionarProfissional: (profissional: Omit<Profissional, 'id' | 'dataCadastro'>) => void;
  atualizarProfissional: (id: string, profissional: Partial<Profissional>) => void;
  removerProfissional: (id: string) => void;
  
  // Avaliacoes
  adicionarAvaliacao: (avaliacao: Avaliacao) => void;
  atualizarAvaliacao: (id: string, avaliacao: Partial<Avaliacao>) => void;
  
  // Notificacoes
  adicionarNotificacao: (notificacao: Notificacao) => void;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasLidas: () => void;
  limparNotificacoesAntigas: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultConfiguracoes: ConfiguracoesUsuario = {
  tema: 'claro',
  corPrimaria: '#6366f1',
  notificacoes: {
    umDiaAntes: true,
    umaHoraAntes: true,
    lembreteInativos: true,
    resumoDiario: true,
    resumoSemanal: true,
  },
  horarioTrabalho: {
    1: { ativo: true, inicio: '09:00', fim: '18:00' },
    2: { ativo: true, inicio: '09:00', fim: '18:00' },
    3: { ativo: true, inicio: '09:00', fim: '18:00' },
    4: { ativo: true, inicio: '09:00', fim: '18:00' },
    5: { ativo: true, inicio: '09:00', fim: '18:00' },
    6: { ativo: true, inicio: '09:00', fim: '18:00' },
    0: { ativo: false, inicio: '09:00', fim: '18:00' },
  },
  formasPagamento: {
    dinheiro: true,
    pix: true,
    cartaoCredito: true,
    cartaoDebito: true,
    transferencia: false,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [listaEspera, setListaEspera] = useState<ListaEspera[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  // Setup Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 0);
      } else {
        setUsuario(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profile && userRole) {
        const usuarioData: Usuario = {
          id: profile.id,
          nome: profile.nome_completo,
          email: user?.email || '',
          telefone: profile.telefone,
          tipo: userRole.role as any,
          estabelecimentoId: profile.id,
          estabelecimentoNome: profile.nome_estabelecimento || '',
          ativo: profile.ativo,
          dataCadastro: new Date(profile.data_cadastro),
          profissao: profile.categoria || '',
          nomeNegocio: profile.nome_estabelecimento || '',
          configuracoes: defaultConfiguracoes,
          onboardingCompleto: true,
          setupCompleto: true,
        };
        setUsuario(usuarioData);
      }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
  };

  // Load data on mount
  useEffect(() => {
    const loadedEstabelecimentos = storage.load<Estabelecimento[]>('estabelecimentos') || [];
    const loadedClientes = storage.load<Cliente[]>('clientes') || [];
    const loadedAgendamentos = storage.load<Agendamento[]>('agendamentos') || [];
    const loadedServicos = storage.load<Servico[]>('servicos') || [];
    const loadedTransacoes = storage.load<Transacao[]>('transacoes') || [];
    const loadedLembretes = storage.load<Lembrete[]>('lembretes') || [];
    const loadedBloqueios = storage.load<Bloqueio[]>('bloqueios') || [];
    const loadedListaEspera = storage.load<ListaEspera[]>('listaEspera') || [];

    setEstabelecimentos(loadedEstabelecimentos);
    setClientes(loadedClientes);
    setAgendamentos(loadedAgendamentos);
    setServicos(loadedServicos);
    setTransacoes(loadedTransacoes);
    setLembretes(loadedLembretes);
    setBloqueios(loadedBloqueios);
    setListaEspera(loadedListaEspera);
  }, []);

  // Auto-save
  useEffect(() => {
    if (usuario) storage.save('usuario', usuario);
  }, [usuario]);

  useEffect(() => {
    storage.save('estabelecimentos', estabelecimentos);
  }, [estabelecimentos]);

  useEffect(() => {
    storage.save('clientes', clientes);
  }, [clientes]);

  useEffect(() => {
    storage.save('agendamentos', agendamentos);
  }, [agendamentos]);

  useEffect(() => {
    storage.save('servicos', servicos);
  }, [servicos]);

  useEffect(() => {
    storage.save('transacoes', transacoes);
  }, [transacoes]);

  useEffect(() => {
    storage.save('lembretes', lembretes);
  }, [lembretes]);

  useEffect(() => {
    storage.save('bloqueios', bloqueios);
  }, [bloqueios]);

  useEffect(() => {
    storage.save('listaEspera', listaEspera);
  }, [listaEspera]);

  // Auth functions
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;
      return !!data.user;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro no login:', error);
      }
      return false;
    }
  };

  const cadastrar = async (dados: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    nomeEstabelecimento: string;
    categoria: string;
    tipo: 'administrador' | 'profissional' | 'cliente';
  }): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome_completo: dados.nome,
            telefone: dados.telefone,
            nome_estabelecimento: dados.nomeEstabelecimento,
            categoria: dados.categoria,
            tipo: dados.tipo,
          },
        },
      });

      if (error) throw error;
      return !!data.user;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro no cadastro:', error);
      }
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setUser(null);
    setSession(null);
    setClientes([]);
    setAgendamentos([]);
    setServicos([]);
    setTransacoes([]);
    setLembretes([]);
  };

  const atualizarUsuario = async (dados: Partial<Usuario>) => {
    if (!usuario || !user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: dados.nome || usuario.nome,
          telefone: dados.telefone || usuario.telefone,
          nome_estabelecimento: dados.estabelecimentoNome || usuario.estabelecimentoNome,
          categoria: dados.profissao || usuario.profissao,
        })
        .eq('id', user.id);

      if (error) throw error;

      const usuarioAtualizado = { ...usuario, ...dados };
      setUsuario(usuarioAtualizado);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar usuário:', error);
      }
    }
  };

  // Cliente functions
  const adicionarCliente = (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente: Cliente = {
      ...clienteData,
      id: generateId(),
      dataCadastro: new Date(),
    };
    setClientes(prev => [...prev, novoCliente]);
  };

  const atualizarCliente = (id: string, dados: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const removerCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // Agendamento functions
  const adicionarAgendamento = (agendamentoData: Omit<Agendamento, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
    const novoAgendamento: Agendamento = {
      ...agendamentoData,
      id: generateId(),
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };
    setAgendamentos(prev => [...prev, novoAgendamento]);
  };

  const atualizarAgendamento = (id: string, dados: Partial<Agendamento>) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, ...dados, dataAtualizacao: new Date() } : a
    ));
  };

  const removerAgendamento = (id: string) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  // Servico functions
  const adicionarServico = (servicoData: Omit<Servico, 'id'>) => {
    const novoServico: Servico = {
      ...servicoData,
      id: generateId(),
    };
    setServicos(prev => [...prev, novoServico]);
  };

  const atualizarServico = (id: string, dados: Partial<Servico>) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...dados } : s));
  };

  const removerServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
  };

  // Transacao functions
  const adicionarTransacao = (transacaoData: Omit<Transacao, 'id'>) => {
    const novaTransacao: Transacao = {
      ...transacaoData,
      id: generateId(),
    };
    setTransacoes(prev => [...prev, novaTransacao]);
  };

  const atualizarTransacao = (id: string, dados: Partial<Transacao>) => {
    setTransacoes(prev => prev.map(t => t.id === id ? { ...t, ...dados } : t));
  };

  const removerTransacao = (id: string) => {
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  // Lembrete functions
  const adicionarLembrete = (lembreteData: Omit<Lembrete, 'id'>) => {
    const novoLembrete: Lembrete = {
      ...lembreteData,
      id: generateId(),
    };
    setLembretes(prev => [...prev, novoLembrete]);
  };

  const atualizarLembrete = (id: string, dados: Partial<Lembrete>) => {
    setLembretes(prev => prev.map(l => l.id === id ? { ...l, ...dados } : l));
  };

  const removerLembrete = (id: string) => {
    setLembretes(prev => prev.filter(l => l.id !== id));
  };

  // Bloqueio functions
  const adicionarBloqueio = (bloqueioData: Omit<Bloqueio, 'id' | 'dataCriacao'>) => {
    const novoBloqueio: Bloqueio = {
      ...bloqueioData,
      id: generateId(),
      dataCriacao: new Date(),
    };
    setBloqueios(prev => [...prev, novoBloqueio]);
  };

  const atualizarBloqueio = (id: string, dados: Partial<Bloqueio>) => {
    setBloqueios(prev => prev.map(b => b.id === id ? { ...b, ...dados } : b));
  };

  const removerBloqueio = (id: string) => {
    setBloqueios(prev => prev.filter(b => b.id !== id));
  };

  // Lista de Espera functions
  const adicionarListaEspera = (itemData: Omit<ListaEspera, 'id' | 'dataCriacao'>) => {
    const novoItem: ListaEspera = {
      ...itemData,
      id: generateId(),
      dataCriacao: new Date(),
    };
    setListaEspera(prev => [...prev, novoItem]);
  };

  const removerListaEspera = (id: string) => {
    setListaEspera(prev => prev.filter(item => item.id !== id));
  };

  // Profissional functions
  const adicionarProfissional = (profissionalData: Omit<Profissional, 'id' | 'dataCadastro'>) => {
    const novoProfissional: Profissional = {
      ...profissionalData,
      id: generateId(),
      dataCadastro: new Date(),
    };
    setProfissionais(prev => [...prev, novoProfissional]);
  };

  const atualizarProfissional = (id: string, dados: Partial<Profissional>) => {
    setProfissionais(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
  };

  const removerProfissional = (id: string) => {
    setProfissionais(prev => prev.filter(p => p.id !== id));
  };

  // Avaliacao functions
  const adicionarAvaliacao = (avaliacao: Avaliacao) => {
    setAvaliacoes(prev => [...prev, avaliacao]);
  };

  const atualizarAvaliacao = (id: string, dados: Partial<Avaliacao>) => {
    setAvaliacoes(prev => prev.map(a => a.id === id ? { ...a, ...dados } : a));
  };

  // Notificacao functions
  const adicionarNotificacao = (notificacao: Notificacao) => {
    setNotificacoes(prev => [notificacao, ...prev]);
  };

  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const marcarTodasLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const limparNotificacoesAntigas = () => {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    setNotificacoes(prev => prev.filter(n => n.data > seteDiasAtras || !n.lida));
  };

  const value = {
    usuario,
    estabelecimentos,
    clientes,
    agendamentos,
    servicos,
    transacoes,
    lembretes,
    bloqueios,
    listaEspera,
    profissionais,
    avaliacoes,
    notificacoes,
    login,
    cadastrar,
    logout,
    atualizarUsuario,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    adicionarAgendamento,
    atualizarAgendamento,
    removerAgendamento,
    adicionarServico,
    atualizarServico,
    removerServico,
    adicionarTransacao,
    atualizarTransacao,
    removerTransacao,
    adicionarLembrete,
    atualizarLembrete,
    removerLembrete,
    adicionarBloqueio,
    atualizarBloqueio,
    removerBloqueio,
    adicionarListaEspera,
    removerListaEspera,
    adicionarProfissional,
    atualizarProfissional,
    removerProfissional,
    adicionarAvaliacao,
    atualizarAvaliacao,
    adicionarNotificacao,
    marcarNotificacaoLida,
    marcarTodasLidas,
    limparNotificacoesAntigas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
