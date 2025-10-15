-- Ensure OAuth signups get a default role of 'cliente' if none is provided
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile from metadata if available
  INSERT INTO public.profiles (id, nome_completo, telefone, nome_estabelecimento, categoria)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', COALESCE(new.raw_user_meta_data->>'full_name', new.email)),
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'nome_estabelecimento',
    new.raw_user_meta_data->>'categoria'
  );

  -- Insert user role; default to 'cliente' if not provided
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'tipo')::app_role, 'cliente')
  );

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
