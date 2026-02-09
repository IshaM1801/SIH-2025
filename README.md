## FixMyCity – SIH 2025

An AI‑powered civic issue management platform that helps citizens report problems quickly and helps city officials act faster and more transparently.

FixMyCity combines computer vision, voice + WhatsApp automation, a smart department classifier, and a citizen chatbot to create a unified pipeline from **issue detection** → **triage** → **resolution** → **citizen acknowledgement**.

---

## 1. Problem & Solution Overview

- **Problem**: Civic issues like potholes, broken streetlights, water leakage, overflowing garbage, etc. are often:
  - Reported late (or not at all),
  - Sent to the wrong department,
  - Poorly tracked, with no feedback to citizens.

- **Solution**: FixMyCity provides:
  - **Multi‑channel reporting**: automated AI detection, SOS hardware buttons, voice calls, chatbot, and certificates over WhatsApp.
  - **AI‑based triage**: classifies issues into the right civic department using CNN models and LLMs.
  - **Central backend**: unified APIs that aggregate all issues on a live map/dashboard.
  - **Citizen feedback**: auto‑generated resolution certificates shared digitally.

---

## 2. High‑Level Architecture

The project is organized as several focused micro‑services:

- **`backend_python/`** – Flask backend for:
  - Receiving **SOS alerts** from physical boxes / simulators.
  - Receiving **AI‑detected issues** (e.g. pothole detection).
  - Storing issues in memory and exposing them via APIs for the frontend/map.
  - Managing **vehicle live locations** (for field teams / response vehicles).

- **`agentic-chatbot-user/`** – FastAPI + Gemini based **citizen service chatbot** for Mumbai:
  - Answers questions about local civic services.
  - Uses a structured `citizen_services_geo.json` lookup.
  - Falls back to an LLM (Gemini) when data is not in the JSON.

- **`ml-dept-classifier/`** – Civic **department classifier**:
  - CNN‑based PyTorch model (`models/best_model.pth`) to classify issue images into:
    - `roads`, `sanitation`, `electricity`, `water`, `other`.
  - FastAPI service (`app.py`) for programmatic classification.
  - Streamlit UI (`src/streamlit_app.py`) to upload images and view predictions.

- **`user-certificate/`** – **Issue resolution certificate generator**:
  - Generates personalised certificates using `Pillow` on a PNG template.
  - Prepares links for WhatsApp delivery via Twilio (utility code provided).

- **`backend_python/calling_agent.py`** – **Twilio Voice + Whisper + Gemini** agent:
  - Citizens can call a number and verbally describe issues.
  - Audio is recorded by Twilio, transcribed via Whisper, and summarized/replied via Gemini/OpenAI.

- **Root Node package (`package.json`)**:
  - Provides supporting Node utilities (WebSocket, Twilio, Google GenAI integrations, i18n, etc.).
  - Can be used by a frontend or gateway service if needed.

---

## 3. Key Features

- **AI‑powered detection**
  - YOLOv8 based pothole detection training script (`backend_python/train_model.py`).
  - Designed to be extended to other visual civic issues.

- **SOS hardware integration**
  - `/report_sos_issue` endpoint ingests alerts from physical SOS buttons or simulators.
  - Issues are stored and served to a dashboard via `/get_sos_alerts` and `/get_issues`.

- **Voice‑based citizen assistant**
  - Twilio Voice webhook (`/voice`, `/outbound_voice`) handles Hindi speech.
  - Whisper converts speech → text; Gemini/OpenAI generates empathetic responses.

- **Department classifier for routing**
  - Given an image URL, the classifier predicts the responsible department.
  - Used to route issues to `roads`, `sanitation`, `electricity`, `water`, or `other`.

- **Citizen services chatbot**
  - FastAPI + Gemini chatbot with CORS enabled for local and hosted frontends.
  - Uses `citizen_services_geo.json` for department + location lookups.

- **Digital resolution certificates**
  - High‑quality PNG certificates generated from templates + TrueType fonts.
  - Designed to be sent over WhatsApp via Twilio using public URLs (e.g. ngrok).

---

## 4. Tech Stack

- **Languages**: Python, JavaScript/TypeScript
- **Frameworks & Libraries**:
  - Backend: FastAPI, Flask, Flask‑CORS
  - ML / CV: PyTorch, torchvision, ultralytics YOLOv8, scikit‑learn
  - UI: Streamlit, (Node package prepared for frontend integrations)
  - AI: LangChain, Gemini (`langchain-google-genai`), Whisper, OpenAI
  - Messaging/Telephony: Twilio (Voice + WhatsApp)
  - Others: `requests`, `pandas`, `Pillow`, `python-dotenv`, `ws`

