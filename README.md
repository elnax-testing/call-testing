# SPX Voice Agent

This is the small, production-focused version of SPX Voice Agent.

It is built around Gemini 3.1 Live and keeps only the parts that still make sense:
- LiveKit voice worker
- FastAPI dashboard
- Appointment calendar
- Call logs and basic automation jobs
- Outbound call dispatch

It does not include the old WhatsApp sidecar or knowledge-base worker.

## What you need

- A Google API key for Gemini 3.1
- LiveKit credentials
- A SIP trunk ID for outbound calls
- Supabase keys if you want logs, appointments, and automations from the database

## Local setup

1. Make a `.env` file from `.env.example`.
2. Fill in these values:
   - `GOOGLE_API_KEY`
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `SIP_TRUNK_ID`
3. Install Python and the packages:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Start it:

```bash
python start_stack.py
```

5. Open the dashboard:

```text
http://127.0.0.1:8000
```

## Coolify setup

1. Push this repo to GitHub.
2. Create a new Coolify application from the repo.
3. Use the included `Dockerfile`.
4. Add the same environment variables from local setup.
5. Set the public web port to `8000`.
6. Deploy.

If Coolify gives you a `PORT` variable, this repo will use it. If not, set `UI_PORT=8000`.

## Gemini 3.1 Live settings

The dashboard is set up for Gemini 3.1 Live voice mode:
- `voice_mode = gemini_live`
- `gemini_live_model = gemini-3.1-flash-native-audio-preview`
- `gemini_live_voice = Puck`
- `gemini_tts_model = gemini-3.1-flash-tts-preview`

You can change these in the Agent Settings page.
