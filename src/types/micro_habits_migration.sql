-- Add Micro-Habit columns to habits table

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS micro_step TEXT,
ADD COLUMN IF NOT EXISTS anchor TEXT,
ADD COLUMN IF NOT EXISTS identity_affirmation TEXT;

-- Optional: Add comments/descriptions
COMMENT ON COLUMN habits.micro_step IS 'The < 2 min action to start the habit';
COMMENT ON COLUMN habits.anchor IS 'The existing habit to link this one to';
COMMENT ON COLUMN habits.identity_affirmation IS 'Identity statement (I am...)';
