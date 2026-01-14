import { hsk1Words, hsk2Words, hsk3Words, hsk4Words, hsk5Words,
         travelWords, cultureWords, dailyLifeWords, placesWords,
         foodWords,societyWords,natureWords,peopleWords,hobbyWords,
         schoolWorkWords,homeTransportWords,grammarWords} from './data/word-list.js';
import { premadeSentences, hsk2Sentences, hsk3Sentences,
         hsk4Sentences, hsk5Sentences,travelSentences,
         cultureSentences, dailyLifeSentences,placesSentences,
         foodSentences,societySentences, natureSentences,
         peopleSentences,hobbySentences,schoolWorkSentences,
         homeTransportSentences,grammarSentences} from './data/sentences.js';
import { triggerAlert, closeModal, showInterimMessage, shuffleArray } from './core/utils.js';
import { speakChinese, playGameSound} from './core/audio.js';
import { loadListeningRound, checkListeningAnswer } from './arcade/listening-match.js';
import { loadBuilderRound, checkBuilderAnswer} from './arcade/sentence-builder.js';
import { startImageMatchSession } from './arcade/image-match.js';
import { openDailyModeSelection, startFlashcardSession, flipCard, rateWord, setDailyType, confirmDailyStart, playCardAudio, dailySettings } from './arcade/flashcards.js'
import { storyData } from './material/story-data.js';
import { stopStoryAudio,  updateTTSRate, openStoryHub, backToStoryGroups, filterStories, backToDifficulty, openReader, closeStoryReader, togglePinyin, closeStoryModal, toggleTranslation, playStoryAudio } from './material/stories.js';
import { triggerMagicUpload, handleMagicUpload, confirmMagicUpload, cancelMagicUpload, minimizeLoading } from './core/magic-import.js';
import { animateCharacter, resetCanvas, openWriterHub, openWriterDirectly} from './material/writer.js';
import { openChatHub, handleUserSend, toggleChatSettings, updateChatSpeed, toggleListening, triggerQuizSetup, startQuiz, } from './material/chat.js';





// --- 2. DATA STATE ---
const defaultWords = [
    ...hsk1Words.map(w => ({ ...w, group: 'HSK1' })),
    ...hsk2Words.map(w => ({ ...w, group: 'HSK2' })),
    ...hsk3Words.map(w => ({ ...w, group: 'HSK3' })),
    ...hsk4Words.map(w => ({ ...w, group: 'HSK4' })),
    ...hsk5Words.map(w => ({ ...w, group: 'HSK5' })),
    ...travelWords.map(w => ({ ...w, group: 'Travel' })),
    ...cultureWords.map(w => ({ ...w, group: 'Culture' })),
    ...dailyLifeWords.map(w => ({ ...w, group: 'Daily Life' })),
    ...placesWords.map(w => ({ ...w, group: 'Countries & Places' })),
    ...foodWords.map(w => ({ ...w, group: 'Food & Dining' })),
    ...societyWords.map(w => ({ ...w, group: 'Politics & News' })),
    ...natureWords.map(w => ({ ...w, group: 'Nature & Animals' })),
    ...peopleWords.map(w => ({ ...w, group: 'People & Body' })),
    ...hobbyWords.map(w => ({ ...w, group: 'Hobbies & Colors' })),
    ...schoolWorkWords.map(w => ({ ...w, group: 'School & Work' })),
    ...homeTransportWords.map(w => ({ ...w, group: 'Household & Transportation' })),
    ...grammarWords.map(w => ({ ...w, group: 'Grammar Essentials' })),
];
const loadedSentences = [
    ...premadeSentences.map(s => ({ ...s, group: 'HSK1' })),
    ...hsk2Sentences.map(s => ({ ...s, group: 'HSK2' })),
    ...hsk3Sentences.map(s => ({ ...s, group: 'HSK3' })),
    ...hsk4Sentences.map(s => ({ ...s, group: 'HSK4' })),
    ...hsk5Sentences.map(s => ({ ...s, group: 'HSK5' })),
    ...travelSentences.map(s => ({ ...s, group: 'Travel' })),
    ...cultureSentences.map(s => ({ ...s, group: 'Culture' })),
    ...dailyLifeSentences.map(s => ({ ...s, group: 'Daily Life' })),
    ...placesSentences.map(s => ({ ...s, group: 'Countries & Places' })),
    ...foodSentences.map(s => ({ ...s, group: 'Food & Dining' })),
    ...societySentences.map(s => ({ ...s, group: 'Politics & News' })),
    ...natureSentences.map(s => ({ ...s, group: 'Nature & Animals' })),
    ...peopleSentences.map(s => ({ ...s, group: 'People & Body' })),
    ...hobbySentences.map(s => ({ ...s, group: 'Hobbies & Colors' })),
    ...schoolWorkSentences.map(s => ({ ...s, group: 'School & Work' })),
    ...homeTransportSentences.map(s => ({ ...s, group: 'Household & Transportation' })),
    ...grammarSentences.map(s => ({ ...s, group: 'Grammar Essentials' }))
];

let allWords = [defaultWords];          
let allSentences = loadedSentences;  
let activeList = [...defaultWords];   // Default to all words

// Expose them to the window so games can see them
window.allWords = allWords;
window.allSentences = allSentences;
window.activeList = activeList;

let allStories = [];
let currentIndex = 0;
let dailyLimit = 15;
let currentMode = 'words';
let availableGroups = [];
let currentViewingGroup = null;
let myChart = null;
let currentChartType = 'words';
window.listeningRoundCount = 0;

// Game, Timer & Streak State
let currentStreak = 0;  

// --- 4. DOM ELEMENTS ---
const menuSection = document.getElementById('main-menu');
const addWordSection = document.getElementById('add-word-menu');
const wordListSection = document.getElementById('word-list-section');
const gameSection = document.getElementById('game-area');
const cardElement = document.querySelector('.card');
const displayHanzi = document.getElementById('display-hanzi');
const displayPinyin = document.getElementById('display-pinyin');
const displayEnglish = document.getElementById('display-english');
const displayGroup = document.getElementById('display-group');
const tableBody = document.getElementById('word-table-body');
const searchInput = document.getElementById('search-bar');
const groupDatalist = document.getElementById('group-suggestions');
const wbGroupView = document.getElementById('wb-group-view');
const wbDetailView = document.getElementById('wb-detail-view');
const wbGroupGrid = document.getElementById('wb-group-grid');
const wbTitle = document.getElementById('wb-title');

const srsControls = document.getElementById('srs-controls');

