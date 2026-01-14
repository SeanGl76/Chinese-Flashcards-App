import { hideAllSections } from '../app.js';
import { playGameSound } from '../core/audio.js';

let writer = null;
let currentWord = null;

export function openWriterHub() {
    hideAllSections();
    document.getElementById('writer-container').classList.remove('hidden');
    renderGroupList();
}

function showView(viewId) {
    ['writer-group-menu', 'writer-word-selection', 'writer-canvas-area'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

function renderGroupList() {
    showView('writer-group-menu');
    const container = document.getElementById('writer-group-menu');
    container.innerHTML = '<h2 class="menu-title" style="width:100%; text-align:left; font-size:1.2rem; margin-bottom:15px;">Choose a Word Group</h2>';
    
    // Ensure container uses full width
    container.style.width = '100%';

    const groups = [...new Set(window.allWords.map(w => w.group || 'HSK'))];
    
    groups.forEach(group => {
        const div = document.createElement('div');
        div.className = 'zone-card practice-zone'; 
        div.innerHTML = `
            <div class="zone-info">
                <h3 style="margin:0; font-size:1rem;">${group}</h3>
            </div>
            <div class="zone-arrow">→</div>
        `;
        div.onclick = () => renderWordList(group);
        container.appendChild(div);
    });
}

export function renderWordList(group) {
    showView('writer-word-selection');
    const container = document.getElementById('writer-word-selection');

    container.style.height = "100%";
    container.style.overflowY = "auto";
    container.style.display = "block";

    const scrollBtn = document.getElementById('writer-scroll-top');

    if (scrollBtn) scrollBtn.classList.add('hidden');

    container.onscroll = () => {
        console.log("Scrolling:", container.scrollTop); // Add this to debug
        if (container.scrollTop > 200) {
            scrollBtn.classList.remove('hidden');
        } else {
            scrollBtn.classList.add('hidden');
        }
    };

    container.scrollTop = 0;
    if (scrollBtn) scrollBtn.classList.add('hidden');
    
    // 1. Reset container styles to ensure sticky works
    container.style.padding = "0"; 
    container.style.display = "block"; 
    container.style.overflowY = "auto";

    const words = window.allWords.filter(w => w.group === group && w.hanzi.length <= 2);

    container.innerHTML = `
        <div style="padding: 20px 20px 10px 20px;">
            <button class="btn sm-ghost" onclick="window.openWriterHub()">← Groups</button>
            <h3 style="margin:10px 0; font-size: 1.3rem;">${group}</h3>
        </div>

        <div class="writer-search-container">
            <input type="text" id="writer-search" class="writer-search-input" placeholder="Search ${group}...">
        </div>

        <div id="writer-list-container" style="padding-bottom: 40px;"></div>
    `;

    const listContainer = document.getElementById('writer-list-container');
    const searchInput = document.getElementById('writer-search');

    const drawList = (filterText = '') => {
        listContainer.innerHTML = '';
        const filtered = words.filter(w => 
            w.hanzi.includes(filterText) || 
            (w.pinyin && w.pinyin.toLowerCase().includes(filterText.toLowerCase())) || 
            (w.english && w.english.toLowerCase().includes(filterText.toLowerCase()))
        );

        filtered.forEach(word => {
            const row = document.createElement('div');
            // Using the row style we defined earlier
            row.className = 'writer-word-row';
            row.style.paddingLeft = "20px";
            row.style.paddingRight = "20px";
            
            row.innerHTML = `
                <div class="writer-word-info">
                    <div class="writer-word-hanzi">${word.hanzi}</div>
                    <div class="writer-word-meta">${word.pinyin || ''} • ${word.english || ''}</div>
                </div>
                <div class="zone-arrow">→</div>
            `;
            row.onclick = () => initWriter(word);
            listContainer.appendChild(row);
        });
    };

    drawList();
    searchInput.addEventListener('input', (e) => drawList(e.target.value));
}

function handleWriterSuccess() {
    // 1. Play Correct Sound
    playGameSound('correct');

    // 2. Create and show Checkmark
    const wrapper = document.getElementById('writer-canvas-wrapper');
    const check = document.createElement('div');
    check.id = 'writer-success-overlay';
    check.innerHTML = '✔';
    wrapper.appendChild(check);

    // 3. Auto-remove checkmark after 1.5 seconds and reset for next attempt
    setTimeout(() => {
        if (check) check.remove();
        // Option: Automatically reset for practice or stay finished
        // writer.quiz(); 
    }, 1500);
}


function initWriter(word) {
    currentWord = word;
    showView('writer-canvas-area');
    
    // document.getElementById('writer-target-hanzi').textContent = word.hanzi;
    // document.getElementById('writer-target-pinyin').textContent = word.pinyin || '';

    const target = document.getElementById('writer-canvas-target');
    target.innerHTML = '';

    // Initialize HanziWriter
    writer = HanziWriter.create('writer-canvas-target', word.hanzi[0], {
        width: 200,
        height: 200,
        showCharacter: false, 
        showOutline: true,   
        padding: 5,
        strokeAnimationSpeed: 1,
        strokeColor: '#667eea', 
        outlineColor: '#d1d5db',
        drawingColor: '#333333',
        drawingWidth: 20
    });

    writer.showOutline(); 

    const ghostBtn = document.getElementById('btn-toggle-ghost');
    if(ghostBtn) ghostBtn.textContent = "Hide Shadow";

    // THE QUIZ WITH COMPLETION LOGIC
    writer.quiz({
    onCorrectStroke: function(strokeData) {
        // Use the imported function directly
        playGameSound('brush');
    },
    onComplete: function(summary) {
        handleWriterSuccess();
        if (window.speakChinese) {
            window.speakChinese(word.hanzi);
        }
    }
});
}



export function animateCharacter() {
    if (writer) writer.animateCharacter();
}

export function resetCanvas() {
    if (writer) writer.quiz();
}


export function openWriterDirectly(wordObj) {
    // 1. Reset Interface
    hideAllSections();
    document.getElementById('writer-container').classList.remove('hidden');
    
    // 2. Show specifically the canvas view, hiding the menus
    showView('writer-canvas-area');
    
    // 3. Initialize the specific word
    // We add a small 'back' logic so the 'Exit' button knows where to go? 
    // For now, the standard 'Exit' in HTML returns to menu, which is fine.
    initWriter(wordObj);
}