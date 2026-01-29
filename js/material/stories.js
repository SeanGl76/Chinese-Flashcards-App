import { speakChinese } from '../core/audio.js'; 
import { hideAllSections } from '../app.js';
import { playBGM, stopBGM} from '../core/audio.js';

// --- STATE VARIABLES ---
let selectedGroup = null;
let selectedDifficulty = null;
let currentStory = null;

// TTS & Metronome State
let storySentences = [];
let fullStoryText = "";
let wordMap = []; 
let currentSentenceIdx = 0;
let currentPlaybackIndex = 0;
let isPaused = true;
let isSegmentPainted = false;
let metronomeTimer = null;
let currentUtterance = null;
let ttsRate = 0.8;
let ttsOffset = 0;

// --- SESSION TRACKER ---
let currentSpeechSessionId = 0;

// Config Constants
const BASE_CHAR_TIME = 200; 
const COMMA_BREAK_MS = 50;
const SENTENCE_BREAK_MS = 200;
const AUDIO_STARTUP_DELAY = 100;

// --- SILENT GHOST SOUND ---
const SILENT_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

// --- 1. NAVIGATION & HUB ---

export function openStoryHub() {
    if (typeof hideAllSections === 'function') hideAllSections();
    else if (window.hideAllSections) window.hideAllSections();

    if (window.refreshStories) window.refreshStories(); 
    
    const hub = document.getElementById('story-hub');
    if (hub) hub.classList.remove('hidden');
    showStep1();
}

function showStep1() {
    document.getElementById('story-step-1').classList.remove('hidden');
    document.getElementById('story-step-2').classList.add('hidden');
    document.getElementById('story-step-3').classList.add('hidden');

    const container = document.getElementById('story-group-list');
    container.innerHTML = '';

    const allStories = window.allStories || [];
    const uniqueGroups = [...new Set(allStories.map(s => s.group))];

    if (uniqueGroups.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">No stories found. Import a PDF to begin!</p>';
        return;
    }

    uniqueGroups.forEach(groupName => {
        const count = allStories.filter(s => s.group === groupName).length;
        const icon = groupName.toLowerCase().includes('hsk') ? '🏆' : '✨';
        
        const div = document.createElement('div');
        div.className = 'folder-card';
        div.innerHTML = `
            <div class="folder-icon">${icon}</div>
            <div class="folder-name">${groupName}</div>
            <div style="font-size:0.8rem; color:#999;">${count} stories</div>
        `;
        div.onclick = () => selectGroup(groupName);
        container.appendChild(div);
    });
}

function selectGroup(groupId) {
    selectedGroup = groupId;
    document.getElementById('story-step-1').classList.add('hidden');
    document.getElementById('story-step-2').classList.remove('hidden');
}

export function backToStoryGroups() {
    selectedGroup = null;
    showStep1();
}

export function filterStories(difficulty) {
    selectedDifficulty = difficulty;
    document.getElementById('story-step-2').classList.add('hidden');
    document.getElementById('story-step-3').classList.remove('hidden');
    renderStoryList();
}

export function backToDifficulty() {
    selectedDifficulty = null;
    document.getElementById('story-step-3').classList.add('hidden');
    document.getElementById('story-step-2').classList.remove('hidden');
}

function renderStoryList() {
    const container = document.getElementById('story-list-container');
    container.innerHTML = '';

    const stories = (window.allStories || []).filter(s => 
        s.group === selectedGroup && s.difficulty === selectedDifficulty
    );

    if (stories.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#999; margin-top:20px;">No stories found.</p>`;
        return;
    }

    stories.forEach(story => {
        const btn = document.createElement('button');
        // CHANGED: From 'btn ghost full-width' to 'btn secondary full-width'
        btn.className = 'btn secondary full-width'; 
        // Kept the split layout (Title Left / Status Right) as it's better for reading lists
        btn.style.cssText = "justify-content: space-between; margin-bottom: 8px; text-align: left; padding: 15px;";
        btn.innerHTML = `<span>${story.title}</span><span style="font-size:0.8rem; opacity: 0.7;">Read</span>`;
        btn.onclick = () => openReader(story);
        container.appendChild(btn);
    });
}

// --- 2. READER & LOGIC ---

