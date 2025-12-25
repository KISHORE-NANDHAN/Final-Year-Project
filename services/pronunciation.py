from pyAudioAnalysis import audioBasicIO
from pyAudioAnalysis import ShortTermFeatures
import numpy as np
import tempfile

def analyze_pronunciation(audio_file):
    temp = tempfile.NamedTemporaryFile(delete=False)
    audio_file.save(temp.name)

    [fs, x] = audioBasicIO.read_audio_file(temp.name)
    x = audioBasicIO.stereo_to_mono(x)

    features, _ = ShortTermFeatures.feature_extraction(
        x, fs, 0.05 * fs, 0.025 * fs
    )

    energy = np.mean(features[1])
    pronunciation_score = min(100, max(50, energy * 100))

    return round(pronunciation_score, 2)
