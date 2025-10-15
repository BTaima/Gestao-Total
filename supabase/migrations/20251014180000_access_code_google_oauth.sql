-- Add access code to establishments, link profiles to establishment, google fields, and improve RLS

-- 1) Access code on establishments
ALTER TABLE public.estabelecimentos
  ADD COLUMN IF NOT EXISTS codigo_acesso TEXT;

-- Default generator for new rows
ALTER TABLE public.estabelecimentos
  ALTER COLUMN codigo_acesso SET DEFAULT substr(encode(gen_random_bytes(8), 'hex'), 1, 8);

-- Backfill existing rows
UPDATE public.estabelecimentos
SET codigo_acesso = COALESCE(codigo_acesso, substr(encode(gen_random_bytes(8), 'hex'), 1, 8));

-- Enforce constraints
ALTER TABLE public.estabelecimentos
  ALTER COLUMN codigo_acesso SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_estabelecimentos_codigo_acesso ON public.estabelecimentos(codigo_acesso);

-- 2) Link profiles to establishment and google fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;

-- 3) Google Calendar fields on appointments
ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS google_event_id TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;

-- 4) Link clientes to auth.users for better RLS and joins
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_user ON public.clientes(user_id);

-- 5) RLS updates
-- Clientes: allow owner admin and professionals of same establishment to manage; allow client to read own
DROP POLICY IF EXISTS "Admins and professionals can view clients in their establishment" ON public.clientes;
DROP POLICY IF EXISTS "Admins and professionals can manage clients" ON public.clientes;

CREATE POLICY "Read clients by owner/professional or self"
ON public.clientes FOR SELECT
USING (
  -- Owner of establishment or admin
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = clientes.estabelecimento_id
      AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
  OR EXISTS (
    SELECT 1 FROM public.profissionais p
    WHERE p.estabelecimento_id = clientes.estabelecimento_id
      AND p.user_id = auth.uid()
  )
  OR (clientes.user_id = auth.uid())
);

CREATE POLICY "Manage clients by owner or professional"
ON public.clientes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = clientes.estabelecimento_id
      AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
  OR EXISTS (
    SELECT 1 FROM public.profissionais p
    WHERE p.estabelecimento_id = clientes.estabelecimento_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estabelecimentos e
    WHERE e.id = clientes.estabelecimento_id
      AND e.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'administrador')
  OR EXISTS (
    SELECT 1 FROM public.profissionais p
    WHERE p.estabelecimento_id = clientes.estabelecimento_id
      AND p.user_id = auth.uid()
  )
);

-- Servicos: restrict viewing to users tied to establishment (admin/owner/professional/client linked), and active only
DROP POLICY IF EXISTS "Anyone can view active services" ON public.servicos;

CREATE POLICY "View active services if tied to establishment"
ON public.servicos FOR SELECT
USING (
  servicos.ativo = true AND (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e
      WHERE e.id = servicos.estabelecimento_id
        AND e.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1 FROM public.profissionais p
      WHERE p.estabelecimento_id = servicos.estabelecimento_id
        AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
        AND pr.estabelecimento_id = servicos.estabelecimento_id
    )
  )
);

-- Agendamentos: allow clients with linked cliente record (by user_id) to read own
DROP POLICY IF EXISTS "Users can view own appointments" ON public.agendamentos;

CREATE POLICY "Users can view own appointments or manage by role"
ON public.agendamentos FOR SELECT
USING (
  -- Admins and professionals in establishment or owner
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
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = agendamentos.cliente_id
      AND c.user_id = auth.uid()
  )
);

-- Keep existing manage policy for agendamentos
-- Indexes for google fields (optional)
CREATE INDEX IF NOT EXISTS idx_agendamentos_google_event ON public.agendamentos(google_event_id);
