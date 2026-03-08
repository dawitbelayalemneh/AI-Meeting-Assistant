
ALTER TABLE public.meetings
  ADD COLUMN ai_key_points JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN ai_decisions JSONB DEFAULT '[]'::jsonb;
