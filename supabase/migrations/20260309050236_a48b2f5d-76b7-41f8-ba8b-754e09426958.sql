-- Create function to process referral on first login
CREATE OR REPLACE FUNCTION public.process_referral(referral_code_input text, referred_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id uuid;
BEGIN
  -- Find the referrer by their referral code
  SELECT user_id INTO referrer_user_id
  FROM public.profiles
  WHERE referral_code = referral_code_input;
  
  -- If no referrer found, return false
  IF referrer_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Don't allow self-referral
  IF referrer_user_id = referred_user_id THEN
    RETURN false;
  END IF;
  
  -- Check if this referral already exists
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = referred_user_id) THEN
    RETURN false;
  END IF;
  
  -- Create the referral record
  INSERT INTO public.referrals (referrer_id, referred_id)
  VALUES (referrer_user_id, referred_user_id);
  
  -- Add bonus roasts to both users
  UPDATE public.profiles SET bonus_roasts = bonus_roasts + 3 WHERE user_id = referrer_user_id;
  UPDATE public.profiles SET bonus_roasts = bonus_roasts + 3 WHERE user_id = referred_user_id;
  
  RETURN true;
END;
$$;