export function openReader(story) {
    stopBGM();
    window.shouldPlayBGM = false;
    currentStory = story;
    document.getElementById('story-hub').classList.add('hidden');
    document.getElementById('story-reader').classList.remove('hidden');
    const currentSpeed = document.getElementById('tts-speed').value;
    updateTTSRate(currentSpeed);

    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-title-en').textContent = story.englishTitle || "";

    let liveBox = document.getElementById('story-live-translation');
    if (!liveBox) {
        liveBox = document.createElement('div');
        liveBox.id = 'story-live-translation';
        liveBox.className = 'hidden'; // Hidden by default
        // Insert it after the English Title
        document.getElementById('story-title-en').after(liveBox);
    }
    liveBox.textContent = ""; // Clear old text
    liveBox.classList.add('hidden');
    document.getElementById('btn-toggle-trans').classList.remove('active'); // Reset button

    fullStoryText = story.content;
    storySentences = parseSentences(story.content);

    // --- PREPARE LIVE TRANSLATION DATA ---
    window.englishSegments = [];
    
    if (story.storyPairs) {
        // AI Stories: They are already aligned sentence-by-sentence.
        // We just map them directly.
        window.englishSegments = story.storyPairs.map(p => p.english);
        // Note: AI stories might not support comma-level updates unless we process them further, 
        // but this keeps them safe.
    } else {
        // Premade Stories: Split the big translation block by commas
        window.englishSegments = getEnglishSegments(story.translation || "");
    }
    // -------------------------------------

    const hanziBox = document.getElementById('story-text-hanzi');
    hanziBox.innerHTML = makeTextInteractive(story.content);

    buildWordMap(hanziBox);

    window.fullStoryText = story.content;

    let pressTimer = null;
    let isLongPress = false;
    let startX = 0;
    let startY = 0;

    const handleStart = (e) => {
        // Only interact with word spans
        if (e.target.tagName !== 'SPAN') return;

        isLongPress = false;
        
        // Store coordinates to detect if user is just scrolling
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }

        // Start 500ms timer for Long Press
        pressTimer = setTimeout(() => {
            isLongPress = true;
            
            // --- LONG PRESS ACTION (Lookup Modal) ---
            const targetText = e.target.textContent;
            const mapEntry = wordMap.find(entry => entry.element === e.target);
            const realIndex = mapEntry ? mapEntry.start : -1;

            if (realIndex !== -1) {
                if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
                lookupWordInStory(targetText, realIndex);
            }
        }, 500);
    };

    const handleMove = (e) => {
        if (!pressTimer) return;
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // If moved more than 10px, treat as scrolling and cancel the press
        if (Math.abs(clientX - startX) > 10 || Math.abs(clientY - startY) > 10) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handleEnd = (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }

        // --- SHORT CLICK ACTION (Jump Audio) ---
        // If it wasn't a long press (and wasn't cancelled by scrolling)
        if (!isLongPress && e.target.tagName === 'SPAN') {
            const mapEntry = wordMap.find(entry => entry.element === e.target);
            const realIndex = mapEntry ? mapEntry.start : -1;
            
            if (realIndex !== -1) {
                jumpToWord(realIndex);
            }
        }
    };

    // Remove old handler
    hanziBox.onclick = null; 

    // Attach new robust listeners
    const opts = { passive: true };
    hanziBox.addEventListener('touchstart', handleStart, opts);
    hanziBox.addEventListener('touchmove', handleMove, opts);
    hanziBox.addEventListener('touchend', handleEnd);
    
    hanziBox.addEventListener('mousedown', handleStart);
    hanziBox.addEventListener('mousemove', handleMove);
    hanziBox.addEventListener('mouseup', handleEnd);

    document.getElementById('story-text-pinyin').classList.add('hidden');
    document.getElementById('story-text-english').classList.add('hidden');
    
    // Hard reset
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearTimeout(metronomeTimer);
    isPaused = true;
    currentSpeechSessionId++; 

    const qContainer = document.getElementById('questions-container');
    if (qContainer) {
        qContainer.innerHTML = ''; 
        if (story.questions && story.questions.length > 0) {
            story.questions.forEach((qObj, i) => {
                const qDiv = document.createElement('div');
                qDiv.style.cssText = 'background:#f8f9fa; padding:18px; border-radius:12px; margin-bottom:15px; border: 1px solid #eee;';
                qDiv.innerHTML = `
                    <p style="font-weight:bold; margin: 0 0 10px 0; color: #2d3436; line-height: 1.4;">${qObj.q}</p>
                    <button class="btn sm-ghost" 
                            style="color: var(--primary); font-weight: bold; padding: 0; margin-bottom: 5px;" 
                            onclick="this.nextElementSibling.classList.toggle('hidden'); this.textContent = this.nextElementSibling.classList.contains('hidden') ? 'Show answer' : 'Hide answer';">
                        Show answer
                    </button>
                    <div class="hidden" style="color: var(--success); margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd; font-style: italic;">
                        ${qObj.a}
                    </div>
                `;
                qContainer.appendChild(qDiv);
            });
        } else {
            qContainer.innerHTML = '<p style="color:#999; font-style:italic;">No questions available for this story.</p>';
        }
    }
}

