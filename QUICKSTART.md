# Quick Start

## 1. Put the keys in `.env`

```env
GOOGLE_API_KEY="your-gemini-key"
LIVEKIT_URL="wss://your-livekit-url"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
SIP_TRUNK_ID="your-sip-trunk-id"
```

If you want dashboard data from Supabase, also add:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-service-key"
```

## 2. Install

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Run locally

```bash
python start_stack.py
```

Open:
- `http://127.0.0.1:8000`

## 4. Run on Coolify

1. Add the same env vars in Coolify.
2. Use the repo `Dockerfile`.
3. Set the exposed web port to `8000`.
4. Deploy.
