

## Plan: Upgrade rezoome to 8/10 SaaS

Based on the previous assessment, here are the 5 features to implement:

### 1. Shareable Roast Score Card
- Create a visually striking score card component on the Results page showing: score, tone, language, file name, and a snippet of the roast
- Add "Download as Image" button using `html2canvas` (new dependency) to generate a PNG
- Add "Share on Twitter/X" button with pre-filled text + link back to the app
- This is the **viral growth engine** -- every share = free marketing

### 2. Roast History Dashboard
- New `/history` page showing all past roasts for the logged-in user
- Query the `roasts` table (already stores everything) and display as cards with: file name, score, tone, language, date
- Click a card to re-view the full roast (load from DB, navigate to Results)
- Add "History" link to the nav bar (visible when logged in)

### 3. Shareable Public Roast Links
- Add a `share_token` column (unique text) to the `roasts` table
- New `/roast/:shareToken` public route that loads a roast by share token
- Add an RLS policy allowing public SELECT when accessed by share_token
- "Copy Share Link" button on Results page that generates/shows the shareable URL
- This drives organic traffic back to the app

### 4. Referral System with Free Credits
- New `referrals` table: `id, referrer_id, referred_id, created_at`
- Add `referral_code` column to `profiles` (auto-generated from user ID or random string)
- Add `bonus_roasts` column to `profiles` (default 0) -- extra roasts beyond the daily limit
- When a new user signs up with a referral code, both users get +3 bonus roasts
- Show referral code + copy link on the History/Dashboard page
- Update the upload flow to check `roasts_today < 1 + bonus_roasts` for free users

### 5. Enhanced Results Page
- Display language badge alongside tone on Results page
- Add a animated score gauge/meter visualization (circular progress)
- Add language-specific loading messages on the Upload page (e.g., "भाई, पढ़ रहे हैं... 👀" for Hindi)
- Retry button when roast fails

### Database Changes (migrations)
```sql
-- Add share_token to roasts
ALTER TABLE public.roasts ADD COLUMN share_token text UNIQUE DEFAULT NULL;

-- Public read policy for shared roasts
CREATE POLICY "Anyone can view shared roasts"
ON public.roasts FOR SELECT TO anon, authenticated
USING (share_token IS NOT NULL AND share_token != '');

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

-- Add referral_code and bonus_roasts to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN bonus_roasts integer NOT NULL DEFAULT 0;
```

### New Files
- `src/pages/History.tsx` -- roast history dashboard with referral section
- `src/pages/SharedRoast.tsx` -- public roast view page

### Modified Files
- `src/App.tsx` -- add `/history` and `/roast/:shareToken` routes
- `src/pages/Results.tsx` -- add score gauge, share card, share link, language badge, download button
- `src/pages/Upload.tsx` -- language-specific loading messages, check bonus_roasts for daily limit
- `src/contexts/AuthContext.tsx` -- no changes needed
- `src/pages/Index.tsx` -- update nav to show History link when logged in
- `package.json` -- add `html2canvas` dependency

### New Dependency
- `html2canvas` for generating downloadable score card images

### Implementation Order
1. Database migration (share_token, referrals table, profile columns)
2. History page + route
3. Shareable score card + download on Results page
4. Share link generation (share_token) + public roast route
5. Referral system (signup flow + bonus roasts display)
6. Enhanced UI (score gauge, language badges, loading messages, retry)

