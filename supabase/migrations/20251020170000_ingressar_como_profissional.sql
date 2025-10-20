-- Função para ingressar como profissional em um estabelecimento via código de acesso
CREATE OR REPLACE FUNCTION public.ingressar_como_profissional(
  _codigo TEXT,
  _nome TEXT DEFAULT NULL,
  _telefone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _estab_id UUID;
  _prof_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Buscar estabelecimento pelo código (case-insensitive)
  SELECT id INTO _estab_id
  FROM public.estabelecimentos
  WHERE upper(codigo_acesso) = upper(_codigo)
  LIMIT 1;

  IF _estab_id IS NULL THEN
    RAISE EXCEPTION 'Código de acesso inválido';
  END IF;

  -- Se já for profissional neste estabelecimento, somente retorna o id
  SELECT id INTO _prof_id FROM public.profissionais
  WHERE user_id = _user_id AND estabelecimento_id = _estab_id
  LIMIT 1;

  IF _prof_id IS NOT NULL THEN
    -- Atualiza profile com estabelecimento por consistência
    UPDATE public.profiles SET estabelecimento_id = _estab_id WHERE id = _user_id;
    RETURN _prof_id;
  END IF;

  -- Criar registro de profissional vinculado ao usuário
  INSERT INTO public.profissionais (estabelecimento_id, user_id, nome, telefone, email, ativo)
  SELECT _estab_id, _user_id,
         COALESCE(_nome, p.nome_completo),
         COALESCE(_telefone, p.telefone),
         u.email,
         true
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = _user_id
  WHERE u.id = _user_id
  RETURNING id INTO _prof_id;

  -- Garantir role de profissional (mantém cliente se existir)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'profissional'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Atualizar profile com estabelecimento para facilitar joins/RLS
  UPDATE public.profiles SET estabelecimento_id = _estab_id WHERE id = _user_id;

  RETURN _prof_id;
END;
$$;
