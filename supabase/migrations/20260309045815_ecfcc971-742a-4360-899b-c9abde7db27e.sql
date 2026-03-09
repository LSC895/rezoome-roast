-- Add share_token to roasts for public sharing
ALTER TABLE public.roasts ADD COLUMN share_token text UNIQUE DEFAULT NULL;

-- Public read policy for shared roasts (anyone can view by share_token)
CREATE POLICY "Anyone can view shared roasts"
ON public.roasts FOR SELECT TO anon, authenticated
USING (share_token IS NOT NULL AND share_token != '');

-- Referrals table for tracking referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals they made
CREATE POLICY "Users can view their referrals" 
ON public.referrals FOR SELECT TO authenticated 
USING (auth.uid() = referrer_id);

-- Add referral_code and bonus_roasts to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN bonus_roasts integer NOT NULL DEFAULT 0;

-- Create trigger to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.referral_code := substring(md5(random()::text || NEW.user_id::text) from 1 for 8);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();