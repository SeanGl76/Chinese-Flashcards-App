import { hsk1Words, hsk2Words, hsk3Words, hsk4Words, hsk5Words } from '../data/word-list.js';
import { triggerAlert } from './utils.js';

// --- CONFIGURATION ---
const VERCEL_API_URL = "https://chinese-app-backend.vercel.app/api/generate";

// --- STATE FOR UPLOAD ---
let pendingMagicFile = null;

// --- 1. UI TRIGGERS ---

export function triggerMagicUpload() { 
    const key = localStorage.getItem('geminiApiKey');
    if (!key) {
        if (window.openGeminiInstructions) {
            window.openGeminiInstructions();
        } else {
            // Fallback in case window helper isn't loaded
            const modal = document.getElementById('gemini-instructions-modal');
            if (modal) modal.classList.remove('hidden');
        }
        return;
    }

    document.getElementById('magic-upload').click(); 
}

export function handleMagicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById('magic-upload').value = '';
    pendingMagicFile = file;
    document.getElementById('magic-group-name').value = ''; 
    document.getElementById('magic-name-modal').classList.remove('hidden');
    document.getElementById('magic-group-name').focus();
}

export function cancelMagicUpload() { 
    pendingMagicFile = null; 
    document.getElementById('magic-name-modal').classList.add('hidden'); 
}

export async function confirmMagicUpload() {
    const groupName = document.getElementById('magic-group-name').value.trim();
    if (!groupName) return triggerAlert("Please enter a name!");
    document.getElementById('magic-name-modal').classList.add('hidden');
    await processMagicFile(pendingMagicFile, groupName);
    pendingMagicFile = null;
}

// --- 2. CORE PROCESSING LOGIC ---

// core/magic-import.js

async function processMagicFile(file, groupName) {
    document.getElementById('loading-overlay').classList.remove('hidden');
    const tracker = document.getElementById('magic-status-tracker');
    if (tracker) tracker.classList.remove('hidden');

    try {
        const userKey = localStorage.getItem('geminiApiKey');
        const isTextFile = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt');

        let promptData = {};

        // HANDLER 1: Text/CSV Files (Read as String, inject into prompt)
        if (isTextFile) {
            const textContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
            promptData = { type: 'text', content: textContent };
        } 
        // HANDLER 2: PDF/Images (Read as Base64, send as inline_data)
        else {
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            promptData = { type: 'binary', mime: file.type, content: base64Data };
        }

        if (userKey) {
            console.log("🚀 BYOK MODE: Client-Side Generation Started");
            if (window.triggerToast) window.triggerToast("🚀 BYOK Mode: Analyzing file...");
        } else {
            // If you have a Vercel backend, you'd need to update it to handle images too.
            // For now, we assume BYOK for these new file types.
             if (window.triggerToast) window.triggerToast("☁️ Cloud Mode: Generating lite course...");
        }

        // --- PHASE 1: VOCABULARY ---
        if (window.triggerToast) window.triggerToast("Phase 1: Extracting vocabulary...");
        
        // Pass the prepared data object
        const vocabData = await callGeminiForVocab(promptData, userKey);

        // --- NEW: COOL-DOWN PERIOD ---
        if (window.triggerToast) window.triggerToast("Cooldown: Preparing for Phase 2...");
        await new Promise(resolve => setTimeout(resolve, 3000)); 

        // --- PHASE 2: STORIES ---
        if (window.triggerToast) window.triggerToast("Phase 2: Generating stories...");
        const storyData = await callGeminiForStories(vocabData.vocab, userKey);

        saveImportedData({ vocab: vocabData.vocab, stories: storyData.stories }, groupName);

    } catch (error) {
        console.error("❌ Magic Import Failed:", error);
        const errorMsg = error.message.includes("429") 
            ? "API Rate Limit hit. Please wait 1 minute." 
            : error.message;
        if (window.triggerAlert) window.triggerAlert("Import Failed: " + errorMsg);
    } finally {
        document.getElementById('loading-overlay').classList.add('hidden');
        if (tracker) tracker.classList.add('hidden');
    }

    if (window.loadAllWords) window.loadAllWords(); 
    if (window.refreshStories) window.refreshStories(); 
    
    console.log("✨ All data refreshed and synced to UI.");
}


