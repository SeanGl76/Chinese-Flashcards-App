import { hideAllSections } from '../app.js';
import { triggerAlert } from '../core/utils.js';
import { lookupWordInStory } from './stories.js';

let ttsRate = 0.8;
let recognition = null;
let isListening = false;
let selectedChatGroups = [];
let isProcessing = false;
let chatHistory = [];

// --- 1. INITIALIZATION ---

export function openChatHub() {
    const groqKey = localStorage.getItem('groqApiKey');
    if (!groqKey) {
        if (window.openGroqInstructions) window.openGroqInstructions();
        else {
            const modal = document.getElementById('groq-instructions-modal');
            if (modal) modal.classList.remove('hidden');
        }
        return; 
    }

    hideAllSections();
    document.getElementById('chat-container').classList.remove('hidden');
    renderChatGroups();
    
    // --- NEW: Inject Reset Button ---
    injectResetButton(); 
    injectTranslateButton();

    const chatBox = document.getElementById('chat-messages');
    chatBox.scrollTop = chatBox.scrollHeight;
    
    setupSuggestionStrip();

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = false; 
        recognition.lang = 'zh-CN'; 
        
        recognition.onstart = () => {
            isListening = true;
            const btn = document.getElementById('btn-mic');
            if(btn) { btn.classList.add('listening'); btn.innerHTML = "⏹"; }
        };
        
        recognition.onend = () => {
            isListening = false;
            const btn = document.getElementById('btn-mic');
            if(btn) { btn.classList.remove('listening'); btn.innerHTML = "🎤"; }
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if(finalTranscript) {
                 const input = document.getElementById('chat-text-input');
                 input.value = input.value ? input.value + " " + finalTranscript : finalTranscript;
            }
        };
    }
}

// --- NEW: Reset Logic ---
function injectResetButton() {
    const header = document.querySelector('#chat-container .writer-header');
    // Prevent duplicate buttons
    if (!header || document.getElementById('btn-chat-reset')) return;

    const resetBtn = document.createElement('button');
    resetBtn.id = 'btn-chat-reset';
    resetBtn.className = 'btn sm-ghost';
    resetBtn.style.marginRight = '5px';
    resetBtn.innerHTML = '🔄';
    resetBtn.title = "Reset Conversation";
    resetBtn.onclick = resetConversation;

    // Insert before the Settings gear button
    const settingsBtn = header.querySelector('button[onclick="window.toggleChatSettings()"]');
    if (settingsBtn) {
        header.insertBefore(resetBtn, settingsBtn);
    } else {
        header.appendChild(resetBtn);
    }
}

export function resetConversation() {
    // Check if the custom modal is available
    if (typeof window.triggerConfirm === 'function') {
        window.triggerConfirm("Start a new conversation? This clears current history.", () => {
            performReset();
        });
    } else {
        // Fallback (just in case)
        if (confirm("Start a new conversation? This clears current history.")) {
            performReset();
        }
    }
}

function performReset() {
    // 1. Clear Memory
    chatHistory = [];
    
    // 2. Clear UI
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    // 3. Add Welcome Message
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai';
    bubble.innerHTML = `
        <div class="bubble-hanzi">我们可以重新开始。你想聊什么？</div>
        <div class="bubble-details hidden">
            <div class="bubble-pinyin">Wǒmen kěyǐ chóngxīn kāishǐ. Nǐ xiǎng liáo shénme?</div>
            <div class="bubble-english">We can start over. What do you want to chat about?</div>
        </div>
        <div class="bubble-controls">
            <button class="btn-chat-action" onclick="window.speakChat('我们可以重新开始。你想聊什么？')">🔊</button>
            <button class="btn-chat-action" onclick="this.parentElement.previousElementSibling.classList.toggle('hidden')">👁️</button>
        </div>
    `;
    container.appendChild(bubble);
}

// --- 2. API CALLER ---

// --- 2. API CALLER ---

// --- 2. API CALLER ---

