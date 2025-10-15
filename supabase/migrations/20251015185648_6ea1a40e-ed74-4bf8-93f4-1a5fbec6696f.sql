-- Permitir que o trigger handle_new_user crie profiles sem todos os campos preenchidos
-- Tornar campos opcionais para permitir pre-cadastro do Google

ALTER TABLE public.profiles 
  ALTER COLUMN telefone DROP NOT NULL,
  ALTER COLUMN categoria DROP NOT NULL;

-- Atualizar RLS policy para permitir que usuários atualizem seu próprio profile
DROP POLICY IF EXISTS "Users can update own profile, admins update all" ON public.profiles;

CREATE POLICY "Users can update own profile, admins update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR has_role(auth.uid(), 'administrador'::app_role))
WITH CHECK (auth.uid() = id OR has_role(auth.uid(), 'administrador'::app_role));

-- Permitir que usuários criem seu próprio perfil (para login com Google)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Atualizar o trigger handle_new_user para criar profile mesmo sem metadados completos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir profile com dados disponíveis (pode ter campos null)
  INSERT INTO public.profiles (id, nome_completo, telefone, nome_estabelecimento, categoria)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário'),
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'nome_estabelecimento',
    new.raw_user_meta_data->>'categoria'
  );
  
  -- Inserir role se especificada, senão não insere nada (será feito no pre-cadastro)
  IF new.raw_user_meta_data->>'tipo' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (new.raw_user_meta_data->>'tipo')::app_role);
  END IF;
  
  RETURN new;
END;
$function$;