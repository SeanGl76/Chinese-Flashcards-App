import { hideAllSections } from '../app.js';

// --- CONFIG ---
const categories = [
    { id: 'body',  icon: '🐉', label: 'Body' },
    { id: 'head',  icon: '🧢', label: 'Head' },
    { id: 'eyes',  icon: '👓', label: 'Eyes' },
    { id: 'neck',  icon: '🧣', label: 'Neck' },
    { id: 'legs',  icon: '👖', label: 'Legs' },
    { id: 'back',  icon: '🎒', label: 'Back' }
];


// DEFINE ASSETS HERE
// You can add more items to these lists later!
const ACCESSORY_DB = {
    'Head': [
        { id: 'hat_cap', img: 'assets/acc_hat_cap.png', locked: false }, 
        { id: 'hat_viking', img: 'assets/acc_hat_viking.png', locked: true },
        { id: 'hat_crown', img: 'assets/acc_hat_crown.png', locked: true }
    ],
    'Eyes': [
        { id: 'sunglasses', img: 'assets/acc_sunglasses.png', locked: false },
        { id: 'glasses_round', img: 'assets/acc_glasses_round.png', locked: true }
    ],
    'Neck': [
        { id: 'scarf_red', img: 'assets/acc_scarf_red.png', locked: true }
    ],
    'Body': [
        { id: 'shirt_blue', img: 'assets/acc_shirt_blue.png', locked: true }
    ],
    'Legs': [
        // Add leg items here later
    ],
    'Hands': [
        // Add hand items here later
    ]
};

let currentCategory = 'Head';

// --- MAIN FUNCTIONS ---

export function initCharacter() {
    // Apply accessories when the app starts
    applyAccessories();
}

export function openCharacterHub() {
    hideAllSections();
    const hub = document.getElementById('character-hub');
    if(hub) hub.classList.remove('hidden');
    
    // Hide the floating profile button while inside the hub
    const floatBtn = document.getElementById('btn-char-profile');
    if(floatBtn) floatBtn.classList.add('hidden');

    renderNav();
    renderGrid(currentCategory);
}

// --- INTERNAL HELPERS ---

function renderNav() {
    const nav = document.getElementById('char-nav');
    if(!nav) return;
    nav.innerHTML = '';
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        // Check active state using the Label (since ACCESSORY_DB uses 'Head', 'Body' etc.)
        btn.className = `char-nav-btn ${cat.label === currentCategory ? 'active' : ''}`;
        
        // USE ICON instead of text
        btn.innerHTML = cat.icon; 
        btn.title = cat.label; // Tooltip for accessibility

        btn.onclick = () => {
            currentCategory = cat.label; // Set category to 'Head', 'Body', etc.
            renderNav(); 
            renderGrid(cat.label);
        };
        nav.appendChild(btn);
    });
}

function renderGrid(category) {
    const grid = document.getElementById('char-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const items = ACCESSORY_DB[category] || [];
    
    // Get saved data
    const unlocked = JSON.parse(localStorage.getItem('unlockedAccessories')) || [];
    const wearing = JSON.parse(localStorage.getItem('charAccessories')) || {};

    if(items.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#ccc; margin-top:20px;">No items yet.</div>`;
        return;
    }

    items.forEach(item => {
        // Unlocked if: It's not locked by default OR it's in the user's unlocked list
        const isUnlocked = !item.locked || unlocked.includes(item.id);
        const isWearing = wearing[category] === item.id;

        const card = document.createElement('div');
        card.className = `acc-card ${isWearing ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
        
        const img = document.createElement('img');
        img.src = item.img;
        card.appendChild(img);

        card.onclick = () => {
            if (!isUnlocked) {
                // Shake effect for locked items
                card.style.transform = "translateX(5px)";
                setTimeout(() => card.style.transform = "translateX(0)", 100);
                return; 
            }
            toggleItem(category, item.id);
        };

        grid.appendChild(card);
    });
}

function toggleItem(category, itemId) {
    const wearing = JSON.parse(localStorage.getItem('charAccessories')) || {};
    
    if (wearing[category] === itemId) {
        // If clicking the same item, take it off
        delete wearing[category];
    } else {
        // Put it on (replaces other item in same category)
        wearing[category] = itemId;
    }
    
    localStorage.setItem('charAccessories', JSON.stringify(wearing));
    
    // Update UI
    renderGrid(category); 
    applyAccessories();   
}

function applyAccessories() {
    const wearing = JSON.parse(localStorage.getItem('charAccessories')) || {};
    
    // Map Categories to HTML IDs in your index.html
    const layerMap = {
        'Head': 'layer-head',
        'Eyes': 'layer-eyes',
        'Neck': 'layer-neck',
        'Body': 'layer-body',
        'Legs': 'layer-legs',
        'Hands': 'layer-hands' // Ensure you have this ID if you use hands accessories
    };

    // 1. Hide all accessory layers first
    Object.values(layerMap).forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.src = '';
            el.classList.add('hidden');
        }
    });

    // 2. Show only the worn items
    Object.keys(wearing).forEach(cat => {
        const itemId = wearing[cat];
        const layerId = layerMap[cat];
        
        // Find the image source from the DB
        const catItems = ACCESSORY_DB[cat] || [];
        const item = catItems.find(i => i.id === itemId);
        
        if (item && layerId) {
            const el = document.getElementById(layerId);
            if(el) {
                el.src = item.img;
                el.classList.remove('hidden');
            }
        }
    });
}

// --- LEGACY SUPPORT ---
// We keep this empty function because app.js might still import it.
// This prevents the app from crashing.
export function toggleAccessoryView() {}