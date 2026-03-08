
-- Add participants (array of email strings), agenda (array of items), and reminder settings
ALTER TABLE public.meetings
  ADD COLUMN participants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN agenda JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN reminder_minutes INTEGER DEFAULT 15;
