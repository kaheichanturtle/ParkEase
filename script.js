const GEMINI_PROMPT = `
    Analyze this parking sign image and return ONLY the maximum allowed parking duration in this URL format: 
    timerplus://app/quick-timers/new?hours=[hours]&minutes=[minutes]&seconds=[seconds]. 
    For example, if the sign shows "2P", return: timerplus://app/quick-timers/new?hours=2&minutes=0&seconds=0
`;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const status = document.getElementById('status');

let videoStream = null;

async function initCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = videoStream;
    } catch (err) {
        status.textContent = 'Error accessing camera: ' + err.message;
        status.style.display = 'block';
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    capturedImage.src = canvas.toDataURL('image/jpeg');
    video.style.display = 'none';
    capturedImage.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'block';
    
    stopCamera();
    analyzeImage(capturedImage.src);
});

retakeBtn.addEventListener('click', () => {
    video.style.display = 'block';
    capturedImage.style.display = 'none';
    captureBtn.style.display = 'block';
    retakeBtn.style.display = 'none';
    resultBox.style.display = 'none';
    
    initCamera();
});

async function analyzeImage(imageData) {
    status.textContent = 'Analyzing image...';
    status.style.display = 'block';
    
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: GEMINI_PROMPT
                    }, {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageData.split(',')[1]
                        }
                    }]
                }]
            })
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.message || 'API Error');
        }

        const text = result.candidates[0].content.parts[0].text;
        if (!text) {
            throw new Error('No text in API response');
        }

        document.getElementById('originalText').textContent = text;
        document.getElementById('resultBox').style.display = 'block';

        if (text.startsWith("timerplus://")) {
            window.location.href = text;
        }

    } catch (error) {
        status.textContent = 'Error analyzing image: ' + error.message;
        status.style.display = 'block';
    }
}

initCamera();
