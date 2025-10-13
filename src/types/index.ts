// Gestão Total - Type Definitions

export enum TipoUsuario {
  ADMINISTRADOR = 'administrador',
  PROFISSIONAL = 'profissional',
  CLIENTE = 'cliente'
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  foto?: string;
  tipo: TipoUsuario;
  estabelecimentoId: string;
  estabelecimentoNome: string;
  ativo: boolean;
  dataCadastro: Date;
  profissao?: string;
  nomeNegocio?: string;
  configuracoes?: ConfiguracoesUsuario;
  onboardingCompleto?: boolean;
  setupCompleto?: boolean;
}

export interface Estabelecimento {
  id: string;
  nome: string;
  cnpj?: string;
  logo?: string;
  telefone: string;
  email: string;
  administradorId: string;
  ativo: boolean;
  dataCadastro: Date;
  configuracoes?: ConfiguracoesEstabelecimento;
}

export interface ConfiguracoesEstabelecimento {
  appCliente: {
    visibilidade: {
      mostrarNomeProfissional: boolean;
      mostrarFotoProfissional: boolean;
      mostrarValorServicos: boolean;
      mostrarDuracao: boolean;
      permitirEscolherProfissional: boolean;
      mostrarAgendaCompleta: boolean;
      mostrarAvaliacoes: boolean;
      permitirObservacoes: boolean;
    };
    regrasAgendamento: {
      antecedenciaMinima: number; // em horas
      antecedenciaMaxima: number; // em dias
      cancelamentoPermitidoAte: number; // em horas
      exigirConfirmacaoManual: boolean;
      limiteAgendamentosPorDia: number;
    };
    aparencia: {
      corPrimaria: string;
      mensagemBoasVindas: string;
      logo?: string;
      fotoCapa?: string;
    };
  };
}

export interface ConfiguracoesUsuario {
  tema: 'claro' | 'escuro' | 'automatico';
  corPrimaria: string;
  notificacoes: {
    umDiaAntes: boolean;
    umaHoraAntes: boolean;
    lembreteInativos: boolean;
    resumoDiario: boolean;
    resumoSemanal: boolean;
  };
  horarioTrabalho: {
    [key: number]: {
      ativo: boolean;
      inicio: string;
      fim: string;
      intervaloInicio?: string;
      intervaloFim?: string;
    };
  };
  formasPagamento: {
    dinheiro: boolean;
    pix: boolean;
    chavePix?: string;
    cartaoCredito: boolean;
    cartaoDebito: boolean;
    transferencia: boolean;
  };
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  foto?: string;
  dataNascimento?: Date;
  endereco?: string;
  comoConheceu?: string;
  observacoes?: string;
  tags: string[];
  status: 'ativo' | 'inativo';
  avaliacao?: number;
  dataCadastro: Date;
  ultimoAtendimento?: Date;
  totalGasto: number;
  ticketMedio: number;
  estabelecimentoId: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  profissionalId?: string;
  servicoId: string;
  dataHora: Date;
  duracao: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado' | 'faltou';
  valor: number;
  pagamentoAntecipado: boolean;
  pagamentoStatus: 'pendente' | 'pago';
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  estabelecimentoId: string;
}

export interface Servico {
  id: string;
  nome: string;
  duracao: number;
  valor: number;
  cor: string;
  ativo: boolean;
  exigePagamentoAntecipado: boolean;
  descricao?: string;
  categoria?: string;
  foto?: string;
  destaque: boolean;
  profissionaisIds: string[];
  estabelecimentoId: string;
}

export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: Date;
  metodoPagamento: string;
  status: 'pago' | 'pendente' | 'atrasado';
  clienteId?: string;
  servicoId?: string;
  profissionalId?: string;
  comprovante?: string;
  observacoes?: string;
  estabelecimentoId: string;
}

export interface Lembrete {
  id: string;
  tipo: 'retorno_cliente' | 'aniversario' | 'pagamento' | 'personalizado';
  clienteId?: string;
  titulo: string;
  descricao?: string;
  dataLembrete: Date;
  repetir?: 'nunca' | 'semanal' | 'mensal' | 'anual';
  notificado: boolean;
  concluido: boolean;
}

export interface Bloqueio {
  id: string;
  profissionalId: string;
  motivo: string;
  dataInicio: Date;
  dataFim: Date;
  horaInicio: string;
  horaFim: string;
  dataCriacao: Date;
}

export interface ListaEspera {
  id: string;
  clienteId: string;
  servicoId: string;
  preferenciaHorario: string;
  observacoes?: string;
  dataCriacao: Date;
}

export interface Profissional {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  foto?: string;
  ativo: boolean;
  estabelecimentoId: string;
  servicosIds: string[];
  dataCadastro: Date;
}

export interface Avaliacao {
  id: string;
  clienteId: string;
  profissionalId: string;
  agendamentoId: string;
  servicoId: string;
  nota: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  resposta?: string;
  data: Date;
  visivel: boolean;
  estabelecimentoId: string;
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: Date;
  link?: string;
  estabelecimentoId: string;
}

export interface DashboardMetricas {
  clientesAtivos: number;
  agendamentosHoje: number;
  faturamentoMes: number;
  lembretesPendentes: number;
}

export interface BackupData {
  versao: string;
  dataExportacao: Date;
  usuario: Usuario;
  clientes: Cliente[];
  agendamentos: Agendamento[];
  servicos: Servico[];
  transacoes: Transacao[];
  lembretes: Lembrete[];
}
