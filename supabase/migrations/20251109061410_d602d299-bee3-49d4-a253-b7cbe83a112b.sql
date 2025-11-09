-- Add password_hash column to files table for optional password protection
ALTER TABLE public.files 
ADD COLUMN password_hash text NULL;

-- Add comment explaining the password protection feature
COMMENT ON COLUMN public.files.password_hash IS 'Optional bcrypt hash of user-provided password for additional file protection';