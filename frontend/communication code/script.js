let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let source;
let animationId;
let startTime;
let timerInterval;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const recordingStatus = document.getElementById("recordingStatus");
const resultBox = document.getElementById("result");
const audioInputSelect = document.getElementById("audioSource");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");

// 1. Load Audio Devices on Startup
async function getConnectedDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioInputSelect.innerHTML = '<option value="">Default Microphone</option>';
        
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${audioInputSelect.length + 1}`;
                audioInputSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error opening audio devices.', error);
    }
}
getConnectedDevices();

// 2. Visualizer Function (Draws the Wave)
function visualize(stream) {
    if(!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(243, 244, 246)'; // Match background color
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(255, 77, 77)'; // Red wave color
        canvasCtx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };

    draw();
}

// 3. Start Recording
startBtn.onclick = async () => {
    audioChunks = [];
    const audioSource = audioInputSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Start Visualizer
        visualize(stream);

        // Start Recorder
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        // UI Updates
        recordingStatus.classList.remove("hidden");
        stopBtn.classList.remove("hidden");
        startBtn.classList.add("hidden");
        resultBox.classList.add("hidden");

        // Start Timer
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const seconds = Math.floor((elapsedTime / 1000) % 60);
            const minutes = Math.floor((elapsedTime / 1000 / 60));
            timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

    } catch (err) {
        alert("Error accessing microphone: " + err.message);
    }
};

// 4. Stop Recording & Send
stopBtn.onclick = async () => {
    mediaRecorder.stop();
    
    // Stop Visualizer & Timer
    cancelAnimationFrame(animationId);
    clearInterval(timerInterval);
    if(source) { source.disconnect(); }
    
    // UI Updates
    recordingStatus.classList.add("hidden");
    stopBtn.classList.add("hidden");
    startBtn.classList.remove("hidden");
    startBtn.innerText = "🔁 Record Again";

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        
        formData.append("audio", audioBlob, "response.wav");
        
        // Get text to compare
        const referenceText = document.getElementById("referenceText").innerText;
        formData.append("reference_text", referenceText);

        resultBox.classList.remove("hidden");
        resultBox.innerHTML = "<h3>⏳ Analyzing your speech...</h3>";

        try {
            const response = await fetch("http://127.0.0.1:5000/api/communication/evaluate", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();

            // Render Final Report
            resultBox.innerHTML = `
                <div style="border-left: 5px solid #ff4d4d; padding-left: 15px;">
                    <p><strong>🗣️ You said:</strong> "${data.transcript}"</p>
                    <p><strong>✅ Accuracy:</strong> ${data.scores.pronunciation}%</p>
                    <p><strong>📖 Grammar:</strong> ${data.scores.grammar}/100</p>
                    <p><strong>💡 Feedback:</strong> ${data.feedback}</p>
                </div>
            `;
        } catch (err) {
            resultBox.innerHTML = "<p style='color:red'>❌ Error connecting to server. Is Flask running?</p>";
        }
    };
};