export function closeStoryReader() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearTimeout(metronomeTimer);
    isPaused = true;
    currentSpeechSessionId++;
    document.getElementById('story-reader').classList.add('hidden');
    document.getElementById('story-hub').classList.remove('hidden');
}

// --- 3. TEXT PROCESSING HELPERS ---

function makeTextInteractive(rawText) {
    const allWords = window.allWords || [];
    let processedText = rawText;
    const tokens = [];

    const sortedVocab = [...allWords].sort((a, b) => b.hanzi.length - a.hanzi.length);


    sortedVocab.forEach((item) => {
        if (item.hanzi.length < 1) return; 
        const safeHanzi = item.hanzi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeHanzi, 'g');

        processedText = processedText.replace(regex, (match) => {
            const token = `##TOKEN_${tokens.length}##`;
            const pinyinAttr = item.pinyin ? `data-pinyin="${item.pinyin}"` : '';
            tokens.push({ 
                id: token, 
                html: `<span class="story-word interactive" data-word="${match}" ${pinyinAttr}>${match}</span>`
            });
            return token;
        });
    });

    let finalHtml = "";
    const remainingParts = processedText.split(/(##TOKEN_\d+##)/);
    
    remainingParts.forEach(part => {
        if (part.startsWith("##TOKEN_")) {
            const tokenObj = tokens.find(t => t.id === part);
            finalHtml += tokenObj ? tokenObj.html : "";
        } else {
            for (const char of part) {
                finalHtml += `<span class="story-word unknown-word">${char}</span>`;
            }
        }
    });

    return finalHtml;
}

function parseSentences(fullText) {
    const sentences = [];
    let currentStart = 0;
    const enders = ['。', '！', '？', '.', '!', '?', '\n'];
    
    for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];
        if (enders.includes(char)) {
            const chunk = fullText.substring(currentStart, i + 1);
            sentences.push({
                text: chunk,
                start: currentStart,
                end: i + 1
            });
            currentStart = i + 1;
        }
    }
    
    if (currentStart < fullText.length) {
        sentences.push({
            text: fullText.substring(currentStart),
            start: currentStart,
            end: fullText.length
        });
    }
    return sentences;
}

function buildWordMap(container) {
    wordMap = [];
    let runningIndex = 0;
    function traverse(node) {
        if (node.nodeType === 3) {
            const len = node.nodeValue.length;
            runningIndex += len;
        } else if (node.nodeType === 1) {
            const text = node.textContent;
            const start = runningIndex;
            const end = runningIndex + text.length;
            wordMap.push({ element: node, start: start, end: end });
            runningIndex += text.length;
        }
    }
    container.childNodes.forEach(child => traverse(child));
}

// --- 4. DICTIONARY LOOKUP ---

// --- 4. DICTIONARY LOOKUP & CONTEXT SCAN ---

// NEW: Local Scanner (Checks database for longer words nearby)
function scanLocalContext(centerChar, text, index) {
    const matches = [];
    const allWords = window.allWords || [];
    if (!text || index < 0) return matches;

    // Helper: Find word in DB
    const findMatch = (str) => allWords.find(w => w.hanzi === str);

    // 1. Expand LEFT (e.g. Text: "做决定", Click: "定" -> Finds "决定")
    let str = centerChar;
    for (let i = 1; i <= 3; i++) {
        if (index - i < 0) break;
        const char = text[index - i];
        if (/[，。！？：；\n]/.test(char)) break;
        
        str = char + str; // Prepend
        const match = findMatch(str);
        if (match) matches.push(match);
    }

    // 2. Expand RIGHT (e.g. Text: "定下来", Click: "定" -> Finds "定下")
    str = centerChar;
    for (let i = 1; i <= 3; i++) {
        if (index + i >= text.length) break;
        const char = text[index + i];
        if (/[，。！？：；\n]/.test(char)) break;
        
        str = str + char; // Append
        const match = findMatch(str);
        if (match) matches.push(match);
    }

    return matches;
}

export function lookupWordInStory(wordChar, index) {
    const allWords = window.allWords;
    const allSentences = window.allSentences;
    
    // 1. Find Main Word Data
    let wordData = allWords.find(item => item.hanzi === wordChar);
    if (wordData) {
        wordData = { ...wordData }; // Clone to avoid mutation issues
    } else {
        wordData = { hanzi: wordChar, pinyin: '', english: 'Unknown', sentence: null };
    }

    // 2. Try to find an example sentence if missing
    if (!wordData.sentence && allSentences) {
        const foundSentence = allSentences.find(s => s.hanzi.includes(wordChar));
        wordData.sentence = foundSentence || null;
    }

    // 3. RUN LOCAL CONTEXT SCAN
    // This checks if the character is part of a longer Known Word in this specific text
    const contextMatches = scanLocalContext(wordChar, window.fullStoryText, index);
    
    // 4. Open Modal with Extras
    showStoryModal(wordData, window.fullStoryText, index, contextMatches);
}

