//--- UI helpers--



export function triggerAlert(msg) {
    const modal = document.getElementById('alert-modal');
    const msgBox = document.getElementById('alert-msg'); 
    
    // Safety Fallback
    if (!modal || !msgBox) {
        alert(msg);
        return;
    }

    msgBox.textContent = msg;
    modal.classList.remove('hidden');
    
    // Simple Close Logic
    const okBtn = modal.querySelector('button'); 
    if (okBtn) {
        // Clone to wipe old listeners
        const newBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newBtn, okBtn);
        
        newBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }
}
export function closeModal(modalId) { 
    document.getElementById(modalId).classList.add('hidden'); 
}

export function showInterimMessage(message, duration, onComplete) {
    const modal = document.getElementById('interim-modal');
    const textEl = document.getElementById('interim-text');
    textEl.textContent = message;
    modal.classList.remove('hidden');

    setTimeout(() => {
        modal.classList.add('hidden');
        if (onComplete) onComplete();
    }, duration);
}


let toastTimeout = null; 

window.triggerToast = function(message) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-message');
    
    if (toast && toastText) {
        // 1. Clear any existing timer (prevents premature closing if a new toast pops up)
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        // 2. Set Content
        toastText.textContent = message;
        
        // 3. Show Logic
        toast.classList.remove('hidden');
        // Small delay ensures the browser registers the display change before animating opacity
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 4. Auto-hide after 3 seconds
        toastTimeout = setTimeout(() => {
            window.hideToast();
        }, 3000);
    } else {
        console.warn("Toast UI not found. Message:", message);
        alert(message); 
    }
};


window.hideToast = function() {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    // 1. Stop the auto-hide timer (because user manually closed it)
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }

    // 2. Start Fade Out
    toast.classList.remove('show');

    // 3. Fully hide (display:none) after transition finishes (0.5s matches your CSS)
    setTimeout(() => {
        // Only add 'hidden' if the toast hasn't been re-opened in the meantime
        if (!toast.classList.contains('show')) {
            toast.classList.add('hidden');
        }
    }, 100);
};


// --- utils.js ---

export function shuffleArray(array) {
    // Creates a copy so we don't mess up the original
    const newArr = [...array]; 
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

window.triggerConfetti = function() {
    const myCanvas = document.getElementById('confetti-canvas');
    if(!myCanvas) return;

    // Create a special instance for this canvas
    const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true
    });

    myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 } // Fire from slightly below center
    });
};