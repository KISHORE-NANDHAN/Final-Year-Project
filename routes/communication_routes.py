from flask import Blueprint, request, jsonify
from services.speech_to_text import convert_speech_to_text
from services.text_analysis import analyze_text
from services.pronunciation import analyze_pronunciation
from services.scoring import generate_score

communication_bp = Blueprint("communication", __name__)

@communication_bp.route("/evaluate", methods=["POST"])
def evaluate_communication():
    audio_file = request.files.get("audio")

    if not audio_file:
        return jsonify({"error": "Audio file missing"}), 400

    # 1. Speech to Text
    transcript = convert_speech_to_text(audio_file)

    # 2. NLP Text Analysis
    text_metrics = analyze_text(transcript)

    # 3. Pronunciation Analysis
    pronunciation_score = analyze_pronunciation(audio_file)

    # 4. Final Score
    final_result = generate_score(
        transcript,
        text_metrics,
        pronunciation_score
    )

    return jsonify(final_result)
