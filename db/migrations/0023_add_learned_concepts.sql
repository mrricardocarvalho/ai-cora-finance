ALTER TABLE profiles
ADD COLUMN learned_concepts TEXT[] DEFAULT '{}';

COMMENT ON COLUMN profiles.learned_concepts IS 
  'Array of concept slugs the user has learned';
