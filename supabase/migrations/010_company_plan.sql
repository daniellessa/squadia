ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' 
CHECK (plan IN ('free', 'pro', 'enterprise'));
