import { speakChinese, playGameSound } from '../core/audio.js';
import { getGrammarTip } from '../material/chat.js';

let currentModeType = 'scramble'; 

// --- MODE SWITCHER ---
// We attach this to window so your HTML buttons can find it
window.switchBuilderMode = function(mode) {
    currentModeType = mode;
    // Toggle UI state
    const btnS = document.getElementById('btn-mode-scramble');
    const btnF = document.getElementById('btn-mode-fill');
    if(btnS) btnS.classList.toggle('active', mode === 'scramble');
    if(btnF) btnF.classList.toggle('active', mode === 'fill');
    
    // Reload
    loadBuilderRound(); 
};

export function loadBuilderRound() {
    const list = window.activeList;
    const index = window.currentIndex;

    if (!list || !list[index]) {
        const modal = document.getElementById('completion-modal');
        if(modal) modal.classList.remove('hidden');
        return;
    }

    const item = list[index];

    // Setup UI
    const container = document.getElementById('builder-container');
    const englishEl = document.getElementById('builder-english');
    const dropZone = document.getElementById('builder-dropzone');
    const wordBank = document.getElementById('builder-words');
    const feedback = document.getElementById('builder-feedback');

    const oldTip = document.getElementById('grammar-doctor-tip');
    if(oldTip) oldTip.remove();

    container.classList.remove('hidden');
    dropZone.innerHTML = '';
    wordBank.innerHTML = '';
    if(feedback) feedback.classList.add('hidden');
    
    if(englishEl) englishEl.textContent = item.english;

    // Split sentence
    const segments = item.hanzi.split('');

    if (currentModeType === 'scramble') {
        setupScrambleMode(segments, dropZone, wordBank);
    } else {
        setupFillMode(segments, dropZone, wordBank);
    }
}

function setupScrambleMode(segments, dropZone, wordBank) {
    dropZone.className = 'builder-dropzone scramble-layout';
    
    const shuffled = [...segments].sort(() => 0.5 - Math.random());
    shuffled.forEach(char => {
        createBubble(char, wordBank, (btn) => {
            // Move between bank and dropzone
            if (btn.parentElement === wordBank) {
                dropZone.appendChild(btn);
            } else {
                wordBank.appendChild(btn);
            }
        });
    });
}

function setupFillMode(segments, dropZone, wordBank) {
    dropZone.className = 'builder-dropzone fill-layout';
    
    // Logic: Hide ~50%
    const indicesToHide = new Set();
    while(indicesToHide.size < Math.ceil(segments.length / 2)) {
        indicesToHide.add(Math.floor(Math.random() * segments.length));
    }

    segments.forEach((char, i) => {
        if (indicesToHide.has(i)) {
            const slot = document.createElement('div');
            slot.className = 'fill-slot empty';
            slot.dataset.answer = char;
            slot.onclick = () => {
                if (slot.classList.contains('filled')) {
                    createBubble(slot.textContent, wordBank, (b) => fillFirstSlot(b));
                    slot.textContent = '';
                    slot.className = 'fill-slot empty';
                    playGameSound('pop');
                }
            };
            dropZone.appendChild(slot);
        } else {
            const span = document.createElement('span');
            span.className = 'static-text';
            span.textContent = char;
            dropZone.appendChild(span);
        }
    });

    // Populate Bank
    const hiddenChars = segments.filter((_, i) => indicesToHide.has(i)).sort(() => 0.5 - Math.random());
    hiddenChars.forEach(char => {
        createBubble(char, wordBank, (b) => fillFirstSlot(b));
    });
}

function createBubble(text, parent, onClick) {
    const btn = document.createElement('button');
    btn.className = 'word-chip';
    btn.textContent = text;
    btn.onclick = () => {
        playGameSound('pop');
        onClick(btn);
    };
    parent.appendChild(btn);
}

function fillFirstSlot(chip) {
    const slot = document.querySelector('.fill-slot.empty');
    if (slot) {
        slot.textContent = chip.textContent;
        slot.className = 'fill-slot filled';
        chip.remove();
    }
}

export async function checkBuilderAnswer() {
    const item = window.activeList[window.currentIndex];
    const feedback = document.getElementById('builder-feedback');
    let isCorrect = false;
    let userText = "";

    if (currentModeType === 'scramble') {
        userText = Array.from(document.getElementById('builder-dropzone').children).map(c => c.textContent).join('');
        isCorrect = (userText === item.hanzi);
    } else {
        const slots = document.querySelectorAll('.fill-slot');
        const container = document.getElementById('builder-dropzone');
        userText = Array.from(container.children).map(c => c.textContent).join('');
        isCorrect = (userText === item.hanzi);
    }

    if (isCorrect) {
        if(feedback) {
            feedback.textContent = "Correct!";
            feedback.className = "feedback-msg correct";
            feedback.classList.remove('hidden');
        }

        const oldTip = document.getElementById('grammar-doctor-tip');
        if(oldTip) oldTip.remove();

        playGameSound('correct');

        if (!window.sessionStats) window.sessionStats = { correct: 0, wrong: 0 };
        window.sessionStats.correct++;


        speakChinese(item.hanzi);
        window.triggerConfetti()
        
        setTimeout(() => {
            window.currentIndex++;
            if (window.updateProgress) window.updateProgress();
            loadBuilderRound();
        }, 1500);
    } else {
        if(feedback) {
            feedback.textContent = "Try again!";
            feedback.className = "feedback-msg wrong";
            feedback.classList.remove('hidden');
        }
        playGameSound('wrong');

        if (!window.sessionStats) window.sessionStats = { correct: 0, wrong: 0 };
        window.sessionStats.wrong++;

        if (userText.length > 0) {
            showGrammarDoctorTip("Thinking...", true); // Show loading
            
            const tip = await getGrammarTip(userText, item.hanzi);
            
            if (tip) {
                showGrammarDoctorTip(tip, false);
            } else {
                // If API fails or no key, just remove the loader
                const oldTip = document.getElementById('grammar-doctor-tip');
                if(oldTip) oldTip.remove();
            }
        }
    }
}


function showGrammarDoctorTip(text, isLoading) {
    // 1. Find or create the tip container
    let tipBox = document.getElementById('grammar-doctor-tip');
    const card = document.getElementById('builder-card');

    if (!tipBox) {
        tipBox = document.createElement('div');
        tipBox.id = 'grammar-doctor-tip';
        // Style nicely like the chat tip
        tipBox.style.cssText = `
            background: #fff9c4; 
            color: #664d03; 
            padding: 12px 30px 12px 15px; 
            border-radius: 12px; 
            margin-top: 15px; 
            font-size: 0.9rem; 
            border-left: 4px solid #ffca28;
            position: relative;
            width: 100%;
            box-sizing: border-box;
            animation: fadeIn 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        `;
        
        // Append inside the card, at the bottom
        card.appendChild(tipBox);
    }

    // 2. Add Content
    if (isLoading) {
        tipBox.innerHTML = `<em>🤔 Dr. Grammar is analyzing...</em>`;
    } else {
        tipBox.innerHTML = `<strong>💡 Tip:</strong> ${text}`;
        
        // 3. Add X Button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: transparent;
            border: none;
            color: #b79c5a;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.onclick = () => tipBox.remove();
        tipBox.appendChild(closeBtn);
    }
}

window.resetBuilder = loadBuilderRound;