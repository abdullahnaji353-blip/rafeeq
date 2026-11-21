# Rafeeq (رفيق)
**An Arabic Gen-AI companion for life-skills independence in children with autism and Down syndrome**

ATSN26 Gen-AI & Software Innovation Competition entry.
Primary track: Cognitive & Learning. Secondary track: Multiple disabilities & Arabic AI.

---

## Try it online
🦉 **[Try the live simulation](https://abdullahnaji353-blip.github.io/rafeeq/)**: act like the child (do a step, get stuck, get distracted, or feel overwhelmed) and watch how Rafeeq responds, calms, and fades its help over the weeks. Rafeeq speaks with a natural recorded Kuwaiti/Gulf-Arabic voice (46 lines, generated with ElevenLabs, stored in [`docs/voice/`](docs/voice)). Runs in any browser, nothing to install.

## Prototype video
▶️ **[Watch the 1-minute Rafeeq story](docs/rafeeq-prototype-video.mp4)**: Yousef, a 7-year-old autistic boy, gets overwhelmed during his morning routine. Rafeeq spots the early signs, calms him with breathing in Gulf Arabic, then coaches him through the rest of the routine on his own.

## The problem
Children with autism, Down syndrome and ADHD often struggle with everyday living skills such as brushing teeth, getting dressed and following a morning routine. Families rely on picture charts, generic apps or a parent standing beside the child at every step. These tools can't see what the child is doing, can't adapt in the moment, and rarely speak Gulf Arabic.

## The idea
Rafeeq is a small, owl-shaped AI robot that sits where routines happen. It watches the child's progress through a camera and coaches them step by step in Kuwaiti Arabic. Over time it gives less and less help, so the child needs it less.

**The goal of Rafeeq is to make itself unnecessary.**

## Features
- **Routine coaching:** step-by-step help with hygiene, dressing, eating and getting ready for school
- **Calm mode:** spots early signs of stress and switches to a soft voice, a breathing game or a favorite song
- **Fading hints:** less help every week as the child improves
- **Parent reports:** weekly summaries in Arabic, for example "Completed the morning routine alone 4 of 5 days"
- **Arabic-first:** Gulf-dialect speech in and out

## How the AI works
Everything runs **on the device, offline**, using **Gemma 3 (4B)**, Google's open vision-language model, served locally with **[Ollama](https://ollama.com)**. No cloud and no API costs.

| Step | Technology |
|---|---|
| See the task | Gemma 3 4B (vision) via Ollama checks each camera frame: step done, in progress, stuck, or off task |
| Plan and coach | Gemma 3 writes short, personalized prompts in Kuwaiti Arabic, matched to the child's hint level |
| Listen | Whisper, running locally |
| Speak | Local Arabic text-to-speech |
| Calm mode | Lightweight on-device stress classifier (voice and movement) |
| Independence | Prompt-fading algorithm: full guidance, then lighter hints, then silence |

**Privacy:** the AI runs inside Rafeeq, so video never leaves the home. Frames are analyzed, then deleted. Parents control all routines and data.

## Planned hardware
Raspberry Pi 5 hub in the base (runs Ollama + Gemma 3, Whisper and the voice), ESP32-S3 camera board, 2 servos (head turn and tilt), speaker and mic, LED eyes, 3D-printed owl body.

## Status
Idea stage. Coming next:
- [x] Phone demo: the camera sees a routine step and Rafeeq responds in Kuwaiti Arabic ([`demo/`](demo), runs free on a local Ollama model)
- [x] Prototype video: animated story of Rafeeq coaching a child through a routine and a sensory overload, with an English narrator and Gulf Arabic voice ([watch](docs/rafeeq-prototype-video.mp4))
- [x] Interactive simulation website ([live](https://abdullahnaji353-blip.github.io/rafeeq/), source in [`docs/`](docs))
- [ ] Pitch deck (Dec 7) and live pitch (Dec 13–14)

## Team
[Your name / team members]
