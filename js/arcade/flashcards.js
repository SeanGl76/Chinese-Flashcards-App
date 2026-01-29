import { speakChinese, playGameSound } from '../core/audio.js';
import { shuffleArray } from '../core/utils.js';
import { playBGM, stopBGM} from '../core/audio.js';

let isFlipped = false;
// Default settings: limit (total cards), newLimit (max new words per session)
export let dailySettings = { type: 'words', limit: 15, newLimit: 5 }; 

// --- 1. SETTINGS & SETUP ---
export function openDailyModeSelection() {
    const modal = document.getElementById('daily-settings-modal');
    
    // 1. Check streaks
    window.checkAndResetStreaks();

    // 2. Setup UI
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

    // UI: Streak Display
    let streakContainer = document.getElementById('streak-display-container');
    if (!streakContainer) {
        streakContainer = document.createElement('div');
        streakContainer.id = 'streak-display-container';
        streakContainer.style.textAlign = 'center';
        streakContainer.style.marginTop = '5px';
        streakContainer.style.marginBottom = '15px';
        streakContainer.style.fontSize = '0.95rem';
        streakContainer.style.fontWeight = 'bold';
        streakContainer.style.color = '#e67e22';

        const slider = document.getElementById('daily-limit-slider');
        const parent = slider.parentNode;
        const startBtn = parent.querySelector('.btn.primary'); 
        parent.insertBefore(streakContainer, startBtn);
    }

    if (type === 'mix') {
        streakContainer.innerHTML = `<span style="color:#999; font-weight:normal;">(Free Practice - No Streak)</span>`;
    } else {
        const streak = parseInt(localStorage.getItem(`streak_${type}`)) || 0;
        streakContainer.innerHTML = `🔥 Current Streak: ${streak} Days`;
    }
}

export function confirmDailyStart() {
    // 1. Get Total Limit
    const totalSlider = document.getElementById('daily-limit-slider');
    dailySettings.limit = parseInt(totalSlider.value);

    // 2. Get New Word Limit (The new slider)
    const newSlider = document.getElementById('daily-new-slider');
    dailySettings.newLimit = parseInt(newSlider.value);

    document.getElementById('daily-settings-modal').classList.add('hidden');
    launchDailySession();
}

