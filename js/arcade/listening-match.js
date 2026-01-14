import { speakChinese, playGameSound } from '../core/audio.js';

export function loadListeningRound() {
    // 1. Get Elements
    const wrapper = document.getElementById('listening-game-wrapper');
    const container = document.getElementById('listening-game-container');

    // Safety Check
    if (!wrapper || !container) return;

    // 2. Data Check
    const list = window.activeList;
    const index = window.currentIndex;
    if (!list || !list[index]) {
        const modal = document.getElementById('completion-modal');
        if (modal) modal.classList.remove('hidden');
        return;
    }
    const item = list[index];

    // 3. Layout Setup
    wrapper.classList.remove('hidden');
    container.classList.remove('hidden'); 
    
    // Fit to screen, remove overflow unless needed
    wrapper.style.cssText = "flex: 1; display: flex; flex-direction: column; width: 100%; position: relative; overflow: hidden;";
    // Reduced padding-top to 40px to fit End Button comfortably
    container.style.cssText = "flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 20px 10px 20px; overflow-y: auto; gap: 15px;";
    
    
    // 4. End Game Button
    if (!wrapper.querySelector('.end-game-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn sm-ghost end-game-btn';
        btn.textContent = '✕ End Game';
        btn.onclick = window.returnToMenu;
        btn.style.cssText = "position: absolute; top: 10px; right: 10px; z-index: 50; background: white; border: 1px solid #eee; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;";
        wrapper.appendChild(btn);
    }

    // 5. Clear Old Content
    container.innerHTML = '';

    // 6. Generate Options
    let distractors = list.filter(x => x.hanzi !== item.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3);
    if (distractors.length < 3 && window.allWords) {
        const extra = window.allWords.filter(x => x.hanzi !== item.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3 - distractors.length);
        distractors = [...distractors, ...extra];
    }
    const options = [item, ...distractors].sort(() => 0.5 - Math.random());

    // 7. Render UI
    
    // Speaker
    const audioBtn = document.createElement('button');
    audioBtn.innerHTML = "🔊";
    audioBtn.style.cssText = "font-size: 2rem; width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: 4px solid white; box-shadow: 0 8px 15px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; transition: transform 0.1s; flex-shrink: 0;";
    audioBtn.onclick = () => {
        audioBtn.style.transform = "scale(0.95)";
        speakChinese(item.hanzi);
        setTimeout(() => audioBtn.style.transform = "scale(1)", 150);
    };

    // Hint
    const hint = document.createElement('p');
    hint.textContent = "Tap to listen, then select the matching sentence.";
    hint.style.cssText = "color: #666; margin-bottom: 5px; font-size: 0.9rem; text-align: center;";

    // Options Grid
    const grid = document.createElement('div');
    grid.id = 'listening-options-grid';
    grid.className = 'listening-options-grid';
    grid.style.cssText = "display: flex; flex-direction: column; gap: 12px; width: 90%; max-width: 400px;";

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'listening-option-btn';
        
        // Store Hanzi in a span so we don't overwrite it
        btn.innerHTML = `<span style="font-weight:bold;">${opt.hanzi}</span>`;
        
        btn.onclick = () => checkListeningAnswer(btn, opt, item);
        grid.appendChild(btn);
    });

    container.appendChild(audioBtn);
    container.appendChild(hint);
    container.appendChild(grid);

    // Update Progress
    if (window.updateProgress) window.updateProgress();

    // Auto-play
    if (window.autoPlayTimer) clearTimeout(window.autoPlayTimer);
    window.autoPlayTimer = setTimeout(() => speakChinese(item.hanzi), 600);
}

// --- CHECKER LOGIC ---
export function checkListeningAnswer(btn, selected, correct) {
    if (btn.disabled) return; 

    // Lock UI
    const grid = document.getElementById('listening-options-grid');
    const allBtns = grid.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    if (selected.hanzi === correct.hanzi) {
        // CORRECT CLICK
        btn.style.background = "#c6f6d5";
        btn.style.borderColor = "#2ecc71";
        revealInfo(btn, correct); // Show info
        playGameSound('correct');
    } else {
        // WRONG CLICK
        btn.style.background = "#fed7d7";
        btn.style.borderColor = "#e74c3c";
        revealInfo(btn, selected); // Show info for what they clicked (optional, but helpful)
        playGameSound('wrong');
        
        // Find and Highlight the REAL correct one
        allBtns.forEach(b => {
            if (b.innerHTML.includes(correct.hanzi)) {
                b.style.background = "#c6f6d5";
                b.style.borderColor = "#2ecc71";
                revealInfo(b, correct); // Show info
            }
        });
    }

    // Delay before next round (gave a bit more time to read: 2.5s)
    setTimeout(() => {
        window.currentIndex++;
        if (window.updateProgress) window.updateProgress();
        loadListeningRound();
    }, 2500);
}

// --- HELPER: Reveal Pinyin & English ---
function revealInfo(btn, item) {
    // Check if we already revealed it to prevent double append
    if (btn.querySelector('.revealed-info')) return;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'revealed-info';
    infoDiv.style.cssText = "font-size: 0.9rem; color: #666; margin-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px;";
    infoDiv.innerHTML = `
        <div style="color: #667eea; font-weight: bold;">${item.pinyin || ''}</div>
        <div>${item.english || ''}</div>
    `;
    btn.appendChild(infoDiv);
}