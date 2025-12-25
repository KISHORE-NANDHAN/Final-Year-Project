from flask import Blueprint, request, jsonify
from services.speech_to_text import convert_speech_to_text
from services.text_analysis import analyze_text
from services.pronunciation import analyze_pronunciation
from services.scoring import generate_score

communication_bp = Blueprint("communication", __name__)

@communication_bp.route("/evaluate", methods=["POST"])
def evaluate_communication():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    # Get the text the user WAS supposed to read (sent from frontend)
    reference_text = request.form.get("reference_text", "") 

    # 1. Speech to Text
    transcript = convert_speech_to_text(audio_file)
    print(f"Transcript: {transcript}") # Debugging

    # 2. Text Analysis (Grammar)
    text_metrics = analyze_text(transcript)

    # 3. Pronunciation (Accuracy vs Reference)
    pronunciation_score = analyze_pronunciation(transcript, reference_text)

    # 4. Final Score
    final_result = generate_score(
        transcript,
        text_metrics,
        pronunciation_score
    )

    return jsonify(final_result)