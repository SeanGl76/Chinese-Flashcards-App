import { speakChinese } from '../core/audio.js'; 
import { hideAllSections } from '../app.js';

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
        const icon = groupName.toLowerCase().includes('hsk') ? '🏆' : '📂';
        
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
        btn.className = 'btn ghost full-width';
        btn.style.cssText = "justify-content: space-between; margin-bottom: 8px; text-align: left; padding: 15px;";
        btn.innerHTML = `<span>${story.title}</span><span style="font-size:0.8rem; color:#999;">Read</span>`;
        btn.onclick = () => openReader(story);
        container.appendChild(btn);
    });
}

// --- 2. READER & LOGIC ---

export function openReader(story) {
    currentStory = story;
    document.getElementById('story-hub').classList.add('hidden');
    document.getElementById('story-reader').classList.remove('hidden');
    const currentSpeed = document.getElementById('tts-speed').value;
    updateTTSRate(currentSpeed);

    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-title-en').textContent = story.englishTitle || "";
    document.getElementById('story-text-pinyin').textContent = story.pinyinBlock || "";
    document.getElementById('story-text-english').textContent = story.translation || "";

    fullStoryText = story.content;
    storySentences = parseSentences(story.content);

    const hanziBox = document.getElementById('story-text-hanzi');
    hanziBox.innerHTML = makeTextInteractive(story.content);

    buildWordMap(hanziBox);

    hanziBox.onclick = (e) => {
        if (e.target.classList.contains('interactive')) {
            const word = e.target.dataset.word;
            lookupWordInStory(word);
        }
        else if (e.target.tagName === 'SPAN') {
             lookupWordInStory(e.target.textContent);
        }
    };

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
        const regex = new RegExp(item.hanzi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        processedText = processedText.replace(regex, (match) => {
            const token = `##TOKEN_${tokens.length}##`;
            tokens.push({ 
                id: token, 
                html: `<span class="story-word interactive" data-word="${match}">${match}</span>` 
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

export function lookupWordInStory(wordChar) {
    const allWords = window.allWords;
    const allSentences = window.allSentences;
    if (typeof allWords === 'undefined') return;

    let wordData = allWords.find(item => item.hanzi === wordChar);
    if (wordData) {
        wordData = { ...wordData };
    } else {
        wordData = { hanzi: wordChar, pinyin: '...', english: 'Unknown', sentence: '' };
    }

    if (!wordData.sentence && typeof allSentences !== 'undefined') {
        const foundSentence = allSentences.find(s => s.hanzi.includes(wordChar));
        if (foundSentence) {
            wordData.sentence = foundSentence; 
        } else {
             wordData.sentence = null;
        }
    }
    showStoryModal(wordData);
}

export function showStoryModal(wordData) {
    let modal = document.getElementById('story-lookup-modal');
    if (!modal) {
        const modalHTML = `
            <div id="story-lookup-modal" class="modal-overlay hidden" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:100;">
                <div class="modal-content" style="background:white; padding:20px; border-radius:15px; width:90%; max-width:350px; position:relative;">
                    <button onclick="closeStoryModal()" class="close-btn" style="position:absolute; top:10px; right:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    <h2 id="story-modal-word" style="font-size: 2.5em; margin: 10px 0; text-align:center; color:#333;"></h2>
                    <p id="story-modal-pinyin" style="color: var(--primary); font-weight:bold; text-align:center; font-size:1.2rem;"></p>
                    <p id="story-modal-translation" style="font-weight: bold; font-size: 1.1em; text-align:center; color:#555; margin-bottom:15px;"></p>
                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                    <div id="story-modal-sentence-container" style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <p id="modal-sent-hanzi" style="margin: 0 0 5px 0; font-size: 1.1rem; color: #333; font-weight:bold;"></p>
                        <p id="modal-sent-pinyin" style="margin: 0 0 5px 0; color: #888; font-size: 0.9rem;"></p>
                        <p id="modal-sent-en" style="margin: 0; color: #555; font-style: italic; font-size: 0.9rem;"></p>
                    </div>
                    <div id="modal-homophones-section" style="border-top:1px dashed #ddd; padding-top:10px; margin-top:10px; display:none;">
                        <p style="font-size:0.75rem; color:#999; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Similar Sounds (Homophones)</p>
                        <div id="homophones-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('story-lookup-modal');
    }

    document.getElementById('story-modal-word').innerText = wordData.hanzi || wordData.word || '?';
    document.getElementById('story-modal-pinyin').innerText = wordData.pinyin || '';
    document.getElementById('story-modal-translation').innerText = wordData.english || wordData.translation || '';
    
    const container = document.getElementById('story-modal-sentence-container');
    const elHanzi = document.getElementById('modal-sent-hanzi');
    const elPinyin = document.getElementById('modal-sent-pinyin');
    const elEn = document.getElementById('modal-sent-en');

    if (wordData.sentence) {
        if (typeof wordData.sentence === 'object') {
            elHanzi.innerText = wordData.sentence.hanzi;
            elPinyin.innerText = wordData.sentence.pinyin || "";
            elEn.innerText = wordData.sentence.english || "";
        } else {
            elHanzi.innerText = wordData.sentence;
            elPinyin.innerText = "";
            elEn.innerText = "";
        }
        container.classList.remove('hidden');
    } else {
        elHanzi.innerText = "No example sentence found.";
        elPinyin.innerText = "";
        elEn.innerText = "";
    }

    const homophoneSection = document.getElementById('modal-homophones-section');
    const homophoneGrid = document.getElementById('homophones-grid');
    
    if (homophoneGrid) homophoneGrid.innerHTML = '';

    if (wordData.pinyin && window.allWords) {
        const targetBase = getBasePinyin(wordData.pinyin);
        const homophones = window.allWords.filter(w => 
            w.hanzi !== wordData.hanzi && 
            getBasePinyin(w.pinyin) === targetBase
        ).slice(0, 4);

        if (homophones.length > 0 && homophoneSection) {
            homophoneSection.style.display = 'block'; 
            homophones.forEach(hw => {
                const btn = document.createElement('button');
                btn.className = 'btn sm-ghost';
                btn.style.cssText = "text-align:left; font-size:0.85rem; border:1px solid #eee; padding:5px;";
                btn.innerHTML = `<span style="color:var(--primary); font-weight:bold;">${hw.hanzi}</span> <span style="color:#999; font-size:0.75rem;">${hw.english.split(';')[0]}</span>`;
                btn.onclick = () => lookupWordInStory(hw.hanzi);
                homophoneGrid.appendChild(btn);
            });
        } else if (homophoneSection) {
            homophoneSection.style.display = 'none';
        }
    } else if (homophoneSection) {
        homophoneSection.style.display = 'none';
    }
    modal.classList.remove('hidden');
}

export function closeStoryModal() {
    const modal = document.getElementById('story-lookup-modal');
    if (modal) modal.classList.add('hidden');
}

// --- 5. AUDIO & METRONOME ENGINE ---

export function togglePinyin() {
    document.getElementById('story-text-pinyin').classList.toggle('hidden');
}

export function toggleTranslation() {
    document.getElementById('story-text-english').classList.toggle('hidden');
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
            firstWord.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        isSegmentPainted = true;
    }

    let waitTime = BASE_CHAR_TIME;

    if (commas.includes(char)) waitTime = 240;
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