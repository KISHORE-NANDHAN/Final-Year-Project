import spacy
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk

nltk.download('punkt')
nltk.download('stopwords')

nlp = spacy.load("en_core_web_sm")

def analyze_text(text):
    doc = nlp(text)

    word_count = len(word_tokenize(text))
    sentence_count = len(list(doc.sents))
    stop_words = set(stopwords.words("english"))

    meaningful_words = [
        word.text for word in doc
        if word.text.lower() not in stop_words and word.is_alpha
    ]

    grammar_score = 80 if sentence_count > 0 else 40

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "meaningful_words": len(meaningful_words),
        "grammar_score": grammar_score
    }
