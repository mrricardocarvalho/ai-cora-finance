-- Add goals and worries columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS worries text[] DEFAULT '{}';
