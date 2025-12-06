-- Epic 8: Add missing tax profile columns
-- Run this first

-- Add tax-relevant flags to profiles (safe to run multiple times)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_property_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_self_employed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_investor boolean DEFAULT true;

-- Add car owner flag for IUC
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_car_owner boolean DEFAULT false;

-- Update tax_applies_to enum to include car_owners
DO $$ BEGIN
  ALTER TYPE tax_applies_to ADD VALUE IF NOT EXISTS 'car_owners';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN 
    -- If enum doesn't exist, create it
    CREATE TYPE tax_applies_to AS ENUM ('all', 'property_owners', 'investors', 'self_employed', 'car_owners');
END $$;
