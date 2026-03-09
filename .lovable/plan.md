

## Open-Source Backend Stack for Rezoome

### Important Constraint

Lovable runs **frontend-only** (React/Vite). It cannot run Node.js, Python, or any backend server directly. Your two options are:

1. **Use Supabase (via Lovable Cloud)** — Edge Functions (Deno) can call Gemini API directly. This is the easiest path within Lovable.
2. **Self-host a backend separately** — Deploy your own backend elsewhere and call it from the Lovable frontend via API.

### Recommended Open-Source Stack

| Layer | Tool | Why |
|-------|------|-----|
| **LLM** | Google Gemini API (free tier: `gemini-2.0-flash`) | Free 15 RPM, generous limits, great for MVP |
| **PDF Parsing** | `pdf-parse` (npm) or Gemini's native PDF input | Extract text from uploaded resumes |
| **Auth** | Supabase Auth (free tier) | Email/password, OAuth, magic links — all free |
| **Database** | Supabase PostgreSQL (free tier) | Store roasts, users, subscriptions |
| **Storage** | Supabase Storage (free tier, 1GB) | Store uploaded PDFs |
| **Payments** | LemonSqueezy or Stripe | LemonSqueezy is simpler for indie SaaS (handles tax) |
| **Backend Functions** | Supabase Edge Functions (Deno) | Call Gemini API, process PDFs, enforce limits |

### How It Works in Lovable

```text
[User uploads PDF] 
    → Frontend sends file to Supabase Storage
    → Calls Edge Function "roast-resume"
        → Edge Function reads PDF from Storage
        → Sends text to Gemini API (google/gemini-2.0-flash)
        → Returns roast + fix suggestions
    → Frontend streams/displays result
```

### Gemini API Integration

- **API**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Free tier**: 15 requests/minute, 1M tokens/day — enough for MVP
- **Get API key**: https://aistudio.google.com/apikeys
- **Store key**: As a Supabase secret (`GEMINI_API_KEY`), accessed in Edge Functions

### What to Build

1. **Enable Supabase** in Lovable (for auth, database, storage, and edge functions — all free tier)
2. **Store Gemini API key** as a Supabase secret
3. **Create Edge Function** `roast-resume` that calls Gemini API directly
4. **Create DB tables**: `profiles`, `roasts`, `user_roles`
5. **Add auth pages** (login/signup)
6. **Wire up Upload page** to actually call the edge function
7. **Add LemonSqueezy/Stripe** for $5/mo Pro tier

### Cost Estimate (MVP)

| Service | Cost |
|---------|------|
| Supabase (free tier) | $0 |
| Gemini API (free tier) | $0 |
| LemonSqueezy | 5% + $0.50 per transaction |
| **Total to launch** | **$0** |

### Next Step

To proceed, we need to enable Supabase (Lovable Cloud) — this gives us the free auth, database, storage, and edge functions to host the Gemini API calls. You'll also need a Gemini API key from Google AI Studio.

Shall I proceed with enabling Supabase and setting this up?

