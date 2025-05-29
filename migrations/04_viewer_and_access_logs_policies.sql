-- Allow anonymous inserts into viewers and access_logs tables
-- This policy enables unauthenticated (anon) users to create rows so that
-- the public viewer information form can store data without requiring login.
-- Existing SELECT policies remain unchanged and continue to protect data from being
-- read by unauthorized users.

-- === viewers table ===
ALTER TABLE public.viewers ENABLE ROW LEVEL SECURITY;

-- Allow INSERT from any role (including anon). No row-level condition is required
-- other than the table constraints themselves.
CREATE POLICY "public_insert_viewers" ON public.viewers
  FOR INSERT WITH CHECK (true);

-- Ensure the anon role has INSERT privilege on the table
GRANT INSERT ON public.viewers TO anon;

-- === access_logs table ===
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_access_logs" ON public.access_logs
  FOR INSERT WITH CHECK (true);

GRANT INSERT ON public.access_logs TO anon;
