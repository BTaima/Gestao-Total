-- Função para vincular usuário como profissional via código de acesso do estabelecimento
CREATE OR REPLACE FUNCTION public.vincular_profissional_por_codigo(
  _codigo_acesso TEXT,
  _nome TEXT DEFAULT NULL,
  _telefone TEXT DEFAULT NULL
)
RETURNS TABLE (estabelecimento_id UUID, profissional_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _estab_id UUID;
  _prof_id UUID;
  _user_email TEXT;
  _user_nome TEXT;
  _user_telefone TEXT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT id INTO _estab_id FROM estabelecimentos WHERE upper(codigo_acesso) = upper(_codigo_acesso);
  IF _estab_id IS NULL THEN
    RAISE EXCEPTION 'Código inválido';
  END IF;

  -- Se já for profissional vinculado a este estabelecimento, apenas retorna
  SELECT id INTO _prof_id FROM profissionais WHERE estabelecimento_id = _estab_id AND user_id = _user_id;
  IF _prof_id IS NOT NULL THEN
    RETURN QUERY SELECT _estab_id, _prof_id;
    RETURN;
  END IF;

  SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
  SELECT COALESCE(_nome, nome_completo), COALESCE(_telefone, telefone)
    INTO _user_nome, _user_telefone
    FROM profiles WHERE id = _user_id;

  INSERT INTO profissionais (estabelecimento_id, user_id, nome, telefone, email, ativo)
  VALUES (_estab_id, _user_id, _user_nome, _user_telefone, _user_email, true)
  RETURNING id INTO _prof_id;

  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'profissional'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Remover role de cliente para manter uma role ativa (modelo atual)
  DELETE FROM user_roles WHERE user_id = _user_id AND role = 'cliente';

  RETURN QUERY SELECT _estab_id, _prof_id;
END;
$$;
