

## Rezoome — Resume Roast SaaS

### Pages & Flow

1. **Landing Page** — Bold, fun branding with tagline like "Your resume sucks. Let's fix it." CTA button to upload resume. Shows example roasts and social proof.

2. **Upload Page** — PDF upload dropzone. User picks roast tone: **Brutal**, **Balanced**, or **Gentle** via toggle buttons. Hit "Roast Me" to submit.

3. **Roast Results Page** — Animated reveal of the AI-generated roast (streamed token-by-token for dramatic effect). Below the roast: actionable fix suggestions as bullet points. Free users see a preview of fixes; full suggestions are behind a paywall with a "Unlock Full Fixes" CTA.

4. **Pricing Page** — Free tier (1 roast/day, partial fixes) vs Pro tier (unlimited roasts, full fix suggestions, roast history). Stripe checkout for Pro.

5. **Auth Pages** — Sign up / Log in (email-based via Supabase). Required for Pro features and roast history.

6. **Dashboard (Pro)** — History of past roasts with resume name, date, tone, and score. Click to re-view any roast result.

### Backend (Lovable Cloud + Supabase)

- **Auth**: Email sign-up/login via Supabase Auth
- **Database**: `profiles` table, `roasts` table (stores resume text, tone, roast result, fixes, created_at), `user_roles` for plan tracking
- **Storage**: Supabase Storage bucket for uploaded PDFs
- **Edge Function — `roast-resume`**: Parses PDF text, sends to Lovable AI with tone-specific system prompt, streams back roast + fix suggestions
- **Edge Function — `chat` (Stripe webhook)**: Handles Pro subscription payments

### AI Integration
- Uses Lovable AI gateway with a crafted system prompt per tone (brutal/balanced/gentle)
- Streams response for engaging UX
- Returns structured roast + fix suggestions via tool calling

### Payments
- Stripe integration for Pro subscription ($9/mo or similar)
- Free tier rate-limited to 1 roast/day

### Design Vibe
- Dark theme with neon/fire accents (🔥 energy)
- Playful typography, animated transitions
- Mobile-responsive throughout

