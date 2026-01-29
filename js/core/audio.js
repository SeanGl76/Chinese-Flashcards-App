
// State for voice selection
let currentVoice = null;
const synth = window.speechSynthesis;

// Initialize Voices (Auto-runs when imported)
function initVoices() {
    const load = () => {
        const voices = synth.getVoices();
        // Prefer a Chinese voice
        currentVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN')) || null;
    };
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = load;
    }
    load();
}
initVoices();

export function speakChinese(text, rate = 0.8) {
    if (!text) return;
    synth.cancel(); // Stop previous
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = rate;
    if (currentVoice) u.voice = currentVoice;
    synth.speak(u);
}

const sfxCorrect = new Audio('correct-answer.mp3');
const sfxWrong = new Audio('wrong-answer.mp3');
const sfxBrush = new Audio('js/core/brush-stroke.mp3');

const clickAudio = new Audio('audio/click.mp3');
const bgmAudio = new Audio('audio/bgm.mp3');

bgmAudio.loop = true;


export function playGameSound(type) {
    // 1. Reset sounds so they can overlap rapidly
    if (type === 'correct') {
        sfxCorrect.currentTime = 0;
        sfxCorrect.play().catch(e => console.warn(e));
    } else if (type === 'brush') {
        // New Brush Sound logic
        sfxBrush.currentTime = 0;
        sfxBrush.volume = 0.6; // Keep it subtle so it's not annoying
        sfxBrush.play().catch(e => console.warn(e));
    }
    // 2. ONLY play wrong if the type is explicitly 'wrong'
    else if (type === 'wrong') {
        sfxWrong.currentTime = 0;
        sfxWrong.play().catch(e => console.warn(e));
    }
    // 3. 'pop' will now be silent (or you can add a sfxPop sound here later)
    // It will NO LONGER trigger the wrong buzzer.
}

let savedVolume = parseFloat(localStorage.getItem('bgmVolume'));
if (isNaN(savedVolume)) savedVolume = 0.3;
bgmAudio.volume = savedVolume;


export function playClickSound() {
    // Clone node allows rapid clicking without cutting off the previous sound
    const sound = clickAudio.cloneNode();
    sound.volume = 0.5;
    sound.play().catch(() => {});
}

export function playBGM() {
    let target = parseFloat(localStorage.getItem('bgmVolume'));
    if (isNaN(target)) target = 0.3;

    bgmAudio.volume = target;
    bgmAudio.play().catch(e => console.log("Waiting for interaction..."));
}

export function stopBGM() {
    if(bgmAudio.volume > 0){
        bgmAudio.volume  = 0.05;
    }else{
        bgmAudio.volume  = 0;
    }
}


export function setBGMVolume(val) {
    const newVol = parseFloat(val);
    if (bgmAudio) {
        bgmAudio.volume = newVol;
    }
    // Save to memory
    localStorage.setItem('bgmVolume', newVol);
}

// Global Click Listener
document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('button') || target.closest('.zone-card') || target.closest('.menu-zone') || target.closest('.arcade-btn') || target.closest('.folder-card')) {
        playClickSound();
    }
    
    // Auto-start music if paused and allowed
    if (bgmAudio.paused && window.shouldPlayBGM) {
        let target = parseFloat(localStorage.getItem('bgmVolume'));
        if (isNaN(target)) target = 0.3;
        bgmAudio.volume = target;
        bgmAudio.play().catch(() => {});
    }
});
