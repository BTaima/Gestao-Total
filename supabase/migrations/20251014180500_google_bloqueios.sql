-- Add google_event_id to bloqueios for Google Calendar sync
ALTER TABLE public.bloqueios
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bloqueios_google_event ON public.bloqueios(google_event_id);
