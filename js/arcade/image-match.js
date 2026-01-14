import { playGameSound, speakChinese } from '../core/audio.js';

// --- MAIN ENTRY POINT ---
export function startImageMatchSession() {
    const container = document.getElementById('image-match-container');
    
    // 1. Setup UI
    container.classList.remove('hidden');

    // 2. Self-Healing Exit Button
    if (!container.querySelector('.end-game-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn sm-ghost end-game-btn';
        btn.textContent = '✕ End Game';
        btn.onclick = window.returnToMenu; 
        btn.style.cssText = "position: absolute; top: 10px; right: 10px; z-index: 50; background: white; border: 1px solid #eee; padding: 5px 12px; border-radius: 8px; cursor: pointer;";
        container.appendChild(btn);
    }

    // 3. Start the Round
    renderGameRound();
}

// --- ROUND LOGIC ---
export function renderGameRound() {
    const list = window.activeList;
    
    // 1. KILL SPINNER
    const spinner = document.getElementById('img-loading');
    if (spinner) {
        spinner.style.display = 'none'; 
        spinner.classList.add('hidden'); 
    }

    // End Game Check
    if (!list || !list[window.currentIndex]) {
        const modal = document.getElementById('completion-modal');
        if (modal) modal.classList.remove('hidden');
        return;
    }
    
    const item = list[window.currentIndex];
    const optionsGrid = document.getElementById('image-options');
    const imgWrapper = document.querySelector('.image-box-wrapper');

    // Reset UI
    if (optionsGrid) optionsGrid.innerHTML = '';
    
    // --- 2. THE BING IMAGE LOGIC ---
    let imgEl = document.getElementById('quiz-image');
    
    if (!imgEl && imgWrapper) {
        imgEl = document.createElement('img');
        imgEl.id = 'quiz-image';
        imgEl.style.cssText = "width:100%; height:100%; object-fit:contain; border-radius: 12px; transition: opacity 0.3s;";
        imgWrapper.appendChild(imgEl);
    }
    
    if (imgEl) {
        imgEl.style.opacity = '0.5'; // Fade out while loading

        // Construct Bing Thumbnail URL
        const query = `${item.hanzi} ${item.english} illustration`;
        const bingUrl = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(query)}&w=400&h=400&c=7&rs=1&p=0`;
        
        imgEl.src = bingUrl;
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
        imgEl.onerror = () => {
             // Fallback placeholder
             imgEl.src = `https://placehold.co/400x400/png?text=${encodeURIComponent(item.hanzi)}`;
             imgEl.style.opacity = '1';
        };
    }

    // --- 3. OPTIONS ---
    let distractors = list.filter(w => w.hanzi !== item.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    if (distractors.length < 3 && window.allWords) {
         const extra = window.allWords.filter(w => w.hanzi !== item.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3 - distractors.length);
         distractors = [...distractors, ...extra];
    }
    
    const options = [item, ...distractors].sort(() => 0.5 - Math.random());

    // Render Buttons
    if (optionsGrid) {
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'img-option-btn';
            btn.textContent = opt.hanzi;
            
            // IMPORTANT: Store Hanzi in dataset for robust checking later
            btn.dataset.hanzi = opt.hanzi;
            
            btn.onclick = () => checkImageAnswer(btn, opt, item);
            optionsGrid.appendChild(btn);
        });
    }
    
    if (window.updateProgress) window.updateProgress();
}

// --- CHECKER LOGIC ---
function checkImageAnswer(clickedBtn, selected, correct) {
    const optionsGrid = document.getElementById('image-options');
    
    // 1. Play Audio Immediately (Feedback)
    speakChinese(correct.hanzi);

    // 2. Process Buttons
    Array.from(optionsGrid.children).forEach(b => {
        b.disabled = true; // Lock all
        
        // 3. Reveal details on the CORRECT button
        if (b.dataset.hanzi === correct.hanzi) {
            b.classList.add('correct');
            
            // Show Pinyin and English on the correct button
            const eng = correct.english.split(';')[0]; // Take first meaning
            b.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%;">
                            
                            <span style="font-size: 1.2rem; font-weight: bold; line-height: 1;">
                                ${correct.hanzi}
                            </span>

                            <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <span style="font-size: 0.8rem; color: #047857; font-weight: bold; line-height: 1;">
                                    ${correct.pinyin}
                                </span>
                                <span style="font-size: 0.7rem; color: #065f46; font-style: italic; line-height: 1; margin-top:2px;">
                                    ${eng}
                                </span>
                            </div>

                        </div>
                    `;
        }
    });
    
    // 4. Handle Visual Feedback for the click
    if (selected.hanzi === correct.hanzi) {
        playGameSound('correct');
    } else {
        // If wrong, make the clicked button red
        clickedBtn.style.background = "#fed7d7";
        clickedBtn.style.borderColor = "#e74c3c";
        playGameSound('wrong');
    }
    
    // 5. Next Round (Slightly longer delay to read the feedback)
    setTimeout(() => {
        window.currentIndex++;
        renderGameRound();
    }, 2200);
}