---

## 5. Project Structure (Important Folders)

From `FixMyCity-SIH-2025/SIH-2025f`:

- **`agentic-chatbot-user/`**
  - `main.py` – FastAPI chatbot service.
  - `citizen_services_geo.json` – department/location data.
  - `requirements.txt` – dependencies for this service.

- **`backend_python/`**
  - `app.py` – core SOS + AI issue + vehicle location Flask API.
  - `calling_agent.py` – Twilio voice bot + Whisper + Gemini/OpenAI.
  - `train_model.py` – YOLOv8 training script for pothole detection.
  - `yolov8n.pt` – base YOLOv8 model (lightweight).
  - `requirements.txt` – dependencies for backend services.

- **`ml-dept-classifier/`**
  - `app.py` – FastAPI model inference service.
  - `models/best_model.pth` – trained CNN weights.
  - `src/model.py`, `src/inference.py`, `src/train.py` – model definition and training pipeline.
  - `src/streamlit_app.py` – Streamlit frontend.

- **`user-certificate/`**
  - `templates/certificate_template.png` – base certificate design.
  - `fonts/` – custom fonts (`Alice-Regular.ttf`, `ARIAL.TTF`, `Skrine.otf`).
  - `utils/certificate_generator.py` – certificate rendering logic.
  - `utils/whatsapp_sender.py` – Twilio WhatsApp sender (currently commented/sample code).
  - `main.py` – orchestrates certificate generation and WhatsApp sending.

- **Root files**
  - `requirements.txt` – consolidated Python dependencies (ML + Streamlit + Twilio + Flask, etc.).
  - `package.json` – Node dependencies (Google GenAI, Twilio, WebSocket, i18n, etc.).

---

## 6. Setup & Prerequisites

- **Python**: 3.9+ recommended.
- **Node.js**: 18+ (if you plan to use Node utilities / frontend).
- **pip / venv**: for managing Python dependencies.
- **ffmpeg**: required for Whisper (speech‑to‑text) used in `calling_agent.py`.
- **Twilio account**: for Voice and WhatsApp flows.
- **Google Gemini / OpenAI API keys**: for LLM‑based responses.

> The services are intentionally decoupled. You can run only the parts you need (for example, just the chatbot + department classifier) or run everything for a full demo.

---

## 7. Running the Services

All commands assume you are in:

```bash
cd FixMyCity-SIH-2025/SIH-2025f
```

It is recommended to create **separate virtual environments** per service to keep dependencies clean.

### 7.1 Citizen Services Chatbot (`agentic-chatbot-user`)

**Environment variables**

Create a `.env` file in `agentic-chatbot-user/` with:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

**Install & run**

```bash
cd agentic-chatbot-user
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service exposes:

- `POST /chat` – body: `{ "query": "your question" }` → `{ "reply": "answer" }`

### 7.2 SOS + AI Issues + Vehicle Backend (`backend_python/app.py`)

**Environment variables**

Some endpoints do not require special env variables, but Twilio‑related features (in `calling_agent.py`) will.

**Install & run**

```bash
cd backend_python
python -m venv .venv
.venv\Scripts\activate  # or source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

This starts the Flask app on `http://0.0.0.0:5003` (see `app.py`).

**Key endpoints (`app.py`)**

- `POST /report_sos_issue` – receive SOS alerts from hardware/simulators.
- `GET  /get_sos_alerts` – list active SOS alerts.
- `POST /report_issue` – ingest AI‑detected issues (e.g. from CV models).
- `GET  /get_issues` – list all issues.
- `POST /resolve_issue` – mark an issue as resolved and remove it.
- `POST /update_location` – update a vehicle’s lat/lon.
- `GET  /get_locations` – fetch current vehicle locations.

### 7.3 Voice Agent with Twilio & Whisper (`backend_python/calling_agent.py`)

**Environment variables (.env or system)**

Set at least:

```env
PUBLIC_BASE_URL=https://your-ngrok-or-public-domain
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1XXXXXXXXXX  # Twilio phone number in E.164 format
GEMINI_API_KEY=...               # recommended
OPENAI_API_KEY=...               # optional fallback
```

**Install & run**

Use the same virtual environment created in `backend_python` or a fresh one:

```bash
cd backend_python
python calling_agent.py
```

This starts a Flask app on `http://0.0.0.0:5004`.

