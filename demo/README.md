# Rafeeq phone demo

A working slice of Rafeeq: point a camera at a child doing a routine, and Rafeeq checks each step with a **vision AI model** and coaches out loud in **Kuwaiti Arabic**.

**Runs 100% free by default** on a local model through [Ollama](https://ollama.com). No API key, no bill.

## What it does
- Pick a routine: brushing teeth, washing hands or packing the school bag
- Every 3 seconds the app sends one camera frame to your own computer
- The model judges the current step (done / in progress / off task / not visible) and writes a short Kuwaiti-Arabic coaching line
- The phone speaks the line, ticks off finished steps and celebrates
- **Hint level** shows fading help: full guidance, light hints, or silent unless stuck
- A simple parent report appears at the end

## Run it (free, local)
1. Install [Node.js 18+](https://nodejs.org) and [Ollama](https://ollama.com/download)
2. Download a vision model (one time, about 3 GB):
   ```bash
   ollama pull gemma3:4b
   ```
3. Start the demo:
   ```bash
   cd demo
   npm install
   npm start
   ```
4. Open **http://localhost:3000**, pick a routine and tap **ابدأ** (Start)

### Other free models
Set `OLLAMA_MODEL` in a `.env` file (see `.env.example`):
| Model | Size | Notes |
|---|---|---|
| `gemma3:4b` (default) | ~3 GB | Good vision + Arabic, runs on most laptops |
| `qwen2.5vl:7b` | ~6 GB | Stronger at reading scenes, needs more RAM |
| `gemma3:12b` | ~8 GB | Best quality, needs a strong computer |

Small local models are slower and less accurate than big cloud models. For the competition demo, rehearse the routine a few times so the model sees each step clearly.

### On your phone
Phone browsers only allow the camera on **https**. Use a free tunnel:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
Open the `https://….trycloudflare.com` link on your phone. The model still runs on your computer.

## Optional: Claude Opus 5.5 (paid)
For the highest accuracy, set `PROVIDER=claude` and your own `ANTHROPIC_API_KEY` in `.env`. This costs money per check. Set a spend limit in the Anthropic console first. `.env` is git-ignored, so your key never gets pushed.

## Notes
- The voice uses the device's built-in Arabic text-to-speech, because the lines are written live by the AI. (The website simulation uses a recorded Gulf-Arabic voice, see the main README.) A local Gulf-Arabic TTS model is the next upgrade.
- Frames are processed only while a routine is running, and nothing is saved.
