import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Cliente, Agendamento, Servico, Transacao, Lembrete, ConfiguracoesUsuario, Bloqueio, ListaEspera, Estabelecimento, Profissional, Avaliacao, Notificacao } from '@/types';
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
  login: (email: string, senha: string) => Promise<boolean | 'email_not_confirmed'>;
  loginComGoogle: () => Promise<boolean>;
  cadastrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    nomeEstabelecimento: string;
    categoria: string;
  }) => Promise<boolean>;
  completarCadastroGoogle: (dados: {
    telefone: string;
    nomeEstabelecimento: string;
    categoria: string;
  }) => Promise<boolean>;
  logout: () => void;
  atualizarUsuario: (usuario: Partial<Usuario>) => void;
  criarEstabelecimento: (nomeEstabelecimento: string, telefone: string, categoria: string) => Promise<{ estabelecimentoId: string; codigoAcesso: string } | null>;
  vincularClientePorCodigo: (codigo: string) => Promise<boolean>;
  regenerarCodigoAcesso: () => Promise<string | null>;
  
  // Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => Promise<void>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  
  // Agendamentos
  adicionarAgendamento: (agendamento: Omit<Agendamento, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => Promise<void>;
  atualizarAgendamento: (id: string, agendamento: Partial<Agendamento>) => Promise<void>;
  removerAgendamento: (id: string) => Promise<void>;
  
  // Servicos
  adicionarServico: (servico: Omit<Servico, 'id'>) => Promise<void>;
  atualizarServico: (id: string, servico: Partial<Servico>) => Promise<void>;
  removerServico: (id: string) => Promise<void>;
  
  // Transacoes
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => Promise<void>;
  atualizarTransacao: (id: string, transacao: Partial<Transacao>) => Promise<void>;
  removerTransacao: (id: string) => Promise<void>;
  
  // Lembretes
  adicionarLembrete: (lembrete: Omit<Lembrete, 'id'>) => Promise<void>;
  atualizarLembrete: (id: string, lembrete: Partial<Lembrete>) => Promise<void>;
  removerLembrete: (id: string) => Promise<void>;
  
  // Bloqueios
  adicionarBloqueio: (bloqueio: Omit<Bloqueio, 'id' | 'dataCriacao'>) => Promise<void>;
  atualizarBloqueio: (id: string, bloqueio: Partial<Bloqueio>) => Promise<void>;
  removerBloqueio: (id: string) => Promise<void>;
  
  // Lista de Espera
  adicionarListaEspera: (item: Omit<ListaEspera, 'id' | 'dataCriacao'>) => Promise<void>;
  removerListaEspera: (id: string) => Promise<void>;
  
  // Profissionais
  adicionarProfissional: (profissional: Omit<Profissional, 'id' | 'dataCadastro'>) => Promise<void>;
  atualizarProfissional: (id: string, profissional: Partial<Profissional>) => Promise<void>;
  removerProfissional: (id: string) => Promise<void>;
  
  // Avaliacoes
  adicionarAvaliacao: (avaliacao: Avaliacao) => Promise<void>;
  atualizarAvaliacao: (id: string, avaliacao: Partial<Avaliacao>) => Promise<void>;
  
  // Notificacoes
  adicionarNotificacao: (notificacao: Notificacao) => Promise<void>;
  marcarNotificacaoLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
  limparNotificacoesAntigas: () => Promise<void>;
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
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null);
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
        setEstabelecimentoId(null);
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
        .maybeSingle();

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      // Se não tem perfil completo (login via Google sem completar cadastro)
      if (!profile || !profile.telefone || !profile.categoria || !userRole) {
        // Redirecionar para pré-cadastro
        if (window.location.pathname !== '/pre-cadastro-google') {
          window.location.href = '/pre-cadastro-google';
        }
        return;
      }

      if (profile && userRole) {
        // Load or create estabelecimento
        const { data: estab } = await supabase
          .from('estabelecimentos')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        let estabelecimentoIdValue = estab?.id;

        if (!estab && userRole.role === 'administrador') {
          // Create estabelecimento for admin
          const { data: newEstab } = await supabase
            .from('estabelecimentos')
            .insert({
              user_id: userId,
              nome: profile.nome_estabelecimento || 'Meu Estabelecimento',
              telefone: profile.telefone,
            })
            .select()
            .single();
          estabelecimentoIdValue = newEstab?.id;
        }

        // Use establishment from estabelecimentos table only

        const usuarioData: Usuario = {
          id: profile.id,
          nome: profile.nome_completo,
          email: user?.email || '',
          telefone: profile.telefone,
          tipo: userRole.role as any,
          estabelecimentoId: estabelecimentoIdValue || null as any,
          estabelecimentoNome: profile.nome_estabelecimento || '',
          ativo: profile.ativo,
          dataCadastro: new Date(profile.data_cadastro),
          profissao: profile.categoria || '',
          nomeNegocio: profile.nome_estabelecimento || '',
          configuracoes: defaultConfiguracoes,
          onboardingCompleto: true,
          setupCompleto: Boolean(profile.nome_estabelecimento),
        };
        setUsuario(usuarioData);
        setEstabelecimentoId(estabelecimentoIdValue);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
  };

  // Load all data from Supabase when estabelecimento is set
  useEffect(() => {
    if (estabelecimentoId && user?.id) {
      loadAllData(estabelecimentoId);
    }
  }, [estabelecimentoId, user?.id]);

  const loadAllData = async (estabId: string) => {
    try {
      const [clientesRes, servicosRes, profissionaisRes, agendamentosRes, transacoesRes, bloqueiosRes, listaEsperaRes, lembretesRes, avaliacoesRes, notifsRes] = await Promise.all([
        supabase.from('clientes').select('*').eq('estabelecimento_id', estabId),
        supabase.from('servicos').select('*').eq('estabelecimento_id', estabId),
        supabase.from('profissionais').select('*').eq('estabelecimento_id', estabId),
        supabase.from('agendamentos').select('*').eq('estabelecimento_id', estabId),
        supabase.from('transacoes').select('*').eq('estabelecimento_id', estabId),
        supabase.from('bloqueios').select('*').eq('estabelecimento_id', estabId),
        supabase.from('lista_espera').select('*').eq('estabelecimento_id', estabId),
        supabase.from('lembretes').select('*').eq('estabelecimento_id', estabId),
        supabase.from('avaliacoes').select('*').eq('estabelecimento_id', estabId),
        supabase.from('notificacoes').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(50),
      ]);

      if (clientesRes.data) {
        setClientes(clientesRes.data.map(c => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          email: c.email || '',
          dataNascimento: c.data_nascimento ? new Date(c.data_nascimento) : undefined,
          endereco: c.endereco || '',
          observacoes: c.observacoes || '',
          tags: [],
          status: c.ativo ? 'ativo' : 'inativo',
          dataCadastro: new Date(c.data_cadastro),
          ultimoAtendimento: c.ultima_visita ? new Date(c.ultima_visita) : undefined,
          totalGasto: Number(c.total_gasto),
          ticketMedio: c.numero_visitas > 0 ? Number(c.total_gasto) / c.numero_visitas : 0,
          estabelecimentoId: estabId,
        })));
      }

      if (servicosRes.data) {
        setServicos(servicosRes.data.map(s => ({
          id: s.id,
          nome: s.nome,
          descricao: s.descricao || '',
          duracao: s.duracao,
          valor: Number(s.valor),
          categoria: s.categoria || '',
          cor: '#6366f1',
          ativo: s.ativo,
          exigePagamentoAntecipado: false,
          destaque: false,
          profissionaisIds: s.profissionais_ids || [],
          estabelecimentoId: estabId,
        })));
      }

      if (profissionaisRes.data) {
        setProfissionais(profissionaisRes.data.map(p => ({
          id: p.id,
          nome: p.nome,
          telefone: p.telefone || '',
          email: p.email || '',
          ativo: p.ativo,
          dataCadastro: new Date(p.created_at),
          estabelecimentoId: estabId,
          servicosIds: [],
        })));
      }

      if (agendamentosRes.data) {
        setAgendamentos(agendamentosRes.data.map(a => ({
          id: a.id,
          clienteId: a.cliente_id,
          profissionalId: a.profissional_id,
          servicoId: a.servico_id,
          dataHora: new Date(a.data_hora),
          duracao: a.duracao,
          valor: Number(a.valor),
          status: a.status as any,
          observacoes: a.observacoes || '',
          pagamentoAntecipado: false,
          pagamentoStatus: 'pendente',
          dataCriacao: new Date(a.created_at),
          dataAtualizacao: new Date(a.updated_at),
          estabelecimentoId: estabId,
        })));
      }

      if (transacoesRes.data) {
        setTransacoes(transacoesRes.data.map(t => ({
          id: t.id,
          tipo: t.tipo === 'entrada' ? 'receita' : 'despesa',
          categoria: t.categoria,
          valor: Number(t.valor),
          descricao: t.descricao,
          data: new Date(t.data),
          metodoPagamento: t.forma_pagamento || 'dinheiro',
          status: 'pago',
          profissionalId: t.profissional_id || undefined,
          estabelecimentoId: estabId,
        })));
      }

      if (bloqueiosRes.data) {
        setBloqueios(bloqueiosRes.data.map(b => {
          const inicio = new Date(b.data_inicio);
          const fim = new Date(b.data_fim);
          return {
            id: b.id,
            profissionalId: b.profissional_id,
            dataInicio: inicio,
            dataFim: fim,
            horaInicio: inicio.toTimeString().slice(0, 5),
            horaFim: fim.toTimeString().slice(0, 5),
            motivo: b.motivo || '',
            dataCriacao: new Date(b.created_at),
          };
        }));
      }

      if (listaEsperaRes.data) {
        setListaEspera(listaEsperaRes.data.map(l => ({
          id: l.id,
          clienteId: l.cliente_id,
          servicoId: l.servico_id,
          preferenciaHorario: l.periodo_preferencia || '',
          observacoes: l.observacoes || '',
          dataCriacao: new Date(l.created_at),
        })));
      }

      if (lembretesRes.data) {
        setLembretes(lembretesRes.data.map(l => ({
          id: l.id,
          tipo: l.tipo as any,
          titulo: l.titulo,
          descricao: l.descricao || '',
          dataLembrete: new Date(l.data_lembrete),
          enviado: l.enviado,
          notificado: l.enviado,
          concluido: false,
          clienteId: l.cliente_id || undefined,
        })));
      }

      if (avaliacoesRes.data) {
        setAvaliacoes(avaliacoesRes.data.map(a => ({
          id: a.id,
          clienteId: a.cliente_id,
          agendamentoId: a.agendamento_id || '',
          profissionalId: a.profissional_id || '',
          servicoId: a.servico_id || '',
          nota: a.nota as any,
          comentario: a.comentario || '',
          resposta: a.resposta || '',
          visivel: a.visivel,
          data: new Date(a.data),
          estabelecimentoId: estabId,
        })));
      }

      if (notifsRes.data) {
        setNotificacoes(notifsRes.data.map(n => ({
          id: n.id,
          tipo: n.tipo,
          titulo: n.titulo,
          mensagem: n.mensagem,
          lida: n.lida,
          data: new Date(n.data),
          usuarioId: n.user_id,
          estabelecimentoId: estabId,
        })));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  };

  // Auth functions
  const login = async (email: string, senha: string): Promise<boolean | 'email_not_confirmed'> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        // Verificar se o erro é de email não confirmado
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          return 'email_not_confirmed';
        }
        throw error;
      }
      return !!data.user;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro no login:', error);
      }
      return false;
    }
  };

  const loginComGoogle = async (): Promise<boolean> => {
    try {
      const redirectTo = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      return !!data.url; // redirecionamento iniciado
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro no login Google:', error);
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

  const completarCadastroGoogle = async (dados: {
    telefone: string;
    nomeEstabelecimento: string;
    categoria: string;
  }): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          telefone: dados.telefone,
          nome_estabelecimento: dados.nomeEstabelecimento,
          categoria: dados.categoria,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Role já foi criada automaticamente pelo trigger como 'cliente'
      // Não permitimos que o usuário escolha seu papel por segurança

      // Reload user profile
      await loadUserProfile(user.id);
      
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao completar cadastro Google:', error);
      }
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setUser(null);
    setSession(null);
    setEstabelecimentoId(null);
    setClientes([]);
    setAgendamentos([]);
    setServicos([]);
    setTransacoes([]);
    setLembretes([]);
    setBloqueios([]);
    setListaEspera([]);
    setProfissionais([]);
    setAvaliacoes([]);
    setNotificacoes([]);
  };

  // Import Google Calendar events as schedule blocks for next 30 days
  const importarGoogleEventosComoBloqueio = async (): Promise<number> => {
    if (!estabelecimentoId || !user?.id) return 0;
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = (sess.session as any)?.provider_token as string | undefined;
      if (!token) return 0;

      // Ensure we have a profissional record for this user
      let profissionalId: string | null = null;
      const { data: prof } = await supabase
        .from('profissionais')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (prof?.id) {
        profissionalId = prof.id;
      } else {
        // Create a basic professional linked to user
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: created } = await supabase
          .from('profissionais')
          .insert({
            estabelecimento_id: estabelecimentoId,
            user_id: user.id,
            nome: profile?.nome_completo || 'Profissional',
            telefone: profile?.telefone || null,
            email: (await supabase.auth.getUser()).data.user?.email || null,
            ativo: true,
          })
          .select('id')
          .single();
        profissionalId = created?.id || null;
      }
      if (!profissionalId) return 0;

      const timeMin = new Date();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 30);
      const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin.toISOString())}&timeMax=${encodeURIComponent(timeMax.toISOString())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      const items = json?.items || [];
      let createdCount = 0;
      for (const ev of items) {
        const startStr = ev.start?.dateTime;
        const endStr = ev.end?.dateTime;
        if (!startStr || !endStr) continue;
        const start = new Date(startStr);
        const end = new Date(endStr);
        // Skip if existing block with same google_event_id
        const { data: exists } = await supabase
          .from('bloqueios')
          .select('id')
          .eq('motivo', ev.summary || 'Indisponível (Google)')
          .eq('data_inicio', start.toISOString())
          .maybeSingle();
        if (exists) continue;

        const { error } = await supabase.from('bloqueios').insert({
          estabelecimento_id: estabelecimentoId,
          profissional_id: profissionalId,
          data_inicio: start.toISOString(),
          data_fim: end.toISOString(),
          motivo: ev.summary || 'Indisponível (Google)',
        } as any);
        if (!error) createdCount++;
      }
      await loadAllData(estabelecimentoId);
      return createdCount;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao importar eventos do Google:', error);
      }
      return 0;
    }
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

  // Criar estabelecimento e promover usuário a admin
  const criarEstabelecimento = async (
    nomeEstabelecimento: string,
    telefone: string,
    categoria: string
  ): Promise<{ estabelecimentoId: string; codigoAcesso: string } | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase.rpc('criar_estabelecimento_e_promover', {
        _nome_estabelecimento: nomeEstabelecimento,
        _telefone: telefone,
        _categoria: categoria,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        // Recarregar perfil do usuário
        await loadUserProfile(user.id);
        return {
          estabelecimentoId: result.estabelecimento_id,
          codigoAcesso: result.codigo_acesso,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      return null;
    }
  };

  // Vincular cliente a um estabelecimento através de código do admin
  const vincularClientePorCodigo = async (codigo: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Buscar estabelecimento por código
      const { data: estab, error: estabError } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('codigo_acesso', codigo.toUpperCase())
        .single();

      if (estabError || !estab) {
        console.error('Estabelecimento não encontrado:', estabError);
        return false;
      }

      // Criar vínculo
      const { error: vinculoError } = await supabase
        .from('vinculos_cliente')
        .insert({
          cliente_user_id: user.id,
          estabelecimento_id: estab.id,
        });

      if (vinculoError) {
        console.error('Erro ao criar vínculo:', vinculoError);
        return false;
      }

      // Recarregar perfil
      await loadUserProfile(user.id);
      return true;
    } catch (error) {
      console.error('Erro ao vincular:', error);
      return false;
    }
  };

  const regenerarCodigoAcesso = async (): Promise<string | null> => {
    if (!estabelecimentoId) return null;

    try {
      const { data, error } = await supabase.rpc('regenerar_codigo_acesso', {
        _estabelecimento_id: estabelecimentoId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao regenerar código:', error);
      return null;
    }
  };

  // Cliente functions
  const adicionarCliente = async (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          estabelecimento_id: estabelecimentoId,
          nome: clienteData.nome,
          telefone: clienteData.telefone,
          email: clienteData.email,
          data_nascimento: clienteData.dataNascimento?.toISOString().split('T')[0],
          endereco: clienteData.endereco,
          observacoes: clienteData.observacoes,
          ativo: clienteData.status === 'ativo',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar cliente:', error);
      }
    }
  };

  const atualizarCliente = async (id: string, dados: Partial<Cliente>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: dados.nome,
          telefone: dados.telefone,
          email: dados.email,
          data_nascimento: dados.dataNascimento?.toISOString().split('T')[0],
          endereco: dados.endereco,
          observacoes: dados.observacoes,
          ativo: dados.status === 'ativo',
          ultima_visita: dados.ultimoAtendimento?.toISOString(),
          total_gasto: dados.totalGasto,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar cliente:', error);
      }
    }
  };

  const removerCliente = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover cliente:', error);
      }
    }
  };

  // Agendamento functions
  const adicionarAgendamento = async (agendamentoData: Omit<Agendamento, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          estabelecimento_id: estabelecimentoId,
          cliente_id: agendamentoData.clienteId,
          profissional_id: agendamentoData.profissionalId,
          servico_id: agendamentoData.servicoId,
          data_hora: agendamentoData.dataHora.toISOString(),
          duracao: agendamentoData.duracao,
          valor: agendamentoData.valor,
          status: agendamentoData.status,
          observacoes: agendamentoData.observacoes,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar agendamento:', error);
      }
    }
  };

  const atualizarAgendamento = async (id: string, dados: Partial<Agendamento>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({
          cliente_id: dados.clienteId,
          profissional_id: dados.profissionalId,
          servico_id: dados.servicoId,
          data_hora: dados.dataHora?.toISOString(),
          duracao: dados.duracao,
          valor: dados.valor,
          status: dados.status,
          observacoes: dados.observacoes,
          confirmado: dados.status === 'confirmado',
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar agendamento:', error);
      }
    }
  };

  const removerAgendamento = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover agendamento:', error);
      }
    }
  };

  // Servico functions
  const adicionarServico = async (servicoData: Omit<Servico, 'id'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert({
          estabelecimento_id: estabelecimentoId,
          nome: servicoData.nome,
          descricao: servicoData.descricao,
          duracao: servicoData.duracao,
          valor: servicoData.valor,
          categoria: servicoData.categoria,
          ativo: servicoData.ativo,
          profissionais_ids: servicoData.profissionaisIds,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar serviço:', error);
      }
    }
  };

  const atualizarServico = async (id: string, dados: Partial<Servico>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('servicos')
        .update({
          nome: dados.nome,
          descricao: dados.descricao,
          duracao: dados.duracao,
          valor: dados.valor,
          categoria: dados.categoria,
          ativo: dados.ativo,
          profissionais_ids: dados.profissionaisIds,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar serviço:', error);
      }
    }
  };

  const removerServico = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover serviço:', error);
      }
    }
  };

  // Transacao functions
  const adicionarTransacao = async (transacaoData: Omit<Transacao, 'id'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert({
          estabelecimento_id: estabelecimentoId,
          tipo: transacaoData.tipo === 'receita' ? 'entrada' : 'saida',
          categoria: transacaoData.categoria,
          valor: transacaoData.valor,
          descricao: transacaoData.descricao,
          data: transacaoData.data.toISOString(),
          forma_pagamento: transacaoData.metodoPagamento,
          profissional_id: transacaoData.profissionalId,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar transação:', error);
      }
    }
  };

  const atualizarTransacao = async (id: string, dados: Partial<Transacao>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('transacoes')
        .update({
          tipo: dados.tipo === 'receita' ? 'entrada' : 'saida',
          categoria: dados.categoria,
          valor: dados.valor,
          descricao: dados.descricao,
          data: dados.data?.toISOString(),
          forma_pagamento: dados.metodoPagamento,
          profissional_id: dados.profissionalId,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar transação:', error);
      }
    }
  };

  const removerTransacao = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover transação:', error);
      }
    }
  };

  // Lembrete functions
  const adicionarLembrete = async (lembreteData: Omit<Lembrete, 'id'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('lembretes')
        .insert({
          estabelecimento_id: estabelecimentoId,
          tipo: lembreteData.tipo,
          titulo: lembreteData.titulo,
          descricao: lembreteData.descricao,
          data_lembrete: lembreteData.dataLembrete.toISOString(),
          enviado: lembreteData.notificado,
          cliente_id: lembreteData.clienteId,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar lembrete:', error);
      }
    }
  };

  const atualizarLembrete = async (id: string, dados: Partial<Lembrete>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('lembretes')
        .update({
          tipo: dados.tipo,
          titulo: dados.titulo,
          descricao: dados.descricao,
          data_lembrete: dados.dataLembrete?.toISOString(),
          enviado: dados.notificado,
          cliente_id: dados.clienteId,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar lembrete:', error);
      }
    }
  };

  const removerLembrete = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('lembretes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover lembrete:', error);
      }
    }
  };

  // Bloqueio functions
  const adicionarBloqueio = async (bloqueioData: Omit<Bloqueio, 'id' | 'dataCriacao'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const inicio = new Date(bloqueioData.dataInicio);
      inicio.setHours(parseInt(bloqueioData.horaInicio.split(':')[0]), parseInt(bloqueioData.horaInicio.split(':')[1]));
      
      const fim = new Date(bloqueioData.dataFim);
      fim.setHours(parseInt(bloqueioData.horaFim.split(':')[0]), parseInt(bloqueioData.horaFim.split(':')[1]));
      
      const { data, error } = await supabase
        .from('bloqueios')
        .insert({
          estabelecimento_id: estabelecimentoId,
          profissional_id: bloqueioData.profissionalId,
          data_inicio: inicio.toISOString(),
          data_fim: fim.toISOString(),
          motivo: bloqueioData.motivo,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar bloqueio:', error);
      }
    }
  };

  const atualizarBloqueio = async (id: string, dados: Partial<Bloqueio>) => {
    if (!estabelecimentoId) return;
    
    try {
      const updateData: any = {};
      
      if (dados.dataInicio && dados.horaInicio) {
        const inicio = new Date(dados.dataInicio);
        inicio.setHours(parseInt(dados.horaInicio.split(':')[0]), parseInt(dados.horaInicio.split(':')[1]));
        updateData.data_inicio = inicio.toISOString();
      }
      
      if (dados.dataFim && dados.horaFim) {
        const fim = new Date(dados.dataFim);
        fim.setHours(parseInt(dados.horaFim.split(':')[0]), parseInt(dados.horaFim.split(':')[1]));
        updateData.data_fim = fim.toISOString();
      }
      
      if (dados.motivo !== undefined) updateData.motivo = dados.motivo;
      if (dados.profissionalId) updateData.profissional_id = dados.profissionalId;
      
      const { error } = await supabase
        .from('bloqueios')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar bloqueio:', error);
      }
    }
  };

  const removerBloqueio = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('bloqueios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover bloqueio:', error);
      }
    }
  };

  // Lista de Espera functions
  const adicionarListaEspera = async (itemData: Omit<ListaEspera, 'id' | 'dataCriacao'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('lista_espera')
        .insert({
          estabelecimento_id: estabelecimentoId,
          cliente_id: itemData.clienteId,
          servico_id: itemData.servicoId,
          periodo_preferencia: itemData.preferenciaHorario,
          observacoes: itemData.observacoes,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar à lista de espera:', error);
      }
    }
  };

  const removerListaEspera = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('lista_espera')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover da lista de espera:', error);
      }
    }
  };

  // Profissional functions
  const adicionarProfissional = async (profissionalData: Omit<Profissional, 'id' | 'dataCadastro'>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert({
          estabelecimento_id: estabelecimentoId,
          nome: profissionalData.nome,
          telefone: profissionalData.telefone,
          email: profissionalData.email,
          ativo: profissionalData.ativo,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar profissional:', error);
      }
    }
  };

  const atualizarProfissional = async (id: string, dados: Partial<Profissional>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('profissionais')
        .update({
          nome: dados.nome,
          telefone: dados.telefone,
          email: dados.email,
          ativo: dados.ativo,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar profissional:', error);
      }
    }
  };

  const removerProfissional = async (id: string) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao remover profissional:', error);
      }
    }
  };

  // Avaliacao functions
  const adicionarAvaliacao = async (avaliacaoData: Avaliacao) => {
    if (!estabelecimentoId) return;
    
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .insert({
          estabelecimento_id: estabelecimentoId,
          cliente_id: avaliacaoData.clienteId,
          agendamento_id: avaliacaoData.agendamentoId,
          profissional_id: avaliacaoData.profissionalId,
          servico_id: avaliacaoData.servicoId,
          nota: avaliacaoData.nota,
          comentario: avaliacaoData.comentario,
          visivel: avaliacaoData.visivel,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar avaliação:', error);
      }
    }
  };

  const atualizarAvaliacao = async (id: string, dados: Partial<Avaliacao>) => {
    if (!estabelecimentoId) return;
    
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({
          nota: dados.nota,
          comentario: dados.comentario,
          resposta: dados.resposta,
          visivel: dados.visivel,
        })
        .eq('id', id);

      if (error) throw error;
      await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar avaliação:', error);
      }
    }
  };

  // Notificacao functions
  const adicionarNotificacao = async (notificacaoData: Notificacao) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .insert({
          user_id: user.id,
          tipo: notificacaoData.tipo,
          titulo: notificacaoData.titulo,
          mensagem: notificacaoData.mensagem,
          lida: false,
          data: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data && estabelecimentoId) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao adicionar notificação:', error);
      }
    }
  };

  const marcarNotificacaoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;
      if (estabelecimentoId) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
  };

  const marcarTodasLidas = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id);

      if (error) throw error;
      if (estabelecimentoId) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao marcar todas como lidas:', error);
      }
    }
  };

  const limparNotificacoesAntigas = async () => {
    if (!user?.id) return;
    
    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('user_id', user.id)
        .eq('lida', true)
        .lt('data', seteDiasAtras.toISOString());

      if (error) throw error;
      if (estabelecimentoId) await loadAllData(estabelecimentoId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao limpar notificações antigas:', error);
      }
    }
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
    completarCadastroGoogle,
    logout,
    atualizarUsuario,
    loginComGoogle,
    criarEstabelecimento,
    vincularClientePorCodigo,
    regenerarCodigoAcesso,
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
    importarGoogleEventosComoBloqueio,
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