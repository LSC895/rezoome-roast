-- Add language column to roasts table
ALTER TABLE public.roasts 
ADD COLUMN language text NOT NULL DEFAULT 'english';

-- Add check constraint for valid languages
ALTER TABLE public.roasts
ADD CONSTRAINT roasts_language_check 
CHECK (language IN ('english', 'hindi', 'hinglish', 'spanish', 'french', 'german', 'japanese', 'portuguese'));