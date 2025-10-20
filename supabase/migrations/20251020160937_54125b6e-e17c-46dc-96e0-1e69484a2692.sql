-- Adicionar coluna codigo_acesso na tabela estabelecimentos
ALTER TABLE public.estabelecimentos 
ADD COLUMN IF NOT EXISTS codigo_acesso VARCHAR(10) UNIQUE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_codigo_acesso 
ON public.estabelecimentos(codigo_acesso);

-- Criar tabela de vínculos cliente-estabelecimento
CREATE TABLE IF NOT EXISTS public.vinculos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN DEFAULT true,
  UNIQUE(cliente_user_id, estabelecimento_id)
);

-- Enable RLS
ALTER TABLE public.vinculos_cliente ENABLE ROW LEVEL SECURITY;

-- RLS Policies para vinculos_cliente
CREATE POLICY "Clientes podem ver seus vínculos"
ON public.vinculos_cliente
FOR SELECT
USING (auth.uid() = cliente_user_id);

CREATE POLICY "Clientes podem criar vínculos"
ON public.vinculos_cliente
FOR INSERT
WITH CHECK (auth.uid() = cliente_user_id);

CREATE POLICY "Admins podem ver vínculos do estabelecimento"
ON public.vinculos_cliente
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = vinculos_cliente.estabelecimento_id
    AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
);

-- Função para criar estabelecimento e promover usuário
CREATE OR REPLACE FUNCTION public.criar_estabelecimento_e_promover(
  _nome_estabelecimento TEXT,
  _telefone TEXT,
  _categoria TEXT
)
RETURNS TABLE (estabelecimento_id UUID, codigo_acesso TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _estabelecimento_id UUID;
  _codigo TEXT;
  _user_email TEXT;
  _user_nome TEXT;
BEGIN
  -- Pegar user_id do usuário logado
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se usuário já tem estabelecimento
  IF EXISTS (SELECT 1 FROM estabelecimentos WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Usuário já possui estabelecimento';
  END IF;
  
  -- Gerar código único de 6 caracteres
  LOOP
    _codigo := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM estabelecimentos WHERE codigo_acesso = _codigo);
  END LOOP;
  
  -- Criar estabelecimento
  INSERT INTO estabelecimentos (user_id, nome, telefone, codigo_acesso)
  VALUES (_user_id, _nome_estabelecimento, _telefone, _codigo)
  RETURNING id INTO _estabelecimento_id;
  
  -- Promover usuário para administrador
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'administrador'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remover role de cliente
  DELETE FROM user_roles WHERE user_id = _user_id AND role = 'cliente';
  
  -- Buscar dados do usuário para criar profissional
  SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
  SELECT nome_completo INTO _user_nome FROM profiles WHERE id = _user_id;
  
  -- Criar profissional vinculado ao usuário
  INSERT INTO profissionais (estabelecimento_id, user_id, nome, telefone, email, ativo)
  VALUES (_estabelecimento_id, _user_id, _user_nome, _telefone, _user_email, true);
  
  -- Atualizar profile com categoria e nome do estabelecimento
  UPDATE profiles 
  SET categoria = _categoria, nome_estabelecimento = _nome_estabelecimento
  WHERE id = _user_id;
  
  RETURN QUERY SELECT _estabelecimento_id, _codigo;
END;
$$;

-- Função para regenerar código de acesso
CREATE OR REPLACE FUNCTION public.regenerar_codigo_acesso(
  _estabelecimento_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _codigo TEXT;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se usuário é dono do estabelecimento
  IF NOT EXISTS (
    SELECT 1 FROM estabelecimentos 
    WHERE id = _estabelecimento_id AND user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  -- Gerar código único
  LOOP
    _codigo := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM estabelecimentos WHERE codigo_acesso = _codigo);
  END LOOP;
  
  -- Atualizar código
  UPDATE estabelecimentos
  SET codigo_acesso = _codigo
  WHERE id = _estabelecimento_id;
  
  RETURN _codigo;
END;
$$;