Configure your Twilio Voice webhook to:

- Incoming calls → `POST {PUBLIC_BASE_URL}/voice`

### 7.4 Department Classifier (`ml-dept-classifier`)

**Install & run FastAPI service**

```bash
cd ml-dept-classifier
python -m venv .venv
.venv\Scripts\activate  # or source .venv/bin/activate

pip install -r ../requirements.txt  # uses shared requirements
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Run Streamlit UI**

In another terminal (with the same venv activated):

```bash
cd ml-dept-classifier
streamlit run src/streamlit_app.py
```

The FastAPI app (`app.py`) exposes:

- `GET  /` – health/info message.
- `POST /predict_url` – `{ "image_url": "https://..." }` → prediction JSON.

The Streamlit app (`src/streamlit_app.py`) lets you upload an image and view the predicted department + confidence.

### 7.5 Certificate Generator (`user-certificate`)

**Environment variables**

For full WhatsApp integration (when you enable the Twilio sender utility), you need:

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+1XXXXXXXXXX
```

The current `utils/whatsapp_sender.py` is provided as a template and is commented out. You can adapt and enable it as needed.

**Install & run**

```bash
cd user-certificate
python -m venv .venv
.venv\Scripts\activate  # or source .venv/bin/activate

pip install -r ../requirements.txt
python main.py
```

`main.py` demonstrates `trigger_certificate_process(...)`, which:

1. Generates a PNG certificate using `certificate_generator.py`.
2. Builds a public URL using a hard‑coded ngrok URL in the script.
3. Sends the link via WhatsApp (when Twilio integration is enabled).

You can import `trigger_certificate_process` into other services (e.g. after an issue is marked resolved in `backend_python/app.py`) to automatically send certificates.

---

## 8. Training & Extending the ML Models

### 8.1 YOLOv8 Pothole Detector

The script `backend_python/train_model.py` shows how to fine‑tune YOLOv8:

- Update `dataset_yaml_path` in the script to point to your custom dataset’s `data.yaml`.
- Run:

```bash
cd backend_python
python train_model.py
```

After training, copy the generated `best.pt` from:

- `training_results/pothole_detector/weights/best.pt`

into the appropriate backend folder and update any inference scripts you add.

### 8.2 Department Classifier

The CNN‑based classifier is defined and trained using:

- `ml-dept-classifier/src/model.py` – model architecture.
- `ml-dept-classifier/src/train.py` – training loop.
- `ml-dept-classifier/src/dataloader.py` – dataset loading helpers.

You can:

1. Prepare a labeled dataset of issue images.
2. Adjust classes and transforms in these files.
3. Retrain and save a new `best_model.pth` in `models/`.

---

## 9. Environment Variables Summary

Depending on which modules you run, you may need some or all of these:

- **LLM / AI**
  - `GOOGLE_API_KEY` – for chatbot (Gemini via LangChain).
  - `GEMINI_API_KEY` – for voice agent’s Gemini calls.
  - `OPENAI_API_KEY` – optional fallback for voice agent.

- **Twilio (Voice & WhatsApp)**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER` – for voice calls.
  - `TWILIO_WHATSAPP_NUMBER` – for WhatsApp messages (when enabled).

- **Public URL**
  - `PUBLIC_BASE_URL` – e.g. ngrok HTTPS URL that Twilio can reach.

Keep secrets in `.env` files and **never commit them to git**.

---

## 10. Suggestions for Demo Flow

A suggested end‑to‑end demo:

1. Start **SOS + AI backend** (`backend_python/app.py`).
2. Start **department classifier** (`ml-dept-classifier/app.py`) and **Streamlit UI**.
3. Start the **citizen chatbot** (`agentic-chatbot-user/main.py`) and connect a simple web UI or test via tools like Postman.
4. (Optional) Start the **voice agent** (`calling_agent.py`) and configure Twilio.
5. (Optional) Start the **certificate generator** and wire it into the issue resolution flow.

This shows:

- Issues coming from multiple channels (SOS button, AI CV module, chatbot, voice).
- Smart routing to departments using ML.
- Visibility into issues via APIs / dashboards.
- Citizens receiving digital proof of resolution.

---

## 11. Notes

- Parts of the system (especially Node utilities and frontend) are intentionally minimal or stubbed and can be further expanded.
- Feel free to adapt port numbers, endpoints, and deployment strategies to your infrastructure.
- Consider containerizing each service (Docker) for easier deployment in production or on cloud platforms.