async function callAI(systemPrompt, userMessage, includeHistory = true) {
    const groqKey = localStorage.getItem('groqApiKey');
    if (!groqKey) throw new Error("Missing API Key. Please check settings.");

    // Hardcoded URL to prevent typo issues
    const url = "https://api.groq.com/openai/v1/chat/completions";
    
    const messagesPayload = [
        { role: "system", content: systemPrompt }
    ];

    // Only add history if requested (Prevents quiz confusion)
    if (includeHistory) {
        const recentHistory = chatHistory.slice(-6);
        messagesPayload.push(...recentHistory);
    }

    // Add Current User Message
    messagesPayload.push({ role: "user", content: userMessage });

    const payload = {
        model: "llama-3.3-70b-versatile", 
        messages: messagesPayload,
        temperature: 0.6, 
        max_tokens: 4096
        // Note: response_format removed to prevent 400 errors
    };

    try {
        const response = await fetch(url, {
            method: "POST", // <--- CRITICAL: This must be POST
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq Error: ${response.status} - ${errText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Full API Error Details:", error);
        throw error; // Re-throw to be handled by the UI
    }
}
// --- NEW EXPORT: Grammar Doctor for Games ---
export async function getGrammarTip(userSentence, correctSentence) {
    const groqKey = localStorage.getItem('groqApiKey');
    if (!groqKey) return null;

    const prompt = `
    The user is learning Chinese.
    User wrote: "${userSentence}"
    Correct answer: "${correctSentence}"
    
    Task: Explain briefly WHY the user's version is grammatically wrong or unnatural compared to the correct one.

    IMPORTANT RULES:
    1. Refer to the user's input neutrally as "the answer" or "this sentence". 
    2. DO NOT say "You wrote", "Your answer", or "The user's answer".
    3. Start the sentence immediately with the explanation, do not start an answer with "this sentence is grammatically wrong because..."

    Output strictly JSON: { "tip": "Your explanation here (max 1 sentence)." }
    `;

    try {
        // Stateless call (no history needed)
        const url = "https://api.groq.com/openai/v1/chat/completions";
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.3,
                response_format: { type: "json_object" } 
            })
        });
        const data = await response.json();
        const json = JSON.parse(data.choices[0].message.content);
        return json.tip;
    } catch (e) {
        console.error("Grammar Doctor Error:", e);
        return null;
    }
}

// --- 3. CONTEXT GROUPS ---

function renderChatGroups() {
    const container = document.getElementById('chat-group-list');
    if(!container) return;
    container.innerHTML = '';
    const groups = [...new Set((window.allWords || []).map(w => w.group))].sort();
    if (selectedChatGroups.length === 0) selectedChatGroups = [...groups];

    groups.forEach(g => {
        const label = document.createElement('label');
        label.style.cssText = "display:flex; align-items:center; font-size:0.9rem; cursor:pointer;";
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedChatGroups.includes(g);
        checkbox.style.marginRight = "8px";
        checkbox.onchange = (e) => {
            if (e.target.checked) { if (!selectedChatGroups.includes(g)) selectedChatGroups.push(g); } 
            else { selectedChatGroups = selectedChatGroups.filter(x => x !== g); }
        };
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(g));
        container.appendChild(label);
    });
}

// --- 4. TEXT INTERACTION ---

function makeChatInteractive(text) {
    if(!window.allWords) return text;
    let processed = text;
    const tokens = [];
    const sortedVocab = [...window.allWords].sort((a,b) => b.hanzi.length - a.hanzi.length);

    sortedVocab.forEach((item) => {
        if (item.hanzi.length < 1) return;
        const safeHanzi = item.hanzi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeHanzi, 'g');
        processed = processed.replace(regex, (match) => {
            const token = `##T${tokens.length}##`;
            tokens.push({ id: token, html: `<span class="chat-word interactive" onclick="window.chatLookup('${match}')">${match}</span>` });
            return token;
        });
    });

    let finalHtml = "";
    processed.split(/(##T\d+##)/).forEach(part => {
        if (part.startsWith("##T")) {
            const t = tokens.find(x => x.id === part);
            finalHtml += t ? t.html : part;
        } else { finalHtml += part; }
    });
    return finalHtml;
}

