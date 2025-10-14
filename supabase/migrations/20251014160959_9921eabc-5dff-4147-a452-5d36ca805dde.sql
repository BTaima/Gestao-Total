-- Fix admin access to profiles table
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

CREATE POLICY "Users can view own profile, admins view all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR public.has_role(auth.uid(), 'administrador')
);

CREATE POLICY "Users can update own profile, admins update all"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create estabelecimentos table
CREATE TABLE public.estabelecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  horario_funcionamento JSONB,
  configuracoes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own establishment"
ON public.estabelecimentos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own establishment"
ON public.estabelecimentos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own establishment"
ON public.estabelecimentos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  data_nascimento DATE,
  endereco TEXT,
  cpf TEXT,
  observacoes TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT now(),
  ultima_visita TIMESTAMPTZ,
  total_gasto DECIMAL(10,2) DEFAULT 0,
  numero_visitas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and professionals can view clients in their establishment"
ON public.clientes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = clientes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

CREATE POLICY "Admins and professionals can manage clients"
ON public.clientes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = clientes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create servicos table
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  profissionais_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
ON public.servicos FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage services"
ON public.servicos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = servicos.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create profissionais table
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  especialidade TEXT,
  horario_trabalho JSONB,
  comissao DECIMAL(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active professionals"
ON public.profissionais FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage professionals"
ON public.profissionais FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = profissionais.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  confirmado BOOLEAN DEFAULT false,
  lembrete_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'falta'))
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
ON public.agendamentos FOR SELECT
USING (
  -- Admins and professionals in establishment
  (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e
      WHERE e.id = agendamentos.estabelecimento_id
      AND e.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1 FROM public.profissionais p
      WHERE p.id = agendamentos.profissional_id
      AND p.user_id = auth.uid()
    )
  )
  -- Or clients viewing their own
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    JOIN public.profiles pr ON pr.telefone = c.telefone
    WHERE c.id = agendamentos.cliente_id
    AND pr.id = auth.uid()
  )
);

CREATE POLICY "Admins and professionals can manage appointments"
ON public.agendamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = agendamentos.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
  OR EXISTS (
    SELECT 1 FROM public.profissionais p
    WHERE p.id = agendamentos.profissional_id
    AND p.user_id = auth.uid()
  )
);

-- Create transacoes table
CREATE TABLE public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  forma_pagamento TEXT,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_tipo CHECK (tipo IN ('entrada', 'saida'))
);

ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all transactions"
ON public.transacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = transacoes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

CREATE POLICY "Admins can manage transactions"
ON public.transacoes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = transacoes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create bloqueios table
CREATE TABLE public.bloqueios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and professionals can view blocks"
ON public.bloqueios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = bloqueios.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
  OR EXISTS (
    SELECT 1 FROM public.profissionais p
    WHERE p.id = bloqueios.profissional_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage blocks"
ON public.bloqueios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = bloqueios.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create lista_espera table
CREATE TABLE public.lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  data_preferencia DATE,
  periodo_preferencia TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'aguardando',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view waiting list"
ON public.lista_espera FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = lista_espera.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create avaliacoes table
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  resposta TEXT,
  visivel BOOLEAN DEFAULT true,
  data TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews"
ON public.avaliacoes FOR SELECT
USING (visivel = true);

CREATE POLICY "Admins can manage reviews"
ON public.avaliacoes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = avaliacoes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create notificacoes table
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data TIMESTAMPTZ DEFAULT now(),
  dados JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notificacoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notificacoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notificacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create lembretes table
CREATE TABLE public.lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_lembrete TIMESTAMPTZ NOT NULL,
  enviado BOOLEAN DEFAULT false,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  dados JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminders"
ON public.lembretes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = lembretes.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.estabelecimentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transacoes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bloqueios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lista_espera FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lembretes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_clientes_estabelecimento ON public.clientes(estabelecimento_id);
CREATE INDEX idx_servicos_estabelecimento ON public.servicos(estabelecimento_id);
CREATE INDEX idx_profissionais_estabelecimento ON public.profissionais(estabelecimento_id);
CREATE INDEX idx_agendamentos_estabelecimento ON public.agendamentos(estabelecimento_id);
CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_cliente ON public.agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_profissional ON public.agendamentos(profissional_id);
CREATE INDEX idx_transacoes_estabelecimento ON public.transacoes(estabelecimento_id);
CREATE INDEX idx_transacoes_data ON public.transacoes(data);
CREATE INDEX idx_bloqueios_profissional ON public.bloqueios(profissional_id);
CREATE INDEX idx_avaliacoes_estabelecimento ON public.avaliacoes(estabelecimento_id);
CREATE INDEX idx_notificacoes_user ON public.notificacoes(user_id);
CREATE INDEX idx_lembretes_estabelecimento ON public.lembretes(estabelecimento_id);