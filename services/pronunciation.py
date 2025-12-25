import jiwer

def analyze_pronunciation(transcript, reference_text):
    if not transcript or not reference_text:
        return 0.0

    # Normalize text (remove punctuation, lowercase)
    ref_norm = reference_text.lower().replace(".", "").strip()
    hyp_norm = transcript.lower().replace(".", "").strip()

    try:
        # Calculate Word Error Rate
        wer = jiwer.wer(ref_norm, hyp_norm)
        
        # Convert to Accuracy Score (0 to 100)
        # 1.0 WER means 0% accuracy. 0.0 WER means 100% accuracy.
        accuracy = max(0, 1 - wer) * 100
        
        return round(accuracy, 2)
    except:
        return 0.0