// --- 5. INITIALIZATION ---
function loadAllWords() {
    const customWordsJSON = localStorage.getItem('myCustomChineseWords');
    let customWords = customWordsJSON ? JSON.parse(customWordsJSON) : [];
    allWords = [...defaultWords, ...customWords];

    const customSentencesJSON = localStorage.getItem('myCustomSentences');
    let customSentences = customSentencesJSON ? JSON.parse(customSentencesJSON) : [];
    allSentences = [...loadedSentences,...customSentences]; 

    const customStoriesJSON = localStorage.getItem('myCustomStories');
    const customStories = customStoriesJSON ? JSON.parse(customStoriesJSON) : [];
    window.allStories = [...storyData, ...customStories];

    const reviewDataJSON = localStorage.getItem('srsReviewData');
    const reviewData = reviewDataJSON ? JSON.parse(reviewDataJSON) : {};
    
    allWords.forEach(word => { word.nextReview = reviewData[word.hanzi] || 0; });
    allSentences.forEach(sentence => { sentence.nextReview = reviewData[sentence.hanzi] || 0; });

    window.allWords = allWords;
    window.allSentences = allSentences;
    window.allStories = allStories;

    availableGroups = [];

    updateGroupList();
}

function updateGroupList() {
    // RESET the global array so it doesn't just grow forever
    availableGroups = []; 

    const combined = [...allWords, ...allSentences];
    const groupSet = new Set(combined.map(w => w.group || 'Uncategorized'));
    
    // Fill it with fresh data
    availableGroups = Array.from(groupSet).sort();
    
    groupDatalist.innerHTML = '';
    availableGroups.forEach(grp => {
        const opt = document.createElement('option');
        opt.value = grp;
        groupDatalist.appendChild(opt);
    });
    
    // Always redraw the filter buttons
    renderGroupFilters();
}

function renderGroupFilters() {
    // Just redirect to the new row renderer
    renderGroupRows();
}

loadAllWords();

// --- 6. UTILITY FUNCTIONS ---

let confirmYesCallback = null;
function triggerConfirm(message, yesCallback) {
    document.getElementById('confirm-msg').textContent = message;
    confirmYesCallback = yesCallback;
    document.getElementById('confirm-modal').classList.remove('hidden');
}
document.getElementById('confirm-yes-btn').onclick = function() {
    if (confirmYesCallback) confirmYesCallback();
    closeModal('confirm-modal');
};

// Variable to store the timer ID so we can cancel it if needed


//settings functions
function openSettings() {
    const key = localStorage.getItem('geminiApiKey');
    const groqKey = localStorage.getItem('groqApiKey');
    
    // Gemini Elements
    const inputGemini = document.getElementById('input-api-key');
    const btnDelGemini = document.getElementById('btn-delete-gemini');

    // Groq Elements
    const inputGroq = document.getElementById('input-groq-key');
    const btnDelGroq = document.getElementById('btn-delete-groq');

    // Setup Gemini UI
    if (key) {
        inputGemini.value = key;
        btnDelGemini.classList.remove('hidden');
    } else {
        inputGemini.value = '';
        btnDelGemini.classList.add('hidden');
    }
    
    // Setup Groq UI
    if (groqKey) {
        inputGroq.value = groqKey;
        btnDelGroq.classList.remove('hidden');
    } else {
        inputGroq.value = '';
        btnDelGroq.classList.add('hidden');
    }

    document.getElementById('settings-modal').classList.remove('hidden');
}

function saveGeminiKey() {
    const key = document.getElementById('input-api-key').value.trim();
    if (!key) return triggerAlert("Gemini Key cannot be empty!");
    
    localStorage.setItem('geminiApiKey', key);
    triggerToast("Gemini Key saved! ✨");
    
    // Update UI immediately
    document.getElementById('btn-delete-gemini').classList.remove('hidden');
}

function saveGroqKey() {
    const key = document.getElementById('input-groq-key').value.trim();
    if (!key) return triggerAlert("Groq Key cannot be empty!");
    
    localStorage.setItem('groqApiKey', key);
    triggerToast("Groq Key saved! 🚀");
    
    // Update UI immediately
    document.getElementById('btn-delete-groq').classList.remove('hidden');
}

function removeGeminiKey() {
    triggerConfirm("Remove Gemini API Key?", () => {
        localStorage.removeItem('geminiApiKey');
        document.getElementById('input-api-key').value = "";
        document.getElementById('btn-delete-gemini').classList.add('hidden');
        triggerToast("Gemini Key removed.");
    });
}

function removeGroqKey() {
    triggerConfirm("Remove Groq API Key?", () => {
        localStorage.removeItem('groqApiKey');
        document.getElementById('input-groq-key').value = "";
        document.getElementById('btn-delete-groq').classList.add('hidden');
        triggerToast("Groq Key removed.");
    });
}


window.openGroqInstructions = function() {
    document.getElementById('groq-instructions-modal').classList.remove('hidden');
}

window.openGeminiInstructions = function() {
    document.getElementById('gemini-instructions-modal').classList.remove('hidden');
}

window.checkAndResetStreaks = function() {
    const today = new Date().toDateString();
    
    ['words', 'sentences'].forEach(type => {
        const lastDate = localStorage.getItem(`lastDate_${type}`);
        
        if (lastDate) {
            const d1 = new Date(lastDate);
            const d2 = new Date(today);
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            // If more than 1 day passed (e.g., played Monday, now it's Wednesday), reset streak
            if (diffDays > 1) {
                localStorage.setItem(`streak_${type}`, 0);
            }
        }
    });
};

// --- 7. GAME START LOGIC ---
function checkSpecificDailyStatus(mode) {
    currentMode = mode;
    closeModal('mode-modal');
    const today = new Date().toDateString();
    const lastDate = (mode === 'words') ? localStorage.getItem('lastDailyWordDate') : localStorage.getItem('lastDailySentenceDate');
    if (lastDate === today) {
        const text = (mode === 'words') ? "You've reviewed your words today!" : "You've reviewed your sentences today!";
        document.getElementById('already-done-text').textContent = text;
        document.getElementById('already-done-modal').classList.remove('hidden');
    } else {
        document.getElementById('limit-modal').classList.remove('hidden');
    }
}

function forceStartExtraSession() { 
    closeModal('already-done-modal'); 
    document.getElementById('limit-modal').classList.remove('hidden'); 
}

function setLimitAndStart(limit) { 
    dailyLimit = limit; 
    closeModal('limit-modal'); 
    startGameLogic(); 
}


