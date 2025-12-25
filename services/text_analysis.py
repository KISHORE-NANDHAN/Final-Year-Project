import language_tool_python

# Initialize tool once to save time (caches the model)
tool = language_tool_python.LanguageTool('en-US')

def analyze_text(text):
    if not text:
        return {"word_count": 0, "grammar_score": 0, "feedback": "No speech detected"}

    # 1. Word Count
    word_count = len(text.split())

    # 2. Real Grammar Check
    matches = tool.check(text)
    error_count = len(matches)

    # 3. Calculate Score
    # Deduct 5 points per error from 100, min score 0
    grammar_score = max(0, 100 - (error_count * 5))

    return {
        "word_count": word_count,
        "grammar_score": grammar_score,
        "error_count": error_count
    }