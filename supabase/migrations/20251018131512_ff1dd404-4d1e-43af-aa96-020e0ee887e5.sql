-- Criar função segura para definir role padrão como cliente
-- Esta função usa SECURITY DEFINER para permitir que novos usuários
-- recebam a role 'cliente' sem privilégios elevados

CREATE OR REPLACE FUNCTION public.set_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir role padrão como 'cliente' para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Atualizar trigger handle_new_user para sempre usar 'cliente' como padrão
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir profile com dados disponíveis
  INSERT INTO public.profiles (id, nome_completo, telefone, nome_estabelecimento, categoria)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'nome_estabelecimento',
    NEW.raw_user_meta_data->>'categoria'
  );
  
  -- SEMPRE inserir como 'cliente' por padrão (segurança crítica)
  -- Ignora qualquer valor de 'tipo' enviado pelo cliente
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar comentário explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 
'Cria perfil e atribui role padrão cliente para novos usuários. Role deve ser modificada apenas por administradores via painel admin.';