//--------------------------------------//
//NEW ARCADE AND PRACTICE HUB FUNCTIONS
//--------------------------------------//
window.startArcadeGame = function(type) {
    hideAllSections()
    console.log("Starting Arcade:", type);
    window.gameType = type;

    // 1. Get Active Groups
    const checkboxes = document.querySelectorAll('.group-checkbox:checked');
    const selectedGroups = Array.from(checkboxes).map(cb => cb.value);

    // 2. Select Source Data
    let sourceData = [];
    if (type === 'sentence-builder' || type === 'listening-match') {
        sourceData = (window.allSentences && window.allSentences.length > 0) ? window.allSentences : window.allWords;
    } else {
        // Flashcards and Image Match use Words (or both if you prefer)
        sourceData = window.allWords;
    }

    // 3. Filter
    let filteredList = sourceData;
    if (selectedGroups.length > 0) {
        filteredList = sourceData.filter(item => {
            const itemGroup = (item.group || 'Uncategorized').replace(/\s+/g, ''); 
            const targets = selectedGroups.map(s => s.replace(/\s+/g, ''));
            return targets.includes(itemGroup);
        });
    }
    if (filteredList.length === 0) filteredList = sourceData;

    if (type === 'image-match') {
        console.log("Image Match: Applying Noun Filter...");
        
        // Safety: Ensure 'pos' exists and check for "noun"
        const nounPool = filteredList.filter(w => {
            // Check if pos exists, convert to string (safe for arrays), lower case it
            const pos = w.pos ? String(w.pos).toLowerCase() : "";
            return pos.includes('noun');
        });

        if (nounPool.length > 0) {
            console.log(`Success: Found ${nounPool.length} nouns.`);
            filteredList = nounPool;
        } else {
            console.warn("⚠️ Warning: No words with 'pos: noun' found in selected groups.");
            console.warn("Falling back to full list. Please check your word data tags.");
            // Optional: If you want to force it to fail if no nouns, uncomment below:
            // alert("No nouns found in this group! Please add 'pos: noun' to your data.");
            // return window.returnToMenu();
        }
    }

    // 4. Randomize
    const limit = window.dailyLimit || 15;
    window.activeList = shuffleArray(filteredList).slice(0, limit);
    window.currentIndex = 0;
    window.currentStreak = 0;

    // 5. Hide Everything
    const screens = [
        'main-menu', 'flashcard-container', 'srs-controls', 'srs-exit',
        'builder-container', 'listening-game-wrapper', 'listening-game-container',
        'image-match-container', 'completion-modal'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    // 6. Show Game Area
    document.getElementById('game-area').classList.remove('hidden');

    // 7. Route
    if (type === 'sentence-builder') loadBuilderRound();
    else if (type === 'listening-match') loadListeningRound();
    else if (type === 'image-match') startImageMatchSession();

    if (window.updateProgress) window.updateProgress();
};

function startGameLogic() {
    loadAllWords();
    const checkboxes = document.querySelectorAll('.group-checkbox:checked');
    const selectedGroups = Array.from(checkboxes).map(cb => cb.value);
    let pool = [];

    if (currentMode === 'words' || currentMode === 'image-match') {
        pool = allWords.filter(w => {
            const itemGroup = (w.group || 'Uncategorized').trim();
            return selectedGroups.some(g => g.trim() === itemGroup);
        });
        
        // --- NEW: NOUN FILTER FOR IMAGE GAME ---
        if (currentMode === 'image-match') {
            // We strictly filter for words where 'pos' includes 'noun'
            // Example data: { hanzi: "猫", pos: "noun" }
            const nounPool = pool.filter(w => w.pos && w.pos.toLowerCase().includes('noun'));
            
            if (nounPool.length > 0) {
                pool = nounPool;
            } else {
                console.warn("Image Match: No nouns found in selected groups! (Check your 'pos' data). Falling back to full list.");
                // If data is missing POS tags, we fall back to the full list to prevent a crash.
            }
        }
    } else if (currentMode === 'sentences' || currentMode === 'sentence-builder' || currentMode === 'listening-match') {
        pool = allSentences.filter(s => selectedGroups.includes(s.group));
        if (pool.length === 0) {
             triggerConfirm("No sentences in selected groups. Use 'HSK1'?", () => {
                 pool = allSentences.filter(s => s.group === 'HSK1');
                 proceedWithPool(pool);
             });
             return;
        }
    }
    proceedWithPool(pool);
}

function proceedWithPool(pool) {
    const now = Date.now();
    
    // 1. shuffle logic (Inline, so it doesn't need external functions)
    let mixedPool = shuffleArray([...pool]);

    // 2. Select items based on mode
    if (currentMode === 'sentence-builder' || currentMode === 'image-match' || currentMode === 'listening-match') {
        // Arcade: Take top X random items
        activeList = mixedPool.slice(0, dailyLimit);
    } else {
        // Daily/Flashcards: Prioritize SRS Due items
        let dueItems = pool.filter(item => item.nextReview <= now);
        
        // Shuffle the due items too
        dueItems.sort(() => 0.5 - Math.random());
        
        activeList = dueItems.slice(0, dailyLimit);
        
        // If not enough due items, fill with random review items
        if (activeList.length < dailyLimit && pool.length > 0) {
             const filler = mixedPool
                .filter(item => !activeList.includes(item))
                .slice(0, dailyLimit - activeList.length);
             activeList = [...activeList, ...filler];
        }
    }
    
    activeList = pool.slice(0, dailyLimit);
    currentIndex = 0;
    
    
    window.activeList = activeList; 
    window.currentIndex = 0;
    window.currentIndex = 0;

    // 4. Safety Check
    if (activeList.length === 0) {
        // Use standard alert to be safe
        alert("No items found for this group!"); 
        return;
    }
    
    hideAllSections();
    document.getElementById('game-area').classList.remove('hidden');

    // Route to the specific modular loader
    if (currentMode === 'sentence-builder') {
        document.getElementById('builder-container').classList.remove('hidden');
        loadBuilderRound(); // From sentence-builder.js
    } else if (currentMode === 'image-match') {
        document.getElementById('image-match-container').classList.remove('hidden');
        startImageMatchSession(); // From image-match.js
    } else if (currentMode === 'listening-match') {
        document.getElementById('listening-game-container').classList.remove('hidden');
        loadListeningRound(); // From listening-match.js
    } else {
        document.getElementById('flashcard-container').classList.remove('hidden');
        startFlashcardSession(); // From flashcards.js
    }
}

// --- MAIN GAME LOOP ---

function reviewMissedWords() {
    const mistakes = gameSession.mistakes;
    if(!mistakes || mistakes.length === 0) return;
    
    // Start a new session using ONLY the mistakes
    gameSession = {
        isActive: true,
        queue: mistakes,
        currentStep: 0,
        totalSteps: mistakes.length,
        score: 0,
        mistakes: [] // Reset mistakes so we can clear them as we learn
    };
    
    renderGameRound();
}

// --- STANDARD FUNCTIONS ---
function loadCard() {
    const item = activeList[currentIndex];
    displayHanzi.textContent = item.hanzi || '(Error)';
    displayPinyin.textContent = item.pinyin || '(No Pinyin)';
    displayEnglish.textContent = item.english || '(No English)';
    displayGroup.textContent = item.group || 'General';
    displayHanzi.style.fontSize = (item.hanzi.length > 6) ? '4vh' : '8vh';
    cardElement.classList.remove('flipped');
    srsControls.classList.add('hidden');
    updateProgress();
}


// --- OPTIONAL: LOAD VOICES EARLY ---
// Chrome/Android loads voices asynchronously. This ensures they are ready 
// by the time the user clicks the button.
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Just logging to see what's available on your device
        // console.log("Voices loaded:", voices.filter(v => v.lang.includes('zh'))); 
    };
}
function toggleMagicInfo() { const popup = document.getElementById('magic-info-popup'); popup.classList.toggle('hidden'); if (!popup.classList.contains('hidden')) setTimeout(() => popup.classList.add('hidden'), 5000); }