window.chatLookup = function(hanzi) {
    lookupWordInStory(hanzi);
};

window.speakChat = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = ttsRate; 
        window.speechSynthesis.speak(utterance);
    }
};

// --- 5. QUIZ LOGIC ---

export function triggerQuizSetup() {
    const container = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai';
    bubble.innerHTML = `
        <div class="bubble-hanzi">I can generate a quiz based on your selected groups!</div>
        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn sm-ghost" onclick="window.startQuiz(5)">5 Questions</button>
            <button class="btn sm-ghost" onclick="window.startQuiz(10)">10 Questions</button>
        </div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

// --- SMART DATA PARSER ---
function normalizeQuizData(rawObj) {
    // 1. Locate the main array (handles {questions: []}, {quiz: []}, or just [])
    let list = [];
    if (Array.isArray(rawObj)) {
        list = rawObj;
    } else if (rawObj.questions && Array.isArray(rawObj.questions)) {
        list = rawObj.questions;
    } else if (rawObj.quiz && Array.isArray(rawObj.quiz)) {
        list = rawObj.quiz;
    } else {
        // Fallback: Use the first array found in the object
        const foundKey = Object.keys(rawObj).find(k => Array.isArray(rawObj[k]));
        if (foundKey) list = rawObj[foundKey];
    }

    // 2. Map items to our specific format (q, options, answer)
    return list.map(item => {
        // A. FIND OPTIONS (Look for array)
        let options = item.options || item.choices || item.answers || [];
        if (!Array.isArray(options)) {
            // Last resort: find any array property inside the item
            const arrayKey = Object.keys(item).find(k => Array.isArray(item[k]));
            if (arrayKey) options = item[arrayKey];
        }

        // B. FIND QUESTION (Look for "q", "question", or construct it)
        let question = item.q || item.question || item.query || item.content;
        
        // If question is missing but we have an English word, build it manually
        if (!question && item.english) {
            question = `How do you say "${item.english}"?`;
        }

        return {
            q: question || "Question Text Missing",
            options: options.length > 0 ? options : ["Error: No options found"],
            // AI sometimes sends index (0, 1) or letter (A, B)
            // We just pass it through to the key display
        };
    });
}

// --- MAIN FUNCTION ---
export async function startQuiz(count) {
    if (isProcessing) return;
    isProcessing = true; 

    // 1. GET RANDOM WORDS FROM YOUR LOCAL DATABASE
    // We grab more words than needed (count * 3) so the AI has choices for wrong answers too
    let pool = window.allWords || [];
    
    // Filter by selected groups if any are checked
    if (selectedChatGroups.length > 0) {
        pool = pool.filter(w => selectedChatGroups.includes(w.group));
    }
    
    // Safety check: if pool is empty, fall back to "HSK1" generic
    let vocabListStr = "HSK1 level words";
    
    if (pool.length > 0) {
        // Shuffle and pick random words (requires window.shuffleArray from app.js)
        // If shuffleArray isn't found, we use a simple sort randomizer
        const shuffler = window.shuffleArray || ((arr) => arr.sort(() => 0.5 - Math.random()));
        const randomBatch = shuffler([...pool]).slice(0, 10); // Pick 10 random words
        
        // Format them as "Hanzi (English)" for the AI
        vocabListStr = randomBatch.map(w => `${w.hanzi} (${w.english})`).join(", ");
    }

    addBubble('user', { text: `Start a ${count} question quiz.` });
    const typingId = addTypingIndicator();

    // 2. UPDATED PROMPT WITH SPECIFIC VOCABULARY
    const prompt = `
    Generate a ${count}-question multiple choice quiz for Chinese learners.
    
    CRITICAL: You must construct questions/answers using ONLY the vocabulary provided below. 
    Do not use generic words like "Hello" unless they are in this list.
    
    VOCABULARY POOL: 
    [${vocabListStr}]
    
    STRICT RULES:
    1. Question Format: "How do you say '[English Word]'?" (Use the English from the list).
    2. Options: 3 Hanzi choices. ONE must be correct, TWO must be random distractors from the list.
    3. Randomize the correct answer position.
    4. Output PURE JSON only.

    REQUIRED JSON STRUCTURE:
    {
        "intro": "Quiz generated from your custom list!",
        "questions": [
            { 
              "question": "How do you say 'Apple'?", 
              "options": ["苹果", "香蕉", "猫"], 
              "answer": "A" 
            }
        ],
        "key": "1. A, 2. B..."
    }
    `;
    
    try {
        const rawJson = await callAI(prompt, "Generate Quiz", false); 
        console.log("📝 AI Raw Response:", rawJson); 

        // 3. CLEANUP
        let cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);

        let quizObj;
        try {
            quizObj = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("AI returned invalid data. Try again.");
        }

        // 4. NORMALIZE
        const questions = normalizeQuizData(quizObj);

        removeTyping(typingId);
        const quizBubble = document.createElement('div');
        quizBubble.className = 'chat-bubble ai';

        if (questions.length === 0) {
            quizBubble.innerHTML = `<div style="color:red;">⚠️ Error: Could not read questions.</div>`;
        } else {
            let quizHtml = `<div class="bubble-hanzi" style="border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:10px; font-weight:bold;">
                                ${quizObj.intro || "Here is your quiz:"}
                            </div>`;
            
            questions.forEach((item, idx) => {
                quizHtml += `
                    <div style="margin-top:20px; text-align: left;">
                        <p style="font-weight:bold; margin:0 0 10px 0; color: var(--primary); font-size: 1.05rem;">
                            ${idx+1}. ${item.q}
                        </p>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            ${item.options.map((opt, i) => {
                                const letter = String.fromCharCode(65 + i); 
                                return `
                                <div style="font-size:1rem; color:#333; padding:8px 12px; background:white; border:1px solid #eee; border-radius:8px; display:flex; gap:10px;">
                                    <span style="font-weight:bold; color:#999; width:20px;">${letter})</span>
                                    <span>${opt}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`;
            });

            const answerKey = quizObj.key || "Please check the options above.";
            quizHtml += `
                <button class="btn sm-ghost" style="margin-top:25px; width:100%; border:1px solid #eee; padding:10px;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    👁️ Show Answer Key
                </button>
                <div class="hidden" style="margin-top:10px; padding:15px; background:#f0fff4; color:#276749; border-radius:8px; font-weight:bold; font-size:0.95rem; line-height:1.6; border:1px solid #c6f6d5;">
                    ${answerKey}
                </div>`;
            
            quizBubble.innerHTML = quizHtml;
        }

        document.getElementById('chat-messages').appendChild(quizBubble);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    
    } catch (err) {
        console.error("Quiz Error:", err);
        removeTyping(typingId);
        addBubble('error', { text: "Quiz failed: " + err.message });
    } finally {
        isProcessing = false; 
    }
}

// --- 6. SEND MESSAGE ---

export async function handleUserSend() {
    if (isProcessing) return;
    
    const input = document.getElementById('chat-text-input');
    const text = input.value.trim();
    if (!text) return;

    isProcessing = true; 
    if (isListening && recognition) recognition.stop();

    addBubble('user', { text: text });
    input.value = '';
    const typingId = addTypingIndicator();

    try {
        const now = new Date();
        const groupContext = selectedChatGroups.length > 0 ? selectedChatGroups.join(", ") : "All";
        
        const systemPrompt = `
        You are "Pal", a friendly Chinese tutor.
        Current Time: ${now.toLocaleString()}.
        CONTEXT: User is learning: [${groupContext}].

        TASK:
        1. Respond to the user's message naturally in Simplified Chinese.
        2. Provide the Pinyin and English translation for your response.
        3. If the user made a grammar mistake, explain it in 'correction'.

        CRITICAL: You MUST output a valid JSON object. Do not output markdown code blocks.

        EXAMPLE FORMAT:
        {
            "chinese": "今天天气很好。",
            "pinyin": "Jīntiān tiānqì hěn hǎo.",
            "english": "The weather is very good today.",
            "correction": ""
        }
        `;

        const rawJson = await callAI(systemPrompt, text);
        console.log("🤖 AI Raw Response:", rawJson); // DEBUG: Check console to see what arrives!
        
        let replyObj = { chinese: "", pinyin: "", english: "", correction: "" };
        
        try {
             const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
             const jsonStart = cleanJson.indexOf('{');
             const jsonEnd = cleanJson.lastIndexOf('}');
             
             if (jsonStart !== -1 && jsonEnd !== -1) {
                 const jsonString = cleanJson.substring(jsonStart, jsonEnd + 1);
                 const parsed = JSON.parse(jsonString);
                 
                 console.log("Parsed JSON:", parsed); // DEBUG: Look at this in Console to see the real keys!

                 // --- SURGICAL FIX: EXPANDED KEY SEARCH ---
                 // We look for ANY likely key that might hold the Chinese text
                 replyObj.chinese = parsed.chinese || 
                                    parsed.hanzi || 
                                    parsed.content || 
                                    parsed.text ||      // Common fallback
                                    parsed.response ||  // Common fallback
                                    parsed.answer ||    // Common fallback
                                    parsed.message ||   // Common fallback
                                    "";                 // Leave empty if truly missing
                 
                 replyObj.pinyin = parsed.pinyin || "";
                 replyObj.english = parsed.english || "";
                 replyObj.correction = parsed.correction || "";

                 // FALLBACK: If 'chinese' is still empty, but 'english' isn't, 
                 // the AI might have flipped them or put the main reply in an unnamed field.
                 // We will force the raw JSON processing if specific keys failed.
                 if (!replyObj.chinese && !replyObj.english) {
                     throw new Error("Empty keys");
                 }
             } else {
                 throw new Error("No JSON brackets");
             }
        } catch(e) {
             console.warn("Parsing failed, using raw text as fallback", e);
             // If JSON fails, use the whole raw text so the user at least sees the answer
             replyObj.chinese = rawJson; 
        }

        // Final Safety Net: If specifically Chinese is missing but we have raw text
        if (!replyObj.chinese || replyObj.chinese === "Error") {
             // If we have valid Pinyin, assumes the AI put the Hanzi in the raw text somehow, 
             // but let's just show the raw response to be safe.
             if (rawJson.length < 500) replyObj.chinese = rawJson;
             else replyObj.chinese = "(System: Could not parse Chinese text)";
        }

        removeTyping(typingId);
        
        // Safety Check: If chinese is still empty/undefined, set a placeholder
        if (!replyObj.chinese) replyObj.chinese = "(AI returned empty text)";

        addBubble('ai', replyObj);
        
        // Save to History
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: JSON.stringify(replyObj) });

    } catch (err) {
        console.error(err);
        removeTyping(typingId);
        let msg = "Connection error.";
        if (err.message.includes("401")) msg = "Invalid Groq Key. Check settings.";
        else if (err.message.includes("429")) msg = "Rate Limit Hit. Please wait.";
        addBubble('error', { text: msg });
    } finally {
        isProcessing = false; 
    }
}

// --- HELPERS ---

function removeTyping(id) { const el = document.getElementById(id); if(el) el.remove(); }

function addBubble(type, content) {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    
    if (type === 'user') {
        bubble.innerHTML = makeChatInteractive(content.text);
    }
    else if (type === 'error') {
        bubble.textContent = "⚠️ " + content.text;
        bubble.style.background = "#fee2e2"; 
        bubble.style.color = "#c53030";
    }
    else if (type === 'ai') {
        const safeText = content.chinese.replace(/'/g, "\\'");
        
        let correctionHtml = '';
        if (content.correction && content.correction.length > 2) {
            correctionHtml = `
                <div style="background:#fff9c4; color:#664d03; padding:8px; border-radius:8px; margin-bottom:8px; font-size:0.85rem; border-left:3px solid #ffca28;">
                    <strong>💡 Tip:</strong> ${content.correction}
                </div>
            `;
        }

        bubble.innerHTML = `
            ${correctionHtml}
            <div class="bubble-hanzi">${makeChatInteractive(content.chinese)}</div>
            <div class="bubble-details hidden">
                <div class="bubble-pinyin">${content.pinyin || ""}</div>
                <div class="bubble-english">${content.english || ""}</div>
            </div>
            <div class="bubble-controls">
                <button class="btn-chat-action" onclick="window.speakChat('${safeText}')">🔊</button>
                <button class="btn-chat-action" onclick="this.parentElement.previousElementSibling.classList.toggle('hidden')">👁️</button>
            </div>`;
    }
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const container = document.getElementById('chat-messages');
    if(container) {
        const bubble = document.createElement('div');
        bubble.id = id;
        bubble.className = 'chat-bubble ai typing';
        bubble.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }
    return id;
}

export function toggleListening() {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else recognition.start();
}
export function toggleChatSettings() {
    const el = document.getElementById('chat-settings-panel');
    if(el) el.classList.toggle('hidden');
}
export function updateChatSpeed(val) {
    ttsRate = parseFloat(val);
    const label = document.getElementById('tts-speed-val');
    if(label) label.textContent = val + 'x';
}

// Expose simple functions to window
window.triggerQuizSetup = triggerQuizSetup;
window.startQuiz = startQuiz;


// --- 7. LIVE SUGGESTION STRIP LOGIC ---

function setupSuggestionStrip() {
    let strip = document.getElementById('suggestion-strip');
    const inputZone = document.querySelector('.chat-input-zone');
    
    if (inputZone) {
        // CRITICAL: Ensure parent is relative so strip position:absolute works
        inputZone.style.position = "relative"; 
    }

    if (!strip) {
        strip = document.createElement('div');
        strip.id = 'suggestion-strip';
        // STYLE: overflow-x: auto enables scrolling
        strip.style.cssText = "position: absolute; bottom: 100%; left: 0; width: 100%; background: white; border-bottom: 1px solid #eee; display: flex; gap: 10px; padding: 10px; overflow-x: auto; white-space: nowrap; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; scrollbar-width: none;"; 
        strip.classList.add('hidden');
        if (inputZone) inputZone.prepend(strip);
    }

    const input = document.getElementById('chat-text-input');
    if (input) {
        // Use 'input' event to catch typing immediately
        input.oninput = () => handleTyping(input);
        input.onclick = () => handleTyping(input);
    }
}

function handleTyping(input) {
    const strip = document.getElementById('suggestion-strip');
    if(!strip) return;

    const cursor = input.selectionStart;
    const text = input.value;
    
    // Hide if empty or cursor at start
    if (cursor === 0 || text.length === 0) {
        hideStrip(strip);
        return;
    }

    // Get the character IMMEDIATELY before the cursor
    const targetChar = text[cursor - 1];

    // Only trigger if it is a Chinese character
    if (!/[\u4e00-\u9fa5]/.test(targetChar)) {
        hideStrip(strip);
        return;
    }

    const homophones = findHomophones(targetChar);

    if (homophones.length === 0) {
        hideStrip(strip);
    } else {
        renderSuggestions(strip, homophones, input, cursor);
    }
}

function findHomophones(char) {
    if (!window.allWords) return [];

    // 1. Find the pinyin of the typed character
    const match = window.allWords.find(w => w.hanzi === char);
    if (!match || !match.pinyin) return [];

    const targetPinyin = normalizePinyin(match.pinyin);

    // 2. Find ALL words with same pinyin (exclude self)
    const rawMatches = window.allWords.filter(w => 
        w.hanzi !== char && 
        normalizePinyin(w.pinyin) === targetPinyin
    );

    // 3. DEDUPLICATE (The Fix)
    const seenHanzi = new Set();
    const uniqueMatches = [];

    for (const w of rawMatches) {
        if (!seenHanzi.has(w.hanzi)) {
            seenHanzi.add(w.hanzi);
            uniqueMatches.push(w);
        }
    }

    // 4. Return top 20 to allow for scrolling
    return uniqueMatches.slice(0, 20); 
}

function normalizePinyin(p) {
    return p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');
}

function renderSuggestions(strip, words, input, cursorPos) {
    strip.innerHTML = '';
    strip.classList.remove('hidden'); // Show strip

    words.forEach(w => {
        const btn = document.createElement('div');
        // Chip Style
        btn.style.cssText = "flex-shrink: 0; padding: 6px 12px; background: #f0f7ff; border: 1px solid #cce4ff; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 6px;";
        
        const eng = w.english.split(';')[0].split(',')[0]; 
        btn.innerHTML = `<span style="font-weight:bold; font-size:1.1rem; color:#333;">${w.hanzi}</span> <span style="font-size:0.8rem; color:#666;">${eng}</span>`;
        
        btn.onclick = (e) => {
            e.preventDefault(); // Prevent weird focus jumps
            replaceCharacter(input, cursorPos, w.hanzi);
            hideStrip(strip);
        };
        strip.appendChild(btn);
    });
}

function replaceCharacter(input, cursorPos, newChar) {
    const text = input.value;
    const before = text.substring(0, cursorPos - 1);
    const after = text.substring(cursorPos);
    
    input.value = before + newChar + after;
    
    // Move cursor after the new char
    const newPos = cursorPos; 
    input.setSelectionRange(newPos, newPos);
    input.focus();
}

function hideStrip(strip) {
    strip.classList.add('hidden');
    strip.innerHTML = '';
}

// --- TRANSLATOR LOGIC ---
window.translateInput = async function() {
    const input = document.getElementById('chat-text-input');
    const originalText = input.value.trim();
    
    if (!originalText) return;

    // Visual Feedback
    const btn = document.getElementById('btn-translate');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = "⏳";
    btn.disabled = true;
    input.disabled = true;

    try {
        const prompt = `
        You are a professional translator. 
        Translate the following text into natural, colloquial Simplified Chinese.
        OUTPUT RULES:
        1. Output ONLY the Chinese characters.
        2. NO Pinyin, NO English, NO explanations.
        3. Do not wrap in quotes.
        
        Text to translate: "${originalText}"
        `;

        // We use callAI with history=false (3rd param) so the translation isn't biased by the chat
        const translated = await callAI(prompt, "Translate this", false);
        
        // Clean up result (sometimes AI adds quotes or markdown)
        let cleanText = translated.replace(/```/g, '').trim();
        if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
            cleanText = cleanText.slice(1, -1);
        }

        input.value = cleanText;

    } catch (err) {
        console.error("Translation failed:", err);
        // Optional: Trigger a toast error here
    } finally {
        // Restore UI
        btn.innerHTML = originalIcon;
        btn.disabled = false;
        input.disabled = false;
        input.focus();
    }
};

function injectTranslateButton() {
    const inputZone = document.querySelector('.chat-input-zone');
    // Prevent duplicate injection
    if (!inputZone || document.getElementById('btn-translate')) return;

    const transBtn = document.createElement('button');
    transBtn.id = 'btn-translate';
    transBtn.className = 'btn secondary';
    transBtn.style.cssText = "border-radius: 50%; width: 45px; height: 45px; padding: 0; margin-right: 8px; font-size: 1.2rem;";
    transBtn.innerHTML = "🌐";
    transBtn.onclick = window.translateInput;
    
    // Insert BEFORE the text input
    const inputField = document.getElementById('chat-text-input');
    inputZone.insertBefore(transBtn, inputField);
}