-- Make telefone optional in profiles table
ALTER TABLE public.profiles 
ALTER COLUMN telefone DROP NOT NULL;

-- Update the trigger function to handle optional role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tipo TEXT;
BEGIN
  -- Insert profile with potentially null values
  INSERT INTO public.profiles (id, nome_completo, telefone, nome_estabelecimento, categoria)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', new.email),
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'nome_estabelecimento',
    new.raw_user_meta_data->>'categoria'
  );
  
  -- Only insert role if tipo is provided
  _tipo := new.raw_user_meta_data->>'tipo';
  IF _tipo IS NOT NULL AND _tipo != '' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, _tipo::app_role);
  END IF;
  
  RETURN new;
END;
$$;