function launchDailySession() {
    window.gameType = 'flashcards';

    // 1. Get Active Groups
    const checkboxes = document.querySelectorAll('.group-checkbox:checked');
    let selectedGroups = Array.from(checkboxes).map(cb => cb.value);

    if (selectedGroups.length === 0 && window.availableGroups) {
        selectedGroups = window.availableGroups;
    }

    // 2. Prepare Pool
    let pool = [];
    if (dailySettings.type === 'words') pool = [...window.allWords];
    else if (dailySettings.type === 'sentences') pool = [...(window.allSentences || [])];
    else pool = [...window.allWords, ...(window.allSentences || [])];

    // 3. Filter by Group
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

    // --- 4. SMART SELECTION LOGIC ---
    const now = Date.now();
    
    // Categorize
    // Weak/Due: Review time is in the past
    const dueItems = filteredList.filter(item => item.nextReview && item.nextReview <= now);
    // New: No review time set
    const newItems = filteredList.filter(item => !item.nextReview);
    // Future: Review time is in the future (Already learned, but not due)
    const futureItems = filteredList.filter(item => item.nextReview && item.nextReview > now);

    // Shuffle Categories independently to fix "Alphabetical" issue
    shuffleArray(dueItems);
    shuffleArray(newItems);
    shuffleArray(futureItems);

    const totalCap = dailySettings.limit;
    const newCap = dailySettings.newLimit;

    // Selection Recipe:
    // 1. Take 'New' words up to newCap
    const selectedNew = newItems.slice(0, newCap);
    
    // 2. Calculate remaining space
    let remainingSlots = totalCap - selectedNew.length;
    
    // 3. Fill remaining space with 'Due' words
    const selectedDue = dueItems.slice(0, remainingSlots);
    remainingSlots -= selectedDue.length;

    // 4. If still space, fill with 'Future' words (Review ahead)
    //    OR if no future words, add more 'New' words (if user wants a full session)
    let selectedFuture = [];
    let extraNew = [];
    
    if (remainingSlots > 0) {
        selectedFuture = futureItems.slice(0, remainingSlots);
        remainingSlots -= selectedFuture.length;
    }

    // 5. Emergency fill: If strictly due+future ran out, and we still have space, 
    //    fill with more new words even if it exceeds newCap (to respect Total Quantity)
    if (remainingSlots > 0) {
        const alreadyPickedNewCount = selectedNew.length;
        extraNew = newItems.slice(alreadyPickedNewCount, alreadyPickedNewCount + remainingSlots);
    }

    // Combine and Shuffle Final List
    // We shuffle again so the user doesn't get all New words at the start
    let sessionList = [...selectedDue, ...selectedNew, ...selectedFuture, ...extraNew];
    window.activeList = shuffleArray(sessionList);
    
    // Safety slice (just in case logic went over)
    if (window.activeList.length > totalCap) {
        window.activeList = window.activeList.slice(0, totalCap);
    }

    window.currentIndex = 0;
    
    // Switch Screens
    const screens = ['main-menu', 'builder-container', 'listening-game-wrapper', 'image-match-container', 'srs-exit'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    if (window.hideAllSections) {
        window.hideAllSections();
    } else {
        console.error("Critical Error: window.hideAllSections is missing!");
    }

    // Force the CSS switch directly just in case
    if (window.toggleGameMode) {
        window.toggleGameMode(true);
    }
    
    document.getElementById('game-area').classList.remove('hidden');
    startFlashcardSession();
}

// --- SESSION START & CARD LOGIC (Unchanged) ---
export function startFlashcardSession() {
    stopBGM();
    window.shouldPlayBGM = false;
    const container = document.getElementById('flashcard-container');
    const controls = document.getElementById('srs-controls');
    
    container.classList.remove('hidden');
    if (controls) controls.classList.remove('hidden');

    if (!container.querySelector('.end-game-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn sm-ghost end-game-btn';
        btn.textContent = '✕ End';
        btn.onclick = window.returnToMenu; 
        btn.style.cssText = "position: absolute; top: -10px; right: 0px; z-index: 50; background: transparent; border: 1px solid #eee; padding: 5px 12px; border-radius: 8px; cursor: pointer; color: #666;";
        container.appendChild(btn);
    }

    loadNextCard();
}

export function loadNextCard() {
    const list = window.activeList;
    const index = window.currentIndex;

    if (!list || !list[index]) {
        window.finishSession(); 
        return;
    }

    const item = list[index];
    
    isFlipped = false;
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('flipped'); 

    // Badge Logic
    let badge = document.getElementById('flashcard-new-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'flashcard-new-badge';
        badge.className = 'flashcard-badge';
        document.getElementById('card-front').appendChild(badge);
    }

    if (!item.nextReview) {
        const typeText = dailySettings.type === 'sentences' ? "New Sentence" : "New Word";
        badge.textContent = `✨ ${typeText}`;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const hanziEl = document.getElementById('flashcard-hanzi');
    if (hanziEl) {
        hanziEl.textContent = item.hanzi;
        hanziEl.style.fontSize = item.hanzi.length > 6 ? '1.8rem' : '4rem';
    }

    document.getElementById('flashcard-pinyin').textContent = item.pinyin || '';
    document.getElementById('flashcard-english').textContent = item.english || '';
    document.getElementById('flashcard-sentence').textContent = item.example || '';

    if (window.autoPlayTimer) clearTimeout(window.autoPlayTimer);
    window.autoPlayTimer = setTimeout(() => {
        if(!isFlipped) speakChinese(item.hanzi);
    }, 400);

    if (window.updateProgress) window.updateProgress();
}

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
        window.activeList.push(item);
        nextReview = now; 
    } else {
        playGameSound('correct');
        window.triggerConfetti()
        if (quality === 'hard') nextReview = now + (24 * 60 * 60 * 1000);       
        else if (quality === 'good') nextReview = now + (7 * 24 * 60 * 60 * 1000);   
        else if (quality === 'easy') nextReview = now + (30 * 24 * 60 * 60 * 1000);  
    }

    item.nextReview = nextReview;

    const srsDataJSON = localStorage.getItem('srsReviewData');
    let srsData = srsDataJSON ? JSON.parse(srsDataJSON) : {};
    srsData[item.hanzi] = nextReview;
    localStorage.setItem('srsReviewData', JSON.stringify(srsData));

    window.currentIndex++;
    setTimeout(loadNextCard, 300);
}