export function showStoryModal(wordData, fullStoryText = "", index = 0) {
    let modal = document.getElementById('story-lookup-modal');
    
    if (!modal) {
        const modalHTML = `
            <div id="story-lookup-modal" class="modal-overlay hidden" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:100;">
                <div class="modal-content" style="background:white; padding:20px; border-radius:15px; width:90%; max-width:350px; position:relative;">
                    <button onclick="closeStoryModal()" class="close-btn" style="position:absolute; top:10px; right:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    
                    <h2 id="story-modal-word" style="font-size: 2.5em; margin: 10px 0; text-align:center; color:#333;"></h2>
                    <p id="story-modal-pinyin" style="color: var(--primary); font-weight:bold; text-align:center; font-size:1.2rem;"></p>
                    <p id="story-modal-translation" style="font-weight: bold; font-size: 1.1em; text-align:center; color:#555; margin-bottom:15px;"></p>
                    
                    <div id="story-modal-actions" style="display:flex; gap:10px; margin-bottom:15px;"></div>

                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                    <div id="story-modal-sentence-container" class="hidden" style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <p id="modal-sent-hanzi" style="margin: 0 0 5px 0; font-size: 1.1rem; color: #333; font-weight:bold;"></p>
                        <p id="modal-sent-pinyin" style="margin: 0 0 5px 0; color: #888; font-size: 0.9rem;"></p>
                        <p id="modal-sent-en" style="margin: 0; color: #555; font-style: italic; font-size: 0.9rem;"></p>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('story-lookup-modal');
    }

    // Populate Data
    const hanzi = wordData.hanzi || wordData.word || '?';
    document.getElementById('story-modal-word').innerText = hanzi;
    document.getElementById('story-modal-pinyin').innerText = wordData.pinyin || '';
    document.getElementById('story-modal-translation').innerText = wordData.english || (wordData.pinyin ? '' : 'Unknown Word');

    // --- ACTION BUTTONS ---
    const actionContainer = document.getElementById('story-modal-actions');
    actionContainer.innerHTML = ''; 

    // BUTTON 1: Save to "My Notes" (Renamed)
    const noteBtn = document.createElement('button');
    noteBtn.className = 'btn primary';
    noteBtn.style.flex = '1';
    noteBtn.innerHTML = '📝 Save to Notes'; 
    noteBtn.onclick = () => {
        // Force save to "My Notes"
        window.addToNotebook(hanzi, wordData.pinyin, wordData.english);
        closeStoryModal();
    };
    actionContainer.appendChild(noteBtn);

    // BUTTON 2: Translate & Save to "Saved Words" (For unknown words)
    // Only show if pinyin is missing (unknown word)
    if (!wordData.pinyin) {
        const transBtn = document.createElement('button');
        transBtn.className = 'btn secondary';
        transBtn.style.flex = '1';
        transBtn.innerHTML = '🧠 Translate';
        transBtn.onclick = () => {
            // Trigger translation, passing "Saved Words" as the target group
            if(window.translateAndSave) {
                // We pass the 4th argument as "Saved Words" (requires update to translateAndSave in app.js or below)
                // For now, let's call the helper directly if translation isn't async, 
                // OR rely on translateAndSave. 
                
                // IMPORTANT: Since translateAndSave is in app.js, we should update app.js OR 
                // create a local wrapper here. Let's assume translateAndSave exists and we 
                // will modify it momentarily.
                window.translateAndSave(hanzi, fullStoryText, index, "Saved Words");
            }
            closeStoryModal();
        };
        actionContainer.appendChild(transBtn);
    }

    // Example Sentence Logic
    const container = document.getElementById('story-modal-sentence-container');
    if (wordData.sentence) {
        document.getElementById('modal-sent-hanzi').innerText = wordData.sentence.hanzi || "";
        document.getElementById('modal-sent-pinyin').innerText = wordData.sentence.pinyin || "";
        document.getElementById('modal-sent-en').innerText = wordData.sentence.english || "";
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

export function closeStoryModal() {
    const modal = document.getElementById('story-lookup-modal');
    if (modal) modal.classList.add('hidden');
}

// --- 5. AUDIO & METRONOME ENGINE ---

export function togglePinyin() {
    const btn = document.getElementById('btn-toggle-pinyin');
    const container = document.getElementById('story-text-container'); // Or the parent wrapper ID
    
    // Toggle Button State
    btn.classList.toggle('active');
    
    // Toggle Logic
    if (btn.classList.contains('active')) {
        // Show Pinyin
        document.getElementById('story-reader').classList.add('show-pinyin');
    } else {
        // Hide Pinyin
        document.getElementById('story-reader').classList.remove('show-pinyin');
    }
}

export function toggleTranslation() {
    const btn = document.getElementById('btn-toggle-trans');
    const transBox = document.getElementById('story-live-translation');
    
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        transBox.classList.remove('hidden');
        // Trigger an update immediately in case audio is paused
        updateLiveTranslation();
    } else {
        transBox.classList.add('hidden');
    }
}


function updateLiveTranslation() {
    const transBox = document.getElementById('story-live-translation');
    if (!transBox || transBox.classList.contains('hidden')) return;

    // Get current sentence chunk
    const chunk = storySentences[currentSentenceIdx];
    if (!chunk) return;

    // 1. Try to find an exact match in our Sentence Database
    const knownSentence = window.allSentences.find(s => s.hanzi.includes(chunk.text.trim()));
    
    if (knownSentence && knownSentence.english) {
        transBox.textContent = knownSentence.english;
    } else {
        // 2. Fallback: If we can't find it, we might show a generic message 
        // OR if you have the full story translation, you could try to map it, 
        // but for now, let's just clear it to avoid showing wrong info.
        transBox.textContent = "..."; 
    }
}

export function playStoryAudio() {
    const playBtn = document.getElementById('btn-play-story');
    
    if (isPaused) {
        isPaused = false;
        playBtn.textContent = "⏳"; 
        
        if (currentPlaybackIndex >= fullStoryText.length) {
            currentPlaybackIndex = 0;
            currentSentenceIdx = 0;
        }
        
        speakStoryFromIndex(currentPlaybackIndex);
        playBtn.textContent = "⏸️";
    } else {
        window.speechSynthesis.cancel();
        clearTimeout(metronomeTimer);
        isPaused = true;
        playBtn.textContent = "▶️";
    }
}

export function updateTTSRate(val) {
    ttsRate = parseFloat(val);
    
    // --- FIX: Put 'x' on the left ---
    document.getElementById('speed-val').textContent = 'x' + val; 
    
    // --- 1. UPDATE SLIDER FILL ---
    const slider = document.getElementById('tts-speed');
    if (slider) {
        const min = 0.75;
        const max = 1.25;
        // Range is 0.5
        const percent = ((val - min) / (max - min)) * 100;
        slider.style.backgroundSize = `${percent}% 100%`;
    }

    // --- 2. AUDIO LOGIC ---
    if (!isPaused) {
        isPaused = true; 
        const resumeIndex = currentPlaybackIndex;
        window.speechSynthesis.cancel();
        clearTimeout(metronomeTimer);
        setTimeout(() => {
            speakStoryFromIndex(resumeIndex); 
        }, 50);
    }
}

export function stopStoryAudio() {
    isPaused = true; 
    window.speechSynthesis.cancel();
    clearTimeout(metronomeTimer);
    currentPlaybackIndex = 0;
    currentSentenceIdx = 0;
    document.getElementById('btn-play-story').textContent = "▶️";
    document.querySelectorAll('.story-word.highlight').forEach(el => el.classList.remove('highlight'));
}

async function speakStoryFromIndex(startIndex = 0, onEndCallback) {
    if (!('speechSynthesis' in window)) return;

    const mySessionId = ++currentSpeechSessionId;
    window.speechSynthesis.cancel();
    clearTimeout(metronomeTimer);
    
    let targetSentenceIdx = 0;
    if (startIndex > 0) {
        targetSentenceIdx = storySentences.findIndex(s => startIndex >= s.start && startIndex < s.end);
        if (targetSentenceIdx === -1) targetSentenceIdx = 0;
    }
    
    currentSentenceIdx = targetSentenceIdx;
    
    await wakeUpHardware();

    if (mySessionId !== currentSpeechSessionId) return;

    isPaused = false;
    playNextChunk(onEndCallback);
}

function wakeUpHardware() {
    return new Promise(resolve => {
        const audio = new Audio(SILENT_WAV);
        audio.volume = 0.01;
        audio.play().then(() => {
            setTimeout(resolve, 300);
        }).catch(err => {
            console.warn("Ghost sound blocked:", err);
            resolve();
        });
    });
}

async function playNextChunk(globalOnEndCallback) {
    // --- FIX: DETECT END OF STORY ---
    if (currentSentenceIdx >= storySentences.length) {
        stopStoryAudio(); // Resets the Play button and Highlighter
        if (globalOnEndCallback) globalOnEndCallback();
        return;
    }

    if (isPaused) return;

    const chunk = storySentences[currentSentenceIdx];
    ttsOffset = chunk.start;
    currentPlaybackIndex = chunk.start;
    isSegmentPainted = false; 

    await wakeUpHardware();
    if (isPaused) return;

    currentUtterance = new SpeechSynthesisUtterance(chunk.text);
    currentUtterance.lang = 'zh-CN'; 
    currentUtterance.rate = ttsRate;

    currentUtterance.onend = () => {
        if (!isPaused) {
            clearTimeout(metronomeTimer);
            currentSentenceIdx++;

            const lastChar = chunk.text.trim().slice(-1);
            const commas = ['，', ',', '、'];
            let baseBreak = commas.includes(lastChar) ? COMMA_BREAK_MS : SENTENCE_BREAK_MS;
            const realWait = baseBreak / ttsRate;
            
            setTimeout(() => {
                playNextChunk(globalOnEndCallback);
            }, realWait); 
        }
    };

    window.speechSynthesis.speak(currentUtterance);
    
    setTimeout(() => {
        if(!isPaused) runMetronome(); 
    }, AUDIO_STARTUP_DELAY);
}

function runMetronome() {
    if (isPaused || currentPlaybackIndex >= fullStoryText.length) return;

    const currentChunk = storySentences[currentSentenceIdx];
    if (currentChunk && currentPlaybackIndex >= currentChunk.end) return;

    const char = fullStoryText[currentPlaybackIndex];
    const commas = ['，', '、', ',']; 
    const enders = ['。', '！', '？', '.', '!', '?', '\n']; 
    const allPunctuation = [...commas, ...enders, ' '];

    if (allPunctuation.includes(char)) {
        isSegmentPainted = false;
    } 
    else if (!isSegmentPainted) {
        document.querySelectorAll('.story-word.highlight').forEach(el => el.classList.remove('highlight'));

        let limitIndex = currentPlaybackIndex;
        while (limitIndex < fullStoryText.length) {
            if (allPunctuation.includes(fullStoryText[limitIndex])) break;
            limitIndex++;
        }

        wordMap.forEach(m => {
            if (m.end > currentPlaybackIndex && m.start < limitIndex) {
                m.element.classList.add('highlight');
                m.element.style.color = "";
            }
        });
        
        const firstWord = wordMap.find(m => m.start === currentPlaybackIndex);
        if (firstWord && firstWord.element) {
            smartScroll(firstWord.element); // <--- Use our gentle helper
        }

        isSegmentPainted = true;
    }

    syncLiveTranslation(currentPlaybackIndex);
    
    let waitTime = BASE_CHAR_TIME;

    if (commas.includes(char)) waitTime = 440;
    else if (char === ' ') waitTime = 100;
    else if (enders.includes(char)) {
        let backIndex = currentPlaybackIndex - 1;
        let charCount = 0;
        while (backIndex >= 0) {
            const prevChar = fullStoryText[backIndex];
            if (enders.includes(prevChar)) break;
            if (!commas.includes(prevChar) && prevChar !== ' ' && !enders.includes(prevChar) && prevChar !== '”' && prevChar !== '“') {
                charCount++;
            }
            backIndex--;
        }
        if (charCount <= 20) waitTime = 300; 
        else if (charCount <= 36) waitTime = 450;
        else if(charCount < 40) waitTime = 640; 
        else if (charCount < 45) waitTime = 800; 
        else if (charCount < 55) waitTime = 500;
        else waitTime = 640;
    }
    else {
        const match = wordMap.find(m => currentPlaybackIndex >= m.start && currentPlaybackIndex < m.end);
        if (match && match.element.classList.contains('unknown-word')) {
            waitTime += 40; 
        }
    }

    let adjustedWait = 0;
    if (allPunctuation.includes(char)) {
        adjustedWait = waitTime / (ttsRate * ttsRate);
    } else {
        adjustedWait = waitTime / ttsRate;
    }

    metronomeTimer = setTimeout(() => {
        currentPlaybackIndex++;
        runMetronome(); 
    }, adjustedWait);
}

function getBasePinyin(pinyin) {
    if (!pinyin) return "";
    return pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');
}



export async function generateCustomStory() {
    // --- CONFIGURATION ---
    const DAILY_LIMIT = 5; // Safe limit (leaves 15 for other features)
    // If 'gemini-1.5-flash' gave you 404, try 'gemini-2.0-flash-exp' or 'gemini-pro'
    // You can change this string to match the model you know works:
    const GEMINI_MODEL = "gemini-2.5-flash"; 

    // 1. INPUT VALIDATION
    const topic = document.getElementById('gen-topic').value.trim();
    const level = document.getElementById('gen-level').value;
    if (!topic) return window.triggerAlert("Please enter a topic!");

    // 2. CHECK API KEY (GEMINI)
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        document.getElementById('story-gen-modal').classList.add('hidden');
        if(window.openGeminiInstructions) window.openGeminiInstructions();
        else document.getElementById('gemini-instructions-modal').classList.remove('hidden');
        return;
    }

    // 3. CHECK DAILY LIMIT
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('storyGenDate');
    let count = parseInt(localStorage.getItem('storyGenCount')) || 0;

    if (lastDate !== today) {
        count = 0; // New day, reset count
        localStorage.setItem('storyGenDate', today);
    }

    if (count >= DAILY_LIMIT) {
        document.getElementById('story-gen-modal').classList.add('hidden');
        return window.triggerAlert(`Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Come back tomorrow! 🌙`);
    }

    // 4. PREPARE UI
    document.getElementById('story-gen-modal').classList.add('hidden');
    if(window.triggerToast) window.triggerToast(`✨ Writing story (${count + 1}/${DAILY_LIMIT})...`);

    // 5. CONSTRUCT PROMPT
    const prompt = `
    You are a professional Chinese teacher.
    TASK: Write a short story about "${topic}" at ${level} level.
    
    REQUIREMENTS:
    1. Use simple vocabulary appropriate for ${level}.
    2. Identify 5-8 "Key Words" (difficult or topic-specific words used in the text).
    3. The number of dots and commas for the hanzi script and english translation will be exactly the same.
    
    OUTPUT FORMAT:
    Return ONLY raw JSON (no markdown) with this exact structure:
    {
        "title": "Chinese Title",
        "englishTitle": "English Title",
        "content": "The full story text in Hanzi (Chinese characters)",
        "pinyin": "Full Pinyin for the story",
        "english": "Full English translation",
        "keyWords": [
            { "hanzi": "Word", "pinyin": "Pinyin", "english": "Definition" }
        ]
    }
    `;

    try {
        // 6. CALL GEMINI API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) {
            // Handle 404 or other network errors specifically
            if (response.status === 404) throw new Error("Model not found. Check GEMINI_MODEL name.");
            if (response.status === 429) throw new Error("Rate limit exceeded.");
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Gemini returned empty content.");
        }

        // 7. PARSE RESPONSE
        const rawText = data.candidates[0].content.parts[0].text;
        const storyData = JSON.parse(rawText);

        // 8. UPDATE QUOTA
        count++;
        localStorage.setItem('storyGenCount', count);

        // 9. MAP KEYWORDS TO UI
        // We map keywords into the "questions" slot so they appear at the bottom
        const keyWordsList = (storyData.keyWords || []).map(k => ({
            q: `${k.hanzi} <span style="color:var(--primary); font-weight:normal; font-size:0.9em; margin-left:5px;">${k.pinyin}</span>`,
            a: k.english
        }));

        const storyObj = {
            id: 'gen-' + Date.now(),
            title: storyData.title,
            englishTitle: storyData.englishTitle,
            content: storyData.content,
            pinyinBlock: storyData.pinyin,
            translation: storyData.english,
            questions: keyWordsList
        };

        // 10. OPEN READER
        document.getElementById('story-hub').classList.add('hidden');
        document.getElementById('story-reader').classList.remove('hidden');
        
        if(window.openReader) window.openReader(storyObj);

        // 11. UI TWEAK (Rename Header to "Key Words")
        setTimeout(() => {
            const qContainer = document.getElementById('questions-container');
            if(qContainer) {
                const header = qContainer.previousElementSibling;
                if(header && header.tagName === 'H3') header.textContent = "🔑 Key Words";
                if(header.previousElementSibling && header.previousElementSibling.tagName === 'HR') {
                    header.previousElementSibling.remove();
                }
            }
        }, 100);

    } catch (err) {
        console.error("Story Gen Error:", err);
        let msg = "Generation failed. ";
        if (err.message.includes("404")) msg += "Model name incorrect.";
        else if (err.message.includes("429")) msg += "Too many requests.";
        else msg += "Please try again.";
        if(window.triggerAlert) window.triggerAlert(msg);
    }
}


// --- 6. LIVE REFRESH (Dynamic Grouping) ---

export function refreshCurrentStory() {
    if (!currentStory) return;
    
    // 1. Remember where we were (Scroll position)
    const container = document.getElementById('story-text-container'); // Ensure your container has this ID or use 'story-reader'
    const scrollPos = container ? container.scrollTop : 0;

    // 2. Re-process the text
    // This will now use the updated 'window.allWords' list, causing the new word to group together
    const hanziBox = document.getElementById('story-text-hanzi');
    hanziBox.innerHTML = makeTextInteractive(currentStory.content);
    
    // 3. Re-bind Word Map (So clicks work on the new groups)
    buildWordMap(hanziBox);

    // 4. Restore Scroll
    if (container) container.scrollTop = scrollPos;
}

// --- NEW HELPERS FOR CLICK-TO-SEEK ---

function jumpToWord(index) {
    // 1. Update Global State
    currentPlaybackIndex = index;
    
    // 2. Visual: Highlight IMMEDIATELY
    document.querySelectorAll('.story-word.highlight').forEach(el => el.classList.remove('highlight'));

    // 3. Audio: Sync
    if (!isPaused) {
        // If playing, restart speech from new index
        // Small delay ensures the visual highlight paints first
        setTimeout(() => speakStoryFromIndex(index), 50);
    } else {
        // If paused, just update the tracker so "Play" starts here
        let targetSentenceIdx = storySentences.findIndex(s => index >= s.start && index < s.end);
        if (targetSentenceIdx === -1) targetSentenceIdx = 0;
        currentSentenceIdx = targetSentenceIdx;
    }
}

function paintHighlighter(targetIndex) {
    // Clear existing highlights
    document.querySelectorAll('.story-word.highlight').forEach(el => el.classList.remove('highlight'));

    // Find the word element in the map and highlight it
    const match = wordMap.find(m => targetIndex >= m.start && targetIndex < m.end);
    
    if (match && match.element) {
        match.element.classList.add('highlight');
        smartScroll(match.element);
    }
    
    // Reset segment logic so the metronome picks it up naturally on next tick
    isSegmentPainted = false; 
    updateLiveTranslation();
}


// Splits English text by commas/periods to match the Chinese flow
function getEnglishSegments(text) {
    if (!text) return [];
    // Regex matches text followed by punctuation
    // e.g. "Hello, I am David." -> ["Hello,", " I am David."]
    const segments = text.match(/[^,.;?!，。；？！]+[,.;?!，。；？！\n]*/g);
    return segments ? segments.map(s => s.trim()) : [];
}

function syncLiveTranslation(index) {
    const transBox = document.getElementById('story-live-translation');
    if (!transBox || transBox.classList.contains('hidden')) return;

    // 1. If it's an AI story (Aligned Pairs), use the Sentence Index
    if (currentStory && currentStory.storyPairs) {
         const sentence = storySentences[currentSentenceIdx];
         if(sentence && sentence.english) {
             transBox.textContent = sentence.english;
         }
         return;
    }

    // 2. For Premade Stories: Calculate Segment Index based on Commas
    // FIX: We look at text UP TO the current index (excluding current char).
    // This ensures we don't switch translation while pausing ON the comma.
    const textSoFar = fullStoryText.substring(0, index);
    
    // Regex counts: Commas, Periods, Question Marks, Exclamations, Semicolons
    const punctuationMatches = textSoFar.match(/[，。！？；,.;?!]/g);
    const segmentIdx = punctuationMatches ? punctuationMatches.length : 0;

    // 3. Update the Display
    if (window.englishSegments && window.englishSegments[segmentIdx]) {
        transBox.textContent = window.englishSegments[segmentIdx];
    } 
    // Fallback for very start
    else if (segmentIdx === 0 && window.englishSegments && window.englishSegments[0]) {
        transBox.textContent = window.englishSegments[0];
    }
}

function smartScroll(element) {
    const container = document.querySelector('.reader-content');
    if (!container || !element) return;

    const elRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // The "Comfort Zone" (in pixels)
    const padding = 60; 

    // 1. Calculate relative positions
    const isAbove = elRect.top < (containerRect.top + padding);
    const isBelow = elRect.bottom > (containerRect.bottom - padding);

    // 2. Manual Scroll Adjustment
    if (isAbove) {
        // If it's too high, scroll UP until it's 'padding' pixels from the top
        container.scrollTop += (elRect.top - containerRect.top) - padding;
    } 
    else if (isBelow) {
        // If it's too low, scroll DOWN until it's 'padding' pixels from the bottom
        container.scrollTop += (elRect.bottom - containerRect.bottom) + padding;
    }
}

// A simple helper to force-save to any group
function saveToSpecificGroup(hanzi, pinyin, english, groupName) {
    if (!window.allWords) window.allWords = [];
    
    // Prevent duplicates
    const exists = window.allWords.some(w => w.hanzi === hanzi && w.group === groupName);
    
    if (exists) {
        if(window.triggerToast) window.triggerToast(`Already in ${groupName}`);
        return;
    }

    const newWord = { hanzi, pinyin, english, group: groupName, nextReview: 0 };
    window.allWords.push(newWord);

    // Save to storage
    let custom = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    custom.push(newWord);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(custom));

    if(window.triggerToast) window.triggerToast(`Saved to ${groupName}!`);
    if (window.updateGroupList) window.updateGroupList();
}