document.addEventListener('click', function(e) {
    const popup = document.getElementById('mini-popup');
    if (!popup.classList.contains('hidden') && !e.target.classList.contains('clickable-word')) {
        popup.classList.add('hidden'); popup.classList.remove('show');
    }
});

export function hideAllSections() { 
    const sections = [
        menuSection,
        addWordSection, 
        wordListSection, 
        gameSection,
        document.getElementById('story-hub'), 
        document.getElementById('story-reader'),
        document.getElementById('arcade-hub'),
        document.getElementById('practice-hub'),
        document.getElementById('writer-container'),
        document.getElementById('chat-container')
    ];
    
    sections.forEach(sec => {
        if (sec) sec.classList.add('hidden'); 
    });
}

window.returnToMenu = function() {
    console.log("Returning to Menu...");
    window.gameType = null;
    
    // 1. KILL AUDIO (The Fix)
    // Stop any pending auto-play timers from games
    if (window.autoPlayTimer) {
        clearTimeout(window.autoPlayTimer);
        window.autoPlayTimer = null;
    }
    // Stop the voice engine immediately
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // 2. Hide Screens
    const ids = [
        'game-area', 
        'flashcard-container', 
        'listening-game-wrapper', 
        'listening-game-container',
        'image-match-container', 
        'builder-container', 
        'srs-controls', 
        'completion-modal',
        'word-list-section',
        'add-word-menu',
        'story-hub',
        'story-reader',
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // 3. Show Menu
    hideAllSections();
    document.getElementById('main-menu').classList.remove('hidden');
};


window.finishSession = function() { 
    console.log("Finishing Session...");
    
    // 1. Calculate Streak if Flashcards
    let streakMsg = "";
    
    if (window.gameType === 'flashcards' && dailySettings.type !== 'mix') {
        const type = dailySettings.type; // 'words' or 'sentences'
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem(`lastDate_${type}`);
        
        // If we haven't done it today yet, increment streak
        if (lastDate !== today) {
            let current = parseInt(localStorage.getItem(`streak_${type}`)) || 0;
            current++;
            localStorage.setItem(`streak_${type}`, current);
            localStorage.setItem(`lastDate_${type}`, today);
            
            streakMsg = `<div style="margin-top:10px; color:#e67e22; font-weight:bold; font-size:1.2rem;">🔥 ${current} Day Streak!</div>`;
        } else {
            // Already done today
            let current = parseInt(localStorage.getItem(`streak_${type}`)) || 0;
            streakMsg = `<div style="margin-top:10px; color:#e67e22; font-weight:bold;">🔥 Streak: ${current} Days</div>`;
        }
    }

    // 2. Custom Completion Modal Content
    const modal = document.getElementById('completion-modal');
    if (modal) {
        const content = modal.querySelector('.modal-content');
        // Save original button to restore it later/or re-create it
        content.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 10px;color: var(--primary);">Session Complete🏆 Great job!</div>
            ${streakMsg}
            <button class="btn primary full-width" style="margin-top:20px;" onclick="closeCompletionAndReturn()">Back to Menu</button>
        `;
        modal.classList.remove('hidden');
    }

    // 3. Clear game area screens
    const screens = [
        'game-area', 
        'flashcard-container', 
        'srs-controls',
        'builder-container', 
        'listening-game-wrapper', 
        'image-match-container'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    //if (window.triggerToast) window.triggerToast("Great job! Session saved. 🏆");
};

// Add this helper to close the modal
window.closeCompletionAndReturn = function() {
    document.getElementById('completion-modal').classList.add('hidden');
    window.returnToMenu();
};

function showAddWordMenu() { hideAllSections(); addWordSection.classList.remove('hidden'); }
function saveNewWord() { 
    const grp = document.getElementById('input-group').value.trim() || 'Custom';
    const hz = document.getElementById('input-hanzi').value.trim();
    const py = document.getElementById('input-pinyin').value.trim();
    const en = document.getElementById('input-english').value.trim();
    if(!hz) return triggerAlert("Hanzi is required!");
    
    const newW = { hanzi:hz, pinyin:py, english:en, group:grp, isCustom:true, nextReview:0 };
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords.push(newW);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    loadAllWords();
    returnToMenu();
} 
function showWordBank() { 
    loadAllWords(); 
    hideAllSections(); 
    wordListSection.classList.remove('hidden'); 
    wbGroupView.classList.remove('hidden'); 
    wbDetailView.classList.add('hidden'); 
    wbTitle.textContent = "Word Groups"; 
    wbGroupGrid.innerHTML = ''; 
    const combinedContent = [...allWords, ...allSentences]; 
    availableGroups.forEach(grp => { 
        const count = combinedContent.filter(w => w.group === grp).length; 
        const folder = document.createElement('div'); 
        folder.className = 'folder-card'; 
        folder.innerHTML = `<button class="folder-delete">✕</button><span class="folder-icon">📁</span><span class="folder-name">${grp}</span><span class="folder-count">${count} items</span>`; 
        folder.onclick = (e) => { 
            if(e.target.classList.contains('folder-delete')) { 
                triggerConfirm(`Delete group "${grp}"?`, () => deleteGroup(grp)); 
            } else { 
                openGroupDetail(grp); 
            } 
        }; 
        wbGroupGrid.appendChild(folder); 
    }); 
}

function openGroupDetail(groupName) { 
    currentViewingGroup = groupName; 
    wbGroupView.classList.add('hidden'); 
    wbDetailView.classList.remove('hidden'); 
    wbTitle.textContent = `Word Group - ${groupName}`; 
    searchInput.value = ''; 
    renderTable(groupName); 
    currentChartType = 'words'; 
    updateChartToggleUI(); 
    renderChart(groupName, 'words'); 
}

function backToFolders() { 
    currentViewingGroup = null; 
    wbGroupView.classList.remove('hidden'); 
    wbDetailView.classList.add('hidden'); 
    wbTitle.textContent = "Word Groups"; 
}

function renderTable(groupName) { 
    tableBody.innerHTML = ''; 
    const filter = searchInput.value.toLowerCase(); 
    
    // Merge words and sentences for the bank view
    const combinedContent = [...allWords, ...allSentences]; 
    
    const wordsToShow = combinedContent.filter(word => { 
        if (word.isHidden) return false; 
        return word.group === groupName && (word.english + word.hanzi + word.pinyin).toLowerCase().includes(filter); 
    }); 

    const now = Date.now();

    wordsToShow.forEach(word => { 
        const row = document.createElement('tr'); 
        const isSentence = allSentences.includes(word); 
        
        // --- SRS STATUS CALCULATION ---
        let statusHtml = '<span class="status-badge new">New</span>';
        if (word.nextReview && word.nextReview > 0) {
            if (word.nextReview <= now) {
                statusHtml = '<span class="status-badge due">Due</span>';
            } else {
                const hoursLeft = (word.nextReview - now) / (1000 * 60 * 60);
                if (hoursLeft > 48) {
                    const days = Math.round(hoursLeft / 24);
                    statusHtml = `<span class="status-badge strong">${days}d</span>`;
                } else {
                    const hours = Math.round(hoursLeft);
                    statusHtml = `<span class="status-badge weak">${hours}h</span>`;
                }
            }
        }

        // --- ROW HTML ---
        row.innerHTML = `
            <td><strong>${word.hanzi}</strong></td>
            <td class="desktop-only">${word.pinyin}</td>
            <td>${word.english}</td>
            <td>${statusHtml}</td>
            <td class="action-cell"></td>
        `;

        // --- ACTION BUTTONS (Writer + Delete) ---
        const actionCell = row.querySelector('.action-cell');

        // 1. Writer Button (Only for Words, not Sentences usually, but allow both if you want)
        // Checks if it's likely a word (short length) or just enables it for everything
        if (word.hanzi.length < 5) {
            const writeBtn = document.createElement('button');
            writeBtn.className = 'icon-btn write-btn';
            writeBtn.innerHTML = '🖌️';
            writeBtn.title = "Practice Writing";
            writeBtn.onclick = () => openWriterDirectly(word);
            actionCell.appendChild(writeBtn);
        }

        // 2. Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = () => { 
            const msg = `Remove "${word.hanzi}"?`; 
            triggerConfirm(msg, () => { 
                if (isSentence) deleteSentence(word.hanzi); else deleteWord(word.hanzi); 
            }); 
        }; 
        actionCell.appendChild(deleteBtn);

        tableBody.appendChild(row); 
    }); 
}

function updateChartMode(type) { 
    const wrapper = document.getElementById('chart-wrapper'); 
    wrapper.classList.remove('fade-graph'); 
    void wrapper.offsetWidth; 
    wrapper.classList.add('fade-graph'); 
    currentChartType = type; 
    updateChartToggleUI(); 
    if(currentViewingGroup) renderChart(currentViewingGroup, type); 
}

function updateChartToggleUI() { 
    document.getElementById('stat-btn-words').classList.toggle('active', currentChartType === 'words'); 
    document.getElementById('stat-btn-sentences').classList.toggle('active', currentChartType === 'sentences'); 
}

// In js/app.js - locate renderChart

function renderChart(groupName, type) { 
    let items = []; 
    if (type === 'words') items = allWords.filter(w => w.group === groupName && !w.isHidden); 
    else items = allSentences.filter(s => s.group === groupName); 
    
    const ctx = document.getElementById('progressChart').getContext('2d'); 
    const chartCanvas = document.getElementById('progressChart'); 
    const msgDiv = document.getElementById('chart-message'); 
    
    if (items.length === 0) { 
        if (myChart) myChart.destroy(); // Important: Kill old chart
        chartCanvas.style.display = 'none'; 
        msgDiv.classList.remove('hidden'); 
        msgDiv.textContent = `No ${type} in this group`; 
        return; 
    } 
    
    chartCanvas.style.display = 'block'; 
    msgDiv.classList.add('hidden'); 
    
    let strong = 0; 
    let weak = 0; 
    let notStudied = 0; 
    const now = Date.now(); 

    items.forEach(item => { 
        if (!item.nextReview || item.nextReview === 0) notStudied++; 
        else { 
            const diffHours = (item.nextReview - now) / (1000 * 60 * 60); 
            // Matches your Green/Orange/Red badges
            if (diffHours > 48) strong++; 
            else weak++; 
        } 
    }); 

    // CRITICAL: Destroy old chart instance before creating a new one
    if (myChart) myChart.destroy(); 
    
    myChart = new Chart(ctx, { 
        type: 'doughnut', 
        data: { 
            labels: ['Strong', 'Weak', 'New'], 
            datasets: [{ 
                data: [strong, weak, notStudied], 
                backgroundColor: ['#48bb78', '#ed8936', '#cbd5e0'], 
                borderWidth: 0 
            }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '70%', 
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } } 
        } 
    }); 
}

 // --- PROGRESS BAR HELPER ---
window.updateProgress = function() {
    const bar = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    
    // Safety check: if bar doesn't exist (e.g. hidden), stop
    if (!bar) return;

    const list = window.activeList || [];
    const total = list.length;
    
    // Prevent division by zero
    if (total === 0) {
        bar.style.width = '0%';
        if (text) text.textContent = '0 / 0';
        return;
    }

    // Calculate percentage based on current index
    const pct = (window.currentIndex / total) * 100;
    
    // Update UI
    bar.style.width = `${pct}%`;
    if (text) text.textContent = `${window.currentIndex} / ${total}`;
};

export function openArcadeHub() {
    hideAllSections(); // Hides main-menu, word-bank, etc.
    const arcadeHub = document.getElementById('arcade-hub');
    if (arcadeHub) {
        arcadeHub.classList.remove('hidden');
        console.log("🎮 Arcade Hub is now visible");
    } else {
        console.error("❌ Error: Could not find element with id 'arcade-hub'");
    }
}

export function openPracticeHub() {
    hideAllSections();
    const practiceHub = document.getElementById('practice-hub');
    if (practiceHub) {
        practiceHub.classList.remove('hidden');
        console.log("🏮 Practice Hub is now visible");
    } else {
        console.error("❌ Error: Could not find element with id 'practice-hub'");
    }
}

function deleteGroup(groupName) { 
    // 1. Delete Words
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || []; 
    customWords = customWords.filter(w => w.group !== groupName); 
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords)); 
    
    // 2. Delete Sentences
    let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || []; 
    customSentences = customSentences.filter(s => s.group !== groupName); 
    localStorage.setItem('myCustomSentences', JSON.stringify(customSentences)); 

    // 3. NEW: Delete Stories
    let customStories = JSON.parse(localStorage.getItem('myCustomStories')) || [];
    // Ensure it's an array before filtering
    if (Array.isArray(customStories)) {
        const originalLength = customStories.length;
        customStories = customStories.filter(s => s.group !== groupName);
        
        // Only save if we actually deleted something
        if (customStories.length !== originalLength) {
            localStorage.setItem('myCustomStories', JSON.stringify(customStories));
        }
    if (window.triggerToast) {
        window.triggerToast(`Deleted group "${groupName}" and its stories.`);
    }
    }

    // 4. Refresh Everything
    loadAllWords(); // This reloads words, sentences, AND stories into memory
    updateGroupList(); 
    
    // Refresh the Word Group UI
    showWordBank(); 
    
    triggerToast(`Deleted group "${groupName}" and its stories.`);
}

function deleteWord(hanziToDelete) { 
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || []; 
    customWords = customWords.filter(w => w.hanzi !== hanziToDelete); 
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords)); 
    loadAllWords(); 
    if (currentViewingGroup) { renderTable(currentViewingGroup); renderChart(currentViewingGroup, 'words'); } 
}

function deleteSentence(hanziToDelete) { 
    let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || []; 
    customSentences = customSentences.filter(s => s.hanzi !== hanziToDelete); 
    localStorage.setItem('myCustomSentences', JSON.stringify(customSentences)); 
    loadAllWords(); 
    if (currentViewingGroup) { renderTable(currentViewingGroup); renderChart(currentViewingGroup, 'sentences'); } 
}

// --- READER LOGIC ---

// js/app.js

window.refreshStories = function() {
    console.log("🔄 Syncing Story Data...");
    
    // 1. Merge Data
    const premade = [...storyData]; 
    const customJSON = localStorage.getItem('myCustomStories');
    const custom = customJSON ? JSON.parse(customJSON) : [];
    window.allStories = [...premade, ...custom];

    // 2. Redraw the folders ONLY if the hub is already visible
    // We call showStep1 directly instead of openStoryHub to avoid the loop
    const hub = document.getElementById('story-hub');
    if (hub && !hub.classList.contains('hidden')) {
        if (typeof showStep1 === 'function') {
            showStep1(); // Just redraw the folders, don't trigger navigation logic
        }
    }
};

let gameSession = {
    isActive: false,
    queue: [],       // The 10 words chosen for this session
    currentStep: 0,  // Current round (0-9)
    totalSteps: 10,
    score: 0,
    mistakes: []
};
/**
 * Advanced TTS handler that highlights words as they are spoken.
 * Note: 'onboundary' precision depends on the browser/device.
 */
/**
 * Advanced TTS Engine with "Click-to-Seek"
 * @param {string} text - The full story text
 * @param {number} startIndex - Character index to start reading from (0 = beginning)
 * @param {function} onEndCallback - Function to run when audio finishes
 */


// script.js - Add at the very bottom
function filterTable() {
    // 1. Get the filter value
    const input = document.getElementById('search-bar');
    const filter = input.value.toLowerCase();
    
    // 2. Get the table rows
    const tbody = document.getElementById('word-table-body');
    const rows = tbody.getElementsByTagName('tr');

    // 3. Loop through rows
    for (let i = 0; i < rows.length; i++) {
        // Cells: 0=Hanzi, 1=Pinyin, 2=English
        const hanziCell = rows[i].getElementsByTagName('td')[0];
        const pinyinCell = rows[i].getElementsByTagName('td')[1];
        const englishCell = rows[i].getElementsByTagName('td')[2];

        if (hanziCell && englishCell) {
            const hanziText = hanziCell.textContent || hanziCell.innerText;
            const pinyinText = pinyinCell.textContent || pinyinCell.innerText;
            const englishText = englishCell.textContent || englishCell.innerText;

            // Check if ANY of the columns match the search
            if (hanziText.toLowerCase().indexOf(filter) > -1 || 
                englishText.toLowerCase().indexOf(filter) > -1 ||
                pinyinText.toLowerCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }       
    }
}



window.addEventListener('focus', async () => {
    try {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();

        // 1. Check for Groq Key
        if (trimmed.startsWith('gsk_') && trimmed.length > 20) {
            const currentGroq = localStorage.getItem('groqApiKey');
            
            if (currentGroq !== trimmed) {
                triggerConfirm("🚀 Groq API Key detected! Save it?", () => {
                    localStorage.setItem('groqApiKey', trimmed);
                    triggerToast("Groq Key Saved! Fast chat enabled.");
                    
                    const input = document.getElementById('input-groq-key');
                    if(input) input.value = trimmed;

                    // AUTO-CLOSE THE INSTRUCTIONS MODAL
                    const instructions = document.getElementById('groq-instructions-modal');
                    if(instructions) instructions.classList.add('hidden');
                });
            }
        }

        // 2. Check for Gemini Key
        else if (trimmed.startsWith('AIza') && trimmed.length > 30) {
            const currentGemini = localStorage.getItem('geminiApiKey');
            
            if (currentGemini !== trimmed) {
                triggerConfirm("✨ Gemini API Key detected! Save it?", () => {
                    localStorage.setItem('geminiApiKey', trimmed);
                    triggerToast("Gemini Key Saved!");
                    
                    const input = document.getElementById('input-api-key');
                    if(input) input.value = trimmed;
                });
            }
        }

    } catch (err) {
        console.log("Clipboard check skipped.");
    }
});

function showClipboardPopup(detectedKey) {
    triggerConfirm(`🚀 API Key detected in clipboard! Would you like to save it to enable Magic Import?`, () => {
        localStorage.setItem('geminiApiKey', detectedKey);
        if (window.triggerToast) window.triggerToast("✅ Key saved! Magic Import is ready.");
        // Refresh settings UI if open
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) openSettings();
    });
}



// --- FIXED GLOBAL SEARCH ---

window.openGlobalSearch = function() {
    document.getElementById('main-menu').classList.add('hidden');
    const modal = document.getElementById('global-search-modal');
    modal.classList.remove('hidden');
    
    // Reset UI
    document.getElementById('global-search-input').value = '';
    document.getElementById('global-search-body').innerHTML = '';
    document.getElementById('global-search-empty').classList.remove('hidden');
    
    // Focus after a tiny delay to allow render
    setTimeout(() => document.getElementById('global-search-input').focus(), 50);
};

window.closeGlobalSearch = function() {
    document.getElementById('global-search-modal').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
};

window.handleGlobalSearch = function() {
    const query = document.getElementById('global-search-input').value.toLowerCase().trim();
    const tbody = document.getElementById('global-search-body');
    const emptyMsg = document.getElementById('global-search-empty');

    if (!query) {
        tbody.innerHTML = '';
        emptyMsg.textContent = "Type something to search...";
        emptyMsg.classList.remove('hidden');
        return;
    }

    const pool = window.allWords || [];
    const hits = [];
    const seenHanzi = new Set();

    pool.forEach(w => {
        if (seenHanzi.has(w.hanzi)) return;

        // Strict "Starts With" Logic
        const match = (w.hanzi && w.hanzi.startsWith(query)) ||
                      (w.pinyin && w.pinyin.toLowerCase().startsWith(query)) ||
                      (w.english && w.english.toLowerCase().startsWith(query));

        if (match) {
            seenHanzi.add(w.hanzi);
            hits.push(w);
        }
    });

    if (hits.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.textContent = "No results found.";
        emptyMsg.classList.remove('hidden');
        return;
    }

    emptyMsg.classList.add('hidden');
    tbody.innerHTML = '';

    hits.forEach(word => {
        const tr = document.createElement('tr');
        
        let dueText = "New";
        if (word.nextReview) {
            const diff = word.nextReview - Date.now();
            dueText = diff <= 0 ? "Now" : Math.ceil(diff / 86400000) + "d";
        }

        // --- WIDTH ADJUSTMENTS HERE ---
        // 1. Due: Reduced from 10% -> 8%
        // 2. Practice (last column): Increased from 10% -> 15%
        tr.innerHTML = `
            <td style="font-weight:bold; font-size:1.1rem; width:15%; text-align:center;">${word.hanzi}</td>
            <td class="desktop-only" style="color:#666; width:15%; text-align:center;">${word.pinyin || ''}</td>
            <td style="width:auto; text-align:center;">${word.english}</td>
            <td style="font-size:0.8rem; color:${dueText === 'Now' ? 'red' : '#999'}; width:8%; text-align:center;">${dueText}</td>
            <td style="font-size:0.85rem; color:var(--primary); font-weight:bold; width:15%; text-align:center;">${word.group || 'General'}</td>
            <td style="width:15%; text-align:center;">
                <button class="btn sm-ghost" onclick="window.openWriterDirectly('${word.hanzi}')">✍️ Practice</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// --- FIXED GLOBAL TRANSLATOR ---

window.openGlobalTranslator = function() {
    document.getElementById('global-translator-modal').classList.remove('hidden');
    document.getElementById('trans-input').value = '';
    document.getElementById('trans-result-box').classList.add('hidden');
    setTimeout(() => document.getElementById('trans-input').focus(), 50);
};

window.closeGlobalTranslator = function() {
    document.getElementById('global-translator-modal').classList.add('hidden');
};

window.runGlobalTranslation = async function() {
    const text = document.getElementById('trans-input').value.trim();
    if (!text) return;

    // 1. Detect Language (True if input contains Chinese characters)
    const isChineseInput = /[\u4e00-\u9fa5]/.test(text);

    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey) {
        triggerAlert("Please save your Groq API Key in Settings first!");
        return;
    }

    const btn = document.getElementById('btn-global-trans');
    const originalText = btn.textContent;
    btn.textContent = "Translating...";
    btn.disabled = true;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "system",
                    content: `You are a translator helper.
                    
                    TASK:
                    1. Analyze the input.
                    2. If input is English -> Translate to Chinese (Hanzi).
                    3. If input is Chinese -> Translate to English.
                    4. Provide 2-3 alternative translations if applicable.

                    IMPORTANT:
                    For "alternatives", ALWAYS include the Hanzi characters followed by Pinyin in parentheses.

                    REQUIRED JSON FORMAT:
                    {
                        "hanzi": "Primary Chinese translation",
                        "pinyin": "Pinyin with tones",
                        "english": "Primary English translation",
                        "alternatives": "String listing others. Format: 'Hanzi (Pinyin)'. Example: 'Also: 你好 (nǐ hǎo), 您好 (nín hǎo)'"
                    }`
                }, {
                    role: "user",
                    content: `Translate this: "${text}"`
                }]
            })
        });

        const data = await response.json();
        const rawContent = data.choices[0].message.content;
        
        // Clean JSON
        let cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
        }
        
        const result = JSON.parse(cleanJson);

        // --- UI UPDATE ---
        const resultBox = document.getElementById('trans-result-box');
        const mainText = document.getElementById('trans-result-text');
        const subText = document.getElementById('trans-result-sub');

        let mainHtml = '';
        let subHtml = '';

        if (isChineseInput) {
            // User typed Chinese -> Show English Big
            mainHtml = `
                <div style="font-size: 0.8rem; color: #999; margin-bottom: 5px;">English:</div>
                <div style="font-size: 1.8rem; color: #333; font-weight: bold;">${result.english}</div>
            `;
            subHtml = `
                <div style="font-size: 1.2rem; color: var(--primary); margin-bottom: 8px;">${result.pinyin}</div>
            `;
        } else {
            // User typed English -> Show Hanzi Big
            mainHtml = `
                <div style="font-size: 0.8rem; color: #999; margin-bottom: 5px;">Chinese:</div>
                <div style="font-size: 2.5rem; color: var(--primary); font-weight: bold;">${result.hanzi}</div>
            `;
            subHtml = `
                <div style="font-size: 1.2rem; color: #555; margin-bottom: 8px;">${result.pinyin}</div>
            `;
        }

        // Alternatives (Now with Hanzi included due to prompt change)
        if (result.alternatives) {
            subHtml += `
                <div style="font-size: 0.95rem; color: #666; border-top: 1px solid #eee; padding-top: 8px; margin-top: 5px; line-height: 1.4;">
                    <span style="font-weight:bold; color:#999; font-size:0.8rem;">Alternatives:</span><br>
                    ${result.alternatives}
                </div>
            `;
        }

        mainText.innerHTML = mainHtml;
        subText.innerHTML = subHtml;
        resultBox.classList.remove('hidden');

    } catch (err) {
        console.error("Translation Error:", err);
        document.getElementById('trans-result-text').innerHTML = `<span style="color:red">Translation failed.</span>`;
        document.getElementById('trans-result-sub').innerHTML = "";
        document.getElementById('trans-result-box').classList.remove('hidden');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

// --- NEW GROUP SELECTION LOGIC ---

window.openGroupSelection = function() {
    // Hide menu, show selection screen
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('group-selection-modal').classList.remove('hidden');
    
    // Ensure the list is rendered (in case new groups were added)
    renderGroupRows(); 
};

window.closeGroupSelection = function() {
    document.getElementById('group-selection-modal').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
};

function renderGroupRows() {
    const container = document.getElementById('group-toggle-list');
    if (!container) return;

    // 1. Get saved preferences (or default to empty if new user)
    const savedJSON = localStorage.getItem('selectedGroupPreferences');
    const savedList = savedJSON ? JSON.parse(savedJSON) : null;

    container.innerHTML = ''; 
    
    availableGroups.forEach(grp => {
        const row = document.createElement('div');
        row.className = 'group-row';
        
        // 2. Determine if checked:
        // - If no save file exists (first run), default to TRUE (Checked).
        // - If save file exists, check if 'grp' is in it.
        const isChecked = savedList ? savedList.includes(grp) : true;

        row.innerHTML = `
            <span class="group-label">${grp}</span>
            <label class="switch">
                <input type="checkbox" class="group-checkbox" value="${grp}" 
                       ${isChecked ? 'checked' : ''} 
                       onchange="window.saveGroupPreferences()">
                <span class="slider"></span>
            </label>
        `;
        container.appendChild(row);
    });
}


window.saveGroupPreferences = function() {
    const checkboxes = document.querySelectorAll('.group-checkbox:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    localStorage.setItem('selectedGroupPreferences', JSON.stringify(selected));
};

// --- NEW: Toggle All ---
window.toggleAllGroups = function(forceState) {
    const inputs = document.querySelectorAll('.group-checkbox');
    inputs.forEach(input => {
        input.checked = forceState;
    });
    // Save the new state immediately
    window.saveGroupPreferences();
};


// ==========================================
// EXPOSE FUNCTIONS TO HTML (The Wiring)
// ==========================================

// --- CORE UTILITIES (Fixes Close/Cancel buttons) ---
window.closeModal = closeModal;       
window.hideToast = hideToast;         
window.triggerAlert = triggerAlert; 
window.triggerConfirm = triggerConfirm;

// --- Main Menu & Settings ---
window.openSettings = openSettings;
window.saveGeminiKey = saveGeminiKey;
window.saveGroqKey = saveGroqKey;
window.removeGeminiKey = removeGeminiKey;
window.removeGroqKey = removeGroqKey;
window.showAddWordMenu = showAddWordMenu;
window.saveNewWord = saveNewWord;
window.returnToMenu = returnToMenu;
window.toggleMagicInfo = toggleMagicInfo;

// --- Arcade & Game Start ---
window.startArcadeGame = startArcadeGame;
window.checkSpecificDailyStatus = checkSpecificDailyStatus;
window.forceStartExtraSession = forceStartExtraSession;
window.setLimitAndStart = setLimitAndStart;

// --- Flashcards & SRS ---
window.flipCard = flipCard;
window.loadCard = loadCard; 
window.speakChinese = speakChinese; 
window.dailySettings = dailySettings;

// --- Word Group & Data Management ---
window.showWordBank = showWordBank;
window.backToFolders = backToFolders;
window.openGroupDetail = openGroupDetail; // Needed if HTML onclicks use it
window.deleteGroup = deleteGroup;
window.deleteWord = deleteWord;
window.deleteSentence = deleteSentence;
window.updateChartMode = updateChartMode; // Fixes the Pie Chart toggle
window.filterTable = filterTable;         // Fixes the Search Bar typing

// --- Story Mode & Reader ---
window.openStoryHub = openStoryHub;
window.backToStoryGroups = backToStoryGroups;
window.filterStories = filterStories;
window.backToDifficulty = backToDifficulty;
window.openReader = openReader;
window.closeStoryReader = closeStoryReader;
window.togglePinyin = togglePinyin;
window.toggleTranslation = toggleTranslation;
window.closeStoryModal = closeStoryModal; // Fixes the word lookup popup close button

// --- Magic Import (PDF Upload) ---
window.minimizeLoading = minimizeLoading;
window.triggerMagicUpload = triggerMagicUpload;
window.handleMagicUpload = handleMagicUpload;
window.confirmMagicUpload = confirmMagicUpload;
window.cancelMagicUpload = cancelMagicUpload;

// --- Game Specifics ---
window.reviewMissedWords = reviewMissedWords; 
window.startImageMatchSession = startImageMatchSession; // "New Round" button
window.checkBuilderAnswer = checkBuilderAnswer;
window.showInterimMessage = showInterimMessage;
window.playGameSound = playGameSound
window.openSettings = openSettings;
window.activeList = activeList;

//--listening match--
window.currentIndex = currentIndex;
window.currentStreak = currentStreak;
window.listeningRoundCount = listeningRoundCount;
window.updateProgress = updateProgress;
window.dailyLimit = dailyLimit;  
window.currentMode = currentMode;
window.allWords = allWords
window.allStories = window.allStories || [];
window.loadListeningRound = loadListeningRound;
window.checkListeningAnswer = checkListeningAnswer;
window.loadBuilderRound = loadBuilderRound;
window.shuffleArray = shuffleArray;

//flashcard exposes
window.flipCard = flipCard;
window.rateWord = rateWord;
window.openDailyModeSelection = openDailyModeSelection;
window.setDailyType = setDailyType;       
window.confirmDailyStart = confirmDailyStart;
window.startFlashcardSession = startFlashcardSession;
window.playCardAudio = playCardAudio;

//reader exposes
window.openStoryHub = openStoryHub;
window.backToStoryGroups = backToStoryGroups;
window.filterStories = filterStories;
window.backToDifficulty = backToDifficulty;
window.openReader = openReader;
window.closeStoryReader = closeStoryReader;
window.togglePinyin = togglePinyin;
window.toggleTranslation = toggleTranslation;
window.playStoryAudio = playStoryAudio;
window.closeStoryModal = closeStoryModal;
window.stopStoryAudio = stopStoryAudio;
window.updateTTSRate = updateTTSRate;

//hubs exposes
window.openArcadeHub = openArcadeHub;
window.openPracticeHub = openPracticeHub;

//writer exposes
window.openWriterHub = openWriterHub;
window.animateCharacter = animateCharacter;
window.resetCanvas = resetCanvas;
window.openWriterDirectly = openWriterDirectly

//chat pal exposes
window.openChatHub = openChatHub;
window.handleUserSend = handleUserSend;
window.updateChatSpeed = updateChatSpeed;
window.startListening = toggleListening;
window.triggerQuizSetup = triggerQuizSetup;
window.startQuiz = startQuiz;
window.toggleChatSettings = toggleChatSettings;


// OPTIONAL: Add a quick lookup function if not already there
window.triggerWordLookup = function(char) {
    // (You can copy the simple lookup logic here or import it)
    alert("Looking up: " + char); // Placeholder until we connect your lookup modal
};