-- Fix user_roles table RLS policies
-- Prevent manual inserts (only trigger should create roles)
CREATE POLICY "Roles can only be created by system"
ON public.user_roles FOR INSERT
WITH CHECK (false);

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Add input validation constraints to profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT nome_completo_length CHECK (length(trim(nome_completo)) >= 3 AND length(nome_completo) <= 100),
ADD CONSTRAINT telefone_format CHECK (telefone ~ '^\(\d{2}\) \d{4,5}-\d{4}$' OR telefone IS NULL),
ADD CONSTRAINT nome_estabelecimento_length CHECK (nome_estabelecimento IS NULL OR (length(trim(nome_estabelecimento)) >= 3 AND length(nome_estabelecimento) <= 100));