export function minimizeLoading() { 
    const overlay = document.getElementById('loading-overlay');
    const tracker = document.getElementById('magic-status-tracker');
    
    // Hide the main big spinner
    if (overlay) overlay.classList.add('hidden'); 
    
    // Show the small corner spinner
    if (tracker) tracker.classList.remove('hidden'); 
    
    // Trigger the notification toast
    console.log("🛠️ Background mode activated.");
    if (window.triggerToast) {
        window.triggerToast("Import running in background! We will let you know when it is over."); 
    }
}



function saveImportedData(aiData, groupName) {
    const incomingVocab = aiData.vocab || [];
    const incomingStories = aiData.stories || [];

    let newWords = []; 
    let newSentences = [];
    let newStories = [];

    // Process Words & Sentences
    incomingVocab.forEach(item => {
        const exists = window.allWords.some(w => w.hanzi === item.hanzi);
        newWords.push({
            hanzi: item.hanzi, pinyin: item.pinyin, english: item.english, pos: item.pos,
            group: groupName, isCustom: true, isHidden: exists, nextReview: 0
        });
        if (item.sentence) {
            newSentences.push({
                hanzi: item.sentence.hanzi, pinyin: item.sentence.pinyin, english: item.sentence.english, 
                group: groupName, nextReview: 0
            });
        }
    });

    // Process Stories
    incomingStories.forEach((story, index) => {
        newStories.push({
            id: `magic-${Date.now()}-${index}`,
            group: groupName,
            difficulty: story.difficulty || "starter",
            title: story.title || "Untitled Story",
            englishTitle: story.englishTitle || "",
            content: story.content || "",
            pinyinBlock: story.pinyin || "",
            translation: story.english || story.translation || "",
            questions: story.questions || []
        });
    });

    // Save to LocalStorage
    if (newWords.length > 0) {
        const customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
        localStorage.setItem('myCustomChineseWords', JSON.stringify([...customWords, ...newWords]));
    }
    if (newSentences.length > 0) {
        const customSents = JSON.parse(localStorage.getItem('myCustomSentences')) || [];
        localStorage.setItem('myCustomSentences', JSON.stringify([...customSents, ...newSentences]));
    }
    if (newStories.length > 0) {
        const customStories = JSON.parse(localStorage.getItem('myCustomStories')) || [];
        localStorage.setItem('myCustomStories', JSON.stringify([...customStories, ...newStories]));
    }

    // REFRESH DATA GLOBALLY
    if (window.loadAllWords) window.loadAllWords(); // Reloads words/groups
    if (window.refreshStories) window.refreshStories(); // NEW: Reloads stories

    // THE NOTIFICATION
    const message = `Import Finished! Added ${newWords.length} words, ${newSentences.length} sentences, and ${newStories.length} stories.`;
    
    if (window.triggerAlert) {
        window.triggerAlert(message); // Uses your modal alert
    } else if (window.triggerToast) {
        window.triggerToast(message); // Or your toast
    }
}

// --- 3. AI PROMPTS & CLIENT API CALL ---
// core/magic-import.js

async function callGeminiForVocab(fileData, apiKey) {
    let parts = [];
    
    const BASE_PROMPT = `You are an expert Chinese Course Creator. 
                        Extract ALL vocabulary from the attached PDF.
                        With the vocabulary extracted, create practice sentences. 
                        Assign POS (Noun, Verb, Adjective, Adverb, Particle, Number, or Other).

                        MANDATORY EXCEPTIONS:
                        -Include Proper Nouns (Names/Places e.g 'mike', 'beijing') - classify POS as "Name".
                        -Abstract/Hard-to-draw words = "Other".
                        -For each word, provide hanzi, pinyin, english, part of speech (pos), and one example sentence.
                        -Numbers will be categorized in their POS as "Number"

                        OUTPUT STRICT JSON:
                        {
                            "vocab": [{"hanzi": "...", "pinyin": "...", "english": "...", "pos": "...", "sentence": {"hanzi": "...", "pinyin": "...", "english": "..."}}]
                        }`;

    // Construct the payload based on file type
    if (fileData.type === 'text') {
        // Inject text directly into prompt
        parts = [{ text: BASE_PROMPT + "\n\n--- FILE CONTENT ---\n" + fileData.content }];
    } else {
        // Send binary data (PDF/Image)
        parts = [
            { text: BASE_PROMPT },
            { inline_data: { mime_type: fileData.mime, data: fileData.content } }
        ];
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: parts }] })
    });

    const data = await response.json();
    return extractJSON(data.candidates[0].content.parts[0].text);
}

async function callGeminiForStories(vocabList, apiKey) {
    const vocabString = vocabList.map(v => v.hanzi).join(', ');
    const PROMPT = `You are an expert Chinese Course Creator. 
                    Using ONLY this vocabulary: [${vocabString}, ${hsk1Words}, ${hsk2Words}, ${hsk3Words}, ${hsk4Words}, ${hsk5Words}], generate exactly 10 engaging stories (2 per level: Starter, Basic, Intermediate, Advanced, Pro).
                    
                    RULES:
                    1. Every word used in stories MUST be in the provided vocab list.
                    2. Difficulty levels must match HSK levels 1 through 5 respectively.
                    3. HSK1 story length: ~100 words. HSK2: ~200. HSK3: ~300. HSK4: ~475. HSK5: ~700.
                    4. For EACH story, add 5 English comprehension questions and answers.
                    5. The questions must be phrased in natural, human-like language without any symbols, quotes, or separating lines.
                    6. The number of dots and commas for the hanzi script and english translation will be exactly the same.

                    OUTPUT STRICT JSON:
                    {
                        "stories": [{
                            "title": "...", 
                            "englishTitle": "...", 
                            "difficulty": "starter/basic/intermediate/advanced/pro", 
                            "content": "...", 
                            "pinyin": "...", 
                            "english": "...", 
                            "questions": [{"q": "...", "a": "..."}]
                        }]
                    }`;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT }] }]
        })
    });

    const data = await response.json();
    return extractJSON(data.candidates[0].content.parts[0].text);
}



function extractJSON(text) {
    try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const cleanJson = text.substring(jsonStart, jsonEnd);
        return JSON.parse(cleanJson);
    } catch (e) {
        throw new Error("The AI response was incomplete. This usually happens with extremely large PDFs; try a slightly shorter document.");
    }
}

/**
 * Automatically retries a fetch request if it hits a 429 or 5xx error.
 * Implements exponential backoff with jitter.
 */
async function fetchWithRetry(url, options, maxRetries = 3, baseDelay = 2000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            // If success, return the response
            if (response.ok) return response;

            // If we hit a rate limit (429) or server error (5xx), we retry
            if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
                if (attempt === maxRetries) throw new Error(`API Busy: ${response.status}. Please try again in a few minutes.`);
                
                // Calculate delay: baseDelay * 2^attempt + random jitter
                const delay = (baseDelay * Math.pow(2, attempt)) + (Math.random() * 1000);
                
                console.warn(`⚠️ Attempt ${attempt + 1} hit rate limit (${response.status}). Retrying in ${Math.round(delay)}ms...`);
                if (window.triggerToast) window.triggerToast(`API busy, retrying in ${Math.round(delay/1000)}s...`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Try the next loop iteration
            }

            // For other errors (404, 403, etc.), don't retry, just throw
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);

        } catch (err) {
            if (attempt === maxRetries) throw err;
            // For network errors (timeouts/disconnects), retry using the same delay logic
            const delay = (baseDelay * Math.pow(2, attempt)) + (Math.random() * 1000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}