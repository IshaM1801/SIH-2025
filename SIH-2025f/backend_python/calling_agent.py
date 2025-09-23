from flask import Flask, request, Response
from twilio.twiml.voice_response import VoiceResponse, Record
from twilio.rest import Client
import os
import requests
import whisper
import openai

app = Flask(__name__)

# Base public URL for Twilio to call back (e.g., your ngrok domain)
# Example: https://abcd-12-34-56-78.ngrok-free.app
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "")

# Configure OpenAI (optional). If not set, we will skip AI response.
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")
if openai_api_key:
    openai.api_key = openai_api_key

# Temp folder to save audio files
TEMP_FOLDER = "./temp_audio"
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Lazy-load Whisper model to avoid startup failures on low-memory or cold start
whisper_model = None

# Twilio REST client (for outbound calls)
twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_from_number = os.getenv("TWILIO_FROM_NUMBER")  # E.164, e.g. +1415xxxxxxx
twilio_client = None
if twilio_account_sid and twilio_auth_token:
    try:
        twilio_client = Client(twilio_account_sid, twilio_auth_token)
    except Exception as e:
        print("Failed to init Twilio client:", str(e))
@app.route("/health", methods=["GET"]) 
def health():
    return {"status": "ok"}, 200

def generate_ai_response(user_text: str) -> str:
    """Generate a short, helpful reply in the same language using Gemini (if configured), else OpenAI, else fallback."""
    text = user_text.strip()
    if not text:
        return "Unable to detect speech."

    if gemini_api_key:
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    f"The user reported a civic issue: {text}\n"
                                    "Respond briefly and helpfully in the same language, acknowledging receipt."
                                )
                            }
                        ]
                    }
                ]
            }
            params = {"key": gemini_api_key}
            resp = requests.post(url, headers=headers, params=params, json=payload, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            # Parse Gemini response
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"].strip()
            # Fallback if structure unexpected
            return "आपकी शिकायत दर्ज हो गई है। हमारी टीम शीघ्र संपर्क करेगी।"
        except Exception as e:
            print("Gemini API error:", str(e))
            return "आपकी शिकायत दर्ज हो गई है। हमारी टीम शीघ्र संपर्क करेगी।"

    if openai_api_key:
        try:
            completion = openai.Completion.create(
                model="gpt-3.5-turbo-instruct",
                prompt=(
                    f"The user reported a civic issue: {text}\n"
                    "Respond briefly and helpfully in the same language, acknowledging receipt."
                ),
                temperature=0.6,
                max_tokens=120,
            )
            return completion.choices[0].text.strip()
        except Exception as api_err:
            print("OpenAI completion error:", str(api_err))
            return "आपकी शिकायत दर्ज हो गई है। हमारी टीम शीघ्र संपर्क करेगी।"

    return "आपकी शिकायत दर्ज हो गई है। हमारी टीम शीघ्र संपर्क करेगी।"



@app.route("/voice", methods=["POST"])
def voice():
    """
    Incoming call webhook. Prompts for civic issue via speech first.
    Falls back to recording if no speech detected.
    """
    response = VoiceResponse()

    # Prompt in Hindi
    response.say(
        "नमस्ते! यह आपका नागरिक समस्या एजेंट है। कृपया अपनी समस्या बताइए।",
        voice="alice",
        language="hi-IN"
    )

    # Absolute URLs for Twilio callbacks
    speech_action = "/process_speech"
    record_action = "/process_recording"
    if PUBLIC_BASE_URL:
        base = PUBLIC_BASE_URL.rstrip('/')
        speech_action = f"{base}/process_speech"
        record_action = f"{base}/process_recording"

    # Try speech recognition first
    gather = response.gather(
        input="speech",
        action=speech_action,
        method="POST",
        language="hi-IN",
        speech_timeout="auto"
    )
    gather.say(
        "कृपया अब बोलें।",
        voice="alice",
        language="hi-IN"
    )

    # If no input received, Twilio will continue; fallback to recording
    response.say(
        "क्षमा करें, मैं समझ नहीं पाया। कृपया बीप के बाद अपनी शिकायत रिकॉर्ड करें।",
        voice="alice",
        language="hi-IN"
    )
    response.record(
        action=record_action,
        max_length=30,
        play_beep=True,
        timeout=3
    )

    response.say(
        "धन्यवाद! आपकी शिकायत दर्ज कर ली गई है। अलविदा!",
        voice="alice",
        language="hi-IN"
    )

    return Response(str(response), mimetype="text/xml")

@app.route("/outbound_voice", methods=["GET", "POST"])
def outbound_voice():
    """
    TwiML for outbound calls we initiate. Same flow as /voice.
    """
    response = VoiceResponse()

    response.say(
        "नमस्ते! यह आपका नागरिक समस्या एजेंट है। कृपया अपनी समस्या बताइए।",
        voice="alice",
        language="hi-IN"
    )

    speech_action = "/process_speech"
    record_action = "/process_recording"
    if PUBLIC_BASE_URL:
        base = PUBLIC_BASE_URL.rstrip('/')
        speech_action = f"{base}/process_speech"
        record_action = f"{base}/process_recording"

    gather = response.gather(
        input="speech",
        action=speech_action,
        method="POST",
        language="hi-IN",
        speech_timeout="auto"
    )
    gather.say(
        "कृपया अब बोलें।",
        voice="alice",
        language="hi-IN"
    )

    response.say(
        "क्षमा करें, मैं समझ नहीं पाया। कृपया बीप के बाद अपनी शिकायत रिकॉर्ड करें।",
        voice="alice",
        language="hi-IN"
    )
    response.record(
        action=record_action,
        max_length=30,
        play_beep=True,
        timeout=3
    )

    response.say(
        "धन्यवाद! आपकी शिकायत दर्ज कर ली गई है। अलविदा!",
        voice="alice",
        language="hi-IN"
    )

    return Response(str(response), mimetype="text/xml")

@app.route("/call", methods=["POST", "GET"])
def make_outbound_call():
    """Initiate an outbound call to the provided number using Twilio."""
    if not twilio_client or not twilio_from_number:
        return {"error": "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER."}, 400

    to_number = request.values.get("to") or request.json.get("to") if request.is_json else request.values.get("to")
    if not to_number:
        return {"error": "Missing 'to' E.164 phone number."}, 400

    if not PUBLIC_BASE_URL:
        return {"error": "Set PUBLIC_BASE_URL to your public https base (e.g. ngrok)."}, 400

    answer_url = f"{PUBLIC_BASE_URL.rstrip('/')}/outbound_voice"
    try:
        call = twilio_client.calls.create(
            to=to_number,
            from_=twilio_from_number,
            url=answer_url,
            method="POST",
        )
        return {"status": "initiated", "sid": call.sid}
    except Exception as e:
        print("Error initiating outbound call:", str(e))
        return {"error": str(e)}, 500

@app.route("/process_speech", methods=["POST"])
def process_speech():
    """Handles Twilio <Gather input="speech"> results and responds immediately."""
    try:
        speech_text = request.form.get("SpeechResult", "").strip()
        print("SpeechResult:", speech_text)

        if speech_text:
            ai_response = generate_ai_response(speech_text)
        else:
            ai_response = "क्षमा करें, मैं आपकी बात नहीं समझ पाया। कृपया दोबारा बताएं।"
    except Exception as e:
        print("Error in process_speech:", str(e))
        ai_response = "क्षमा करें, एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।"

    vr = VoiceResponse()
    vr.say(ai_response, voice="alice", language="hi-IN")
    vr.say("धन्यवाद! अलविदा!", voice="alice", language="hi-IN")
    return Response(str(vr), mimetype="text/xml")


@app.route("/process_recording", methods=["POST"])
def process_recording():
    """
    Receives recording from Twilio, converts speech to text,
    sends to Gemini, and prints AI response.
    """
    try:
        recording_url = request.form.get("RecordingUrl")
        recording_sid = request.form.get("RecordingSid")
        recording_duration = request.form.get("RecordingDuration")
        print("Recording webhook payload:", {
            "RecordingUrl": recording_url,
            "RecordingSid": recording_sid,
            "RecordingDuration": recording_duration,
        })
        if not recording_url:
            print("Missing RecordingUrl in form payload")
            return "No recording URL received", 400

        # Download recording from Twilio
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        auth = (twilio_sid, twilio_token) if twilio_sid and twilio_token else None

        download_errors = []
        audio_bytes = None
        chosen_ext = None
        for ext in [".mp3", ".wav"]:
            media_url = recording_url + ext
            try:
                print(f"Downloading recording: {media_url}")
                resp = requests.get(media_url, auth=auth, timeout=20)
                if resp.status_code == 200 and resp.content:
                    audio_bytes = resp.content
                    chosen_ext = ext
                    print(f"Downloaded {len(audio_bytes)} bytes as {ext}")
                    break
                else:
                    err = f"HTTP {resp.status_code}, length={len(resp.content) if resp.content else 0}"
                    print(f"Download failed: {err}")
                    download_errors.append((ext, err))
            except Exception as dl_err:
                print(f"Error downloading {ext}:", str(dl_err))
                download_errors.append((ext, str(dl_err)))

        if audio_bytes is None:
            print("Failed to download recording. Tried:", download_errors)
            ai_response = "रिकॉर्डिंग डाउनलोड करने में समस्या आई। कृपया दोबारा कॉल करें।"
        else:
            temp_audio_path = os.path.join(TEMP_FOLDER, f"caller{chosen_ext}")
            with open(temp_audio_path, "wb") as f:
                f.write(audio_bytes)

            # --- Speech-to-Text using Whisper ---
            try:
                global whisper_model
                if whisper_model is None:
                    whisper_model = whisper.load_model("base")
                result = whisper_model.transcribe(temp_audio_path)
                user_text = result.get("text", "")
                print(f"Caller said: {user_text}")
            except Exception as stt_err:
                print("Whisper STT error (check ffmpeg installation):", str(stt_err))
                user_text = ""

            # --- Send text to AI or fallback ---
            if user_text.strip():
                ai_response = generate_ai_response(user_text)
                print(f"AI response: {ai_response}")
            else:
                ai_response = "Unable to detect speech."

    except Exception as e:
        print("Error processing recording:", str(e))
        ai_response = "Sorry, there was an error processing your recording."

    # --- Twilio response ---
    response = VoiceResponse()
    response.say(
        ai_response,
        voice="alice",
        language="hi-IN"
    )
    response.say(
        "धन्यवाद! अलविदा!",
        voice="alice",
        language="hi-IN"
    )
    return Response(str(response), mimetype="text/xml")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004)