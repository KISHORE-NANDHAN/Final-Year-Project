import speech_recognition as sr
from pydub import AudioSegment
import io
import os

# --- ADD THESE LINES ---
# Explicitly set the path to the ffmpeg executable in your project folder
AudioSegment.converter = os.path.join(os.getcwd(), "ffmpeg.exe")
AudioSegment.ffprobe = os.path.join(os.getcwd(), "ffprobe.exe")
# -----------------------

def convert_speech_to_text(audio_file):
    recognizer = sr.Recognizer()

    try:
        # 1. Convert WebM/Browser Audio to WAV compatible with SpeechRecognition
        # We read the file into memory and convert it
        audio_file.seek(0)  # Reset file pointer
        audio_segment = AudioSegment.from_file(audio_file)
        
        # Export to a wav file in memory (buffer)
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)

        # 2. Process with SpeechRecognition
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
        
        # 3. Transcribe
        text = recognizer.recognize_google(audio_data)
        return text

    except sr.UnknownValueError:
        return ""
    except sr.RequestError:
        return "API Unavailable"
    except Exception as e:
        print(f"Error in STT: {e}")
        return ""