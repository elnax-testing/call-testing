# Coolify Deployment

This repo can run in Coolify with the included `Dockerfile`.

## 1. Create the app

1. Push this branch to GitHub.
2. In Coolify, create a new application from that repo.
3. Choose the `Dockerfile` build type.

## 2. Add env vars

Set these environment variables in Coolify:

```env
GOOGLE_API_KEY=...
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
SIP_TRUNK_ID=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

If Coolify gives you a `PORT` value, that works too. This app will use `PORT` or `UI_PORT` for the dashboard.

## 3. Expose the web port

Set the public web port to `8000`.

## 4. Deploy

Coolify will build the image and run:

```bash
python start_stack.py
```

## 5. What to expect

- Dashboard on port `8000`
- Agent worker on port `8081`
- Automation worker in the same container

## 6. Notes

- The old WhatsApp and knowledge-base services are not part of this branch.
- If you want dashboard data, Supabase must be set up too.
