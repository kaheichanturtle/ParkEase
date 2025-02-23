const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const status = document.getElementById('status');
const warningTimeEl = document.getElementById('warningTime');
const silentAudio = document.getElementById("silentAudio");
const alarmAudio = document.getElementById("alarmAudio");
const resultBox = document.getElementById('resultBox');
const originalText = document.getElementById('originalText');
const signSelection = document.getElementById('signSelection');
const leftSignBtn = document.getElementById('leftSignBtn');
const rightSignBtn = document.getElementById('rightSignBtn');

let videoStream = null;
let timerIntervals = [];

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

  silentAudio.play();
  alarmAudio.play();
});

retakeBtn.addEventListener('click', () => {
  timerIntervals.forEach(interval => clearInterval(interval));
  timerIntervals = [];
  
  video.style.display = 'block';
  capturedImage.style.display = 'none';
  captureBtn.style.display = 'block';
  retakeBtn.style.display = 'none';
  resultBox.style.display = 'none';
  signSelection.style.display = 'none';
  warningTimeEl.textContent = '00:00:00';

  alarmAudio.pause();
  alarmAudio.currentTime = 0;

  initCamera();
});

function startTimers(totalMinutes) {
  const warningMinutes = totalMinutes - 15;
  const now = Date.now();
  const warningEnd = now + warningMinutes * 60 * 1000;

  function updateTimers() {
    const current = Date.now();
    
    if (current < warningEnd) {
      warningTimeEl.textContent = new Date(warningEnd - current).toISOString().substr(11, 8);
    } else {
      warningTimeEl.textContent = '00:00:00';
    }
  }
  
  timerIntervals.push(setInterval(updateTimers, 1000));
  updateTimers();
}

initCamera();
