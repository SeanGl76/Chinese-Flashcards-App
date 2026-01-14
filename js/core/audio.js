
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

// In audio.js

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