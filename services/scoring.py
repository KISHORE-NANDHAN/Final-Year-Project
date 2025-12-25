def generate_score(transcript, text_metrics, pronunciation_score):
    fluency_score = min(100, text_metrics["word_count"] * 2)
    grammar_score = text_metrics["grammar_score"]

    final_score = round(
        (fluency_score * 0.4) +
        (grammar_score * 0.3) +
        (pronunciation_score * 0.3),
        2
    )

    return {
        "transcript": transcript,
        "scores": {
            "fluency": fluency_score,
            "grammar": grammar_score,
            "pronunciation": pronunciation_score,
            "final_score": final_score
        },
        "feedback": generate_feedback(final_score)
    }

def generate_feedback(score):
    if score >= 80:
        return "Excellent communication skills."
    elif score >= 60:
        return "Good, but can improve fluency and clarity."
    else:
        return "Needs improvement in speaking and sentence structure."
