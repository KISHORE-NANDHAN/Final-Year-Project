
  let mediaRecorder;
  let audioChunks = [];

  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const recordingStatus = document.getElementById("recordingStatus");
  const resultBox = document.getElementById("result");

  // 1. Start Recording
  startBtn.onclick = async () => {
    audioChunks = []; // Reset chunks

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.start();

      // UI Updates
      recordingStatus.classList.remove("hidden");
      stopBtn.classList.remove("hidden");
      startBtn.disabled = true;
      startBtn.style.backgroundColor = "#ccc"; // Visual feedback
      resultBox.classList.add("hidden");

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

    } catch (err) {
      alert("Microphone access denied or not available!");
      console.error(err);
    }
  };

  // 2. Stop Recording & Send to AI
  stopBtn.onclick = async () => {
    mediaRecorder.stop();
    
    // UI Updates
    recordingStatus.classList.add("hidden");
    stopBtn.classList.add("hidden");
    startBtn.disabled = false;
    startBtn.style.backgroundColor = "#ff4d4d"; // Reset color

    mediaRecorder.onstop = async () => {
      // Create Blob (Note: Browsers often record as WebM, but backend converts it)
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audio", audioBlob, "response.wav");

      // --- CRITICAL MODIFICATION HERE ---
      // We grab the text from the <p> tag inside .question
      const questionText = document.querySelector(".question p").innerText;
      formData.append("reference_text", questionText);
      // ----------------------------------

      resultBox.classList.remove("hidden");
      resultBox.innerHTML = "⏳ Evaluating your response... (Checking Grammar & Pronunciation)";

      try {
        // Send to your Flask Backend
        const response = await fetch("http://127.0.0.1:5000/api/communication/evaluate", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Display Detailed Results
        resultBox.innerHTML = `
          <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
            <strong>🗣️ You said:</strong> <span style="color: #333;">"${data.transcript}"</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
             <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
                <strong>🎯 Accuracy:</strong> ${data.scores.pronunciation}%
             </div>
             <div style="background: #e8f5e9; padding: 10px; border-radius: 5px;">
                <strong>📖 Grammar Score:</strong> ${data.scores.grammar}/100
             </div>
          </div>

          <div>
             <strong>📝 Feedback:</strong><br>
             ${data.feedback}
          </div>
        `;
      } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<span style="color: red;">❌ Error: Could not connect to AI server. Check if Flask is running.</span>`;
      }
    };
  };