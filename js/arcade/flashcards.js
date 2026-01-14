import { speakChinese, playGameSound } from '../core/audio.js';
import { shuffleArray } from '../core/utils.js';

let isFlipped = false;
// Default settings
export let dailySettings = { type: 'words', limit: 15 }; 

// --- 1. SETTINGS & SETUP ---
export function openDailyModeSelection() {
    const modal = document.getElementById('daily-settings-modal');
    
    // 1. Run a check to see if streaks are broken (missed a day)
    window.checkAndResetStreaks();

    // 2. Default to 'words' view and update the streak UI immediately
    setDailyType(dailySettings.type);
    
    if (modal) modal.classList.remove('hidden');
}

export function setDailyType(type) {
    dailySettings.type = type;
    
    // UI: Toggle Active Buttons
    ['opt-words', 'opt-mix', 'opt-sentences'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    document.getElementById(`opt-${type}`).classList.add('active');

    // UI: Create Streak Display if missing
    let streakContainer = document.getElementById('streak-display-container');
    if (!streakContainer) {
        streakContainer = document.createElement('div');
        streakContainer.id = 'streak-display-container';
        
        // Styles to fit perfectly under slider
        streakContainer.style.textAlign = 'center';
        streakContainer.style.marginTop = '5px';    // Space from slider
        streakContainer.style.marginBottom = '15px'; // Space before button
        streakContainer.style.fontSize = '0.95rem';
        streakContainer.style.color = '#e67e22'; 
        streakContainer.style.fontWeight = 'bold';

        // INSERT LOGIC: Place it BEFORE the Start button
        const slider = document.getElementById('daily-limit-slider');
        const parent = slider.parentNode;
        // The Start button is the first button with class 'primary' in this modal
        const startBtn = parent.querySelector('.btn.primary'); 
        
        parent.insertBefore(streakContainer, startBtn);
    }

    // Logic: Update Text
    if (type === 'mix') {
        streakContainer.innerHTML = `<span style="color:#999; font-weight:normal;">(Free Practice - No Streak)</span>`;
    } else {
        const streak = parseInt(localStorage.getItem(`streak_${type}`)) || 0;
        streakContainer.innerHTML = `🔥 Current Streak: ${streak} Days`;
    }
}

export function confirmDailyStart() {
    const slider = document.getElementById('daily-limit-slider');
    dailySettings.limit = parseInt(slider.value);
    document.getElementById('daily-settings-modal').classList.add('hidden');
    launchDailySession();
}

function launchDailySession() {
    window.gameType = 'flashcards';

    // Get Active Groups
    const checkboxes = document.querySelectorAll('.group-checkbox:checked');
    let selectedGroups = Array.from(checkboxes).map(cb => cb.value);

    // Fallback if filter is empty
    if (selectedGroups.length === 0 && window.availableGroups) {
        selectedGroups = window.availableGroups;
    }

    // Prepare Data
    let pool = [];
    if (dailySettings.type === 'words') pool = [...window.allWords];
    else if (dailySettings.type === 'sentences') pool = [...(window.allSentences || [])];
    else pool = [...window.allWords, ...(window.allSentences || [])];

    // Filter by Group
    let filteredList = pool;
    if (selectedGroups.length > 0) {
        filteredList = pool.filter(item => {
            const itemGroup = (item.group || 'Uncategorized').trim(); 
            return selectedGroups.includes(itemGroup);
        });
    }
    if (filteredList.length === 0) {
        alert("No items found in selected groups!");
        return;
    }

    // --- PRIORITIZATION LOGIC (Weak/Due First) ---
    const now = Date.now();
    
    // 1. Separate "Due" (Weak) from "Not Due"
    // "Weak" = nextReview exists AND is in the past (<= now)
    const dueItems = filteredList.filter(item => item.nextReview && item.nextReview <= now);
    const newOrFutureItems = filteredList.filter(item => !item.nextReview || item.nextReview > now);

    // 2. Shuffle both piles separately
    shuffleArray(dueItems);
    shuffleArray(newOrFutureItems);

    // 3. Combine: Due items FIRST, then fill remaining space with others
    let combined = [...dueItems, ...newOrFutureItems];

    // 4. Slice to limit
    window.activeList = combined.slice(0, dailySettings.limit);
    window.currentIndex = 0;
    
    // Switch Screens
    const screens = ['main-menu', 'builder-container', 'listening-game-wrapper', 'image-match-container', 'srs-exit'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    document.getElementById('game-area').classList.remove('hidden');
    startFlashcardSession();
}

// --- 2. SESSION START ---
export function startFlashcardSession() {
    const container = document.getElementById('flashcard-container');
    const controls = document.getElementById('srs-controls');
    
    container.classList.remove('hidden');
    if (controls) controls.classList.remove('hidden');

    if (!container.querySelector('.end-game-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn sm-ghost end-game-btn';
        btn.textContent = '✕ Quit';
        btn.onclick = window.returnToMenu; 
        btn.style.cssText = "position: absolute; top: 45px; right: 310px; z-index: 50; background: transparent; border: 1px solid #eee; padding: 5px 12px; border-radius: 8px; cursor: pointer; color: #666;";
        container.appendChild(btn);
    }

    loadNextCard();
}

// --- 3. CARD RENDERING ---
export function loadNextCard() {
    const list = window.activeList;
    const index = window.currentIndex;

    if (!list || !list[index]) {
        window.finishSession(); // Auto-finish
        return;
    }

    const item = list[index];
    
    // RESET STATE
    isFlipped = false;
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('flipped'); 

    // --- NEW: HANDLE BADGE ---
    let badge = document.getElementById('flashcard-new-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'flashcard-new-badge';
        badge.className = 'flashcard-badge';
        // Insert into the front face
        document.getElementById('card-front').appendChild(badge);
    }

    // Logic: If no nextReview (0 or null), it's New.
    if (!item.nextReview) {
        const typeText = dailySettings.type === 'sentences' ? "New Sentence" : "New Word";
        badge.textContent = `✨ ${typeText}`;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    // FILL DATA
    const hanziEl = document.getElementById('flashcard-hanzi');
    if (hanziEl) {
        hanziEl.textContent = item.hanzi;
        hanziEl.style.fontSize = item.hanzi.length > 6 ? '1.8rem' : '4rem';
    }

    document.getElementById('flashcard-pinyin').textContent = item.pinyin || '';
    document.getElementById('flashcard-english').textContent = item.english || '';
    document.getElementById('flashcard-sentence').textContent = item.example || '';

    // AUTO PLAY
    if (window.autoPlayTimer) clearTimeout(window.autoPlayTimer);
    window.autoPlayTimer = setTimeout(() => {
        if(!isFlipped) speakChinese(item.hanzi);
    }, 400);

    if (window.updateProgress) window.updateProgress();
}

// --- 4. INTERACTIONS ---

export function flipCard() {
    isFlipped = !isFlipped; 
    const card = document.getElementById('flashcard');
    if (isFlipped) card.classList.add('flipped');
    else card.classList.remove('flipped');
}

export function playCardAudio(event) {
    if (event) event.stopPropagation();
    const item = window.activeList[window.currentIndex];
    if (item) speakChinese(item.hanzi);
}

export function rateWord(quality) {
    const item = window.activeList[window.currentIndex];
    if (!item) return;

    const now = Date.now();
    let nextReview = now;

    if (quality === 'again') {
        playGameSound('wrong');
        window.activeList.push(item);
        nextReview = now; 
    } else {
        playGameSound('correct');
        if (quality === 'hard') nextReview = now + (24 * 60 * 60 * 1000);       // 1 Day
        else if (quality === 'good') nextReview = now + (7 * 24 * 60 * 60 * 1000);   // 7 Days
        else if (quality === 'easy') nextReview = now + (30 * 24 * 60 * 60 * 1000);  // 30 Days
    }

    item.nextReview = nextReview;

    const srsDataJSON = localStorage.getItem('srsReviewData');
    let srsData = srsDataJSON ? JSON.parse(srsDataJSON) : {};
    srsData[item.hanzi] = nextReview;
    localStorage.setItem('srsReviewData', JSON.stringify(srsData));

    window.currentIndex++;
    setTimeout(loadNextCard, 300);
}