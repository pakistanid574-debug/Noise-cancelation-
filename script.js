let audioCtx;
let audioBuffer = null;
let sourceNode = null;

const audioFileInput = document.getElementById('audioFile');
const playOriginalBtn = document.getElementById('playOriginal');
const playCleanBtn = document.getElementById('playClean');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('statusText');

audioFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "Status: Loading audio file...";
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        statusText.innerText = "Status: Audio loaded! Ready to play.";
        playOriginalBtn.disabled = false;
        playCleanBtn.disabled = false;
        downloadBtn.disabled = false;
    } catch (err) {
        statusText.innerText = "Status: Error loading audio file!";
        console.error(err);
    }
});

// Play Original Audio
playOriginalBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    stopAudio();
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioCtx.destination);
    sourceNode.start(0);
    statusText.innerText = "Status: Playing Original Audio...";
});

// Play Cleaned Audio (Advanced Multi-Stage Filtering)
playCleanBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    stopAudio();

    const trackSource = audioCtx.createBufferSource();
    trackSource.buffer = audioBuffer;

    // 1. High-Pass Filter: Removes low rumble/hum (< 100 Hz)
    const highPass = audioCtx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 100;

    // 2. Peaking Filter / Notch: Cuts off annoying high frequencies or sharp hiss
    const midCut = audioCtx.createBiquadFilter();
    midCut.type = 'peaking';
    midCut.frequency.value = 2500;
    midCut.gain.value = -6; // Reduce sharp frequencies
    midCut.Q.value = 1;

    // 3. Low-Pass Filter: Removes high static hiss (> 6500 Hz)
    const lowPass = audioCtx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 6500;

    // 4. Dynamics Compressor: Boosts voice clarity and suppresses low volume background sounds
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24; // Start compressing earlier
    compressor.knee.value = 30;
    compressor.ratio.value = 12;     // High compression for voice isolation
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Connect nodes in a chain
    trackSource.connect(highPass);
    highPass.connect(midCut);
    midCut.connect(lowPass);
    lowPass.connect(compressor);
    compressor.connect(audioCtx.destination);

    trackSource.start(0);
    sourceNode = trackSource;
    statusText.innerText = "Status: Playing Cleaned Audio (Advanced Noise Gate & Filter)...";
});

function stopAudio() {
    if (sourceNode && sourceNode.stop) {
        try { sourceNode.stop(); } catch(e) {}
    }
}
