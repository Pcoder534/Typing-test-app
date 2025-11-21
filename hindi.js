// Hindi Typing Practice Module
let hindiWords = [];
let hindiPhrases = [];
let hindiRandomWords = [];
let hindiIsGenerating = false;
let hindiInputHandler = null;

// Store original English functions
window.originalGenerateWords = null;
window.originalAddWords = null;

// Initialize Hindi mode
function initHindiMode() {
  console.log('Hindi mode activated');
  
  // Store original functions before overriding
  if (!window.originalGenerateWords) {
    window.originalGenerateWords = window.generateRandomWords;
    window.originalAddWords = window.addMoreWords;
  }
  
  // Add Hindi mode class to body
  document.body.classList.add('hindi-mode');
  
  // Set input for Hindi
  const typingInput = document.getElementById('typingInput');
  typingInput.setAttribute('lang', 'hi');
  typingInput.placeholder = 'यहाँ टाइप करना शुरू करें...';
  typingInput.style.fontFamily = "'Mangal', 'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif";
  
  // Disable UK keyboard fix for Hindi
  window.needsKeyboardFix = false;
  
  // Show Hindi keyboard instruction
  showHindiKeyboardInfo();
  
  loadHindiWords().then(() => {
    document.getElementById('timeSelection').style.display = 'block';
    overrideForHindi();
  });
}

// Show Hindi keyboard instruction
function showHindiKeyboardInfo() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
  
  dialog.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #333;">हिन्दी कीबोर्ड सक्षम करें</h2>
        <p style="margin-bottom: 15px; color: #666; font-size: 16px;">
            कृपया अपने डिवाइस पर हिन्दी कीबोर्ड सक्षम करें:
        </p>
        <ul style="text-align: left; color: #666; line-height: 1.8; margin-bottom: 20px;">
            <li><strong>Windows:</strong> Win + Space या Alt + Shift</li>
            <li><strong>Android:</strong> कीबोर्ड पर Globe 🌐 आइकन</li>
            <li><strong>iOS:</strong> कीबोर्ड पर Globe 🌐 आइकन</li>
        </ul>
        <p style="margin-bottom: 20px; color: #999; font-size: 14px;">
            Enable Hindi keyboard on your device
        </p>
        <button id="hindiContinueBtn" style="padding: 12px 30px; background: #667eea; color: white; 
                border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            जारी रखें / Continue
        </button>
    `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  document.getElementById('hindiContinueBtn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
}

// Load Hindi words
async function loadHindiWords() {
  try {
    const response = await fetch('hindi.json');
    const data = await response.json();
    
    if (data.words && Array.isArray(data.words)) {
      hindiWords = data.words;
      console.log(`Loaded ${hindiWords.length} Hindi words`);
    }
    
    if (data.phrases && Array.isArray(data.phrases)) {
      hindiPhrases = data.phrases;
      console.log(`Loaded ${hindiPhrases.length} Hindi phrases`);
    }
    
  } catch (error) {
    console.error('Error loading hindi.json:', error);
    hindiWords = ['यह', 'है', 'का', 'एक', 'में', 'को', 'से', 'पर', 'और', 'के'];
    hindiPhrases = ['नमस्ते!', 'कैसे हैं?', 'धन्यवाद!'];
  }
}

// Generate random Hindi words
function generateHindiWords(count = 300) {
  let tempWords = [];
  
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.95 || hindiPhrases.length === 0) {
      tempWords.push(hindiWords[Math.floor(Math.random() * hindiWords.length)]);
    } else {
      tempWords.push(hindiPhrases[Math.floor(Math.random() * hindiPhrases.length)]);
    }
  }
  
  const splitWords = tempWords.flatMap(word => {
    if (word.includes(' ')) {
      return word.split(' ').filter(w => w.trim().length > 0);
    }
    return [word];
  });
  
  console.log('Generated', splitWords.length, 'Hindi words');
  return splitWords;
}

// Add more Hindi words
function addMoreHindiWords(count = 300) {
  if (hindiIsGenerating) return;
  
  hindiIsGenerating = true;
  const newWords = generateHindiWords(count);
  const startIndex = randomWords.length;
  
  randomWords.push(...newWords);
  
  const fragment = document.createDocumentFragment();
  const wordDisplay = document.getElementById('wordDisplay');
  
  newWords.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.className = 'word';
    span.setAttribute('data-index', startIndex + index);
    fragment.appendChild(span);
  });
  
  wordDisplay.appendChild(fragment);
  hindiIsGenerating = false;
}

// Normalize Hindi text
function normalizeHindiText(text) {
  return text
    .trim()
    .replace(/​/g, '')
    .replace(/‌/g, '')
    .replace(/‍/g, '')
    .replace(/s+/g, ' ')
    .normalize('NFC');
}

// Override functions for Hindi
function overrideForHindi() {
  // Override word generation
  window.generateRandomWords = generateHindiWords;
  window.addMoreWords = addMoreHindiWords;
  
  allWords = hindiWords;
  punctuatedPhrases = hindiPhrases;
  
  console.log('Hindi mode ready!');
}

// Function to disable Hindi mode and restore English
function disableHindiMode() {
  // Remove Hindi mode class
  document.body.classList.remove('hindi-mode');
  
  // Restore English functions
  if (window.originalGenerateWords) {
    window.generateRandomWords = window.originalGenerateWords;
    window.addMoreWords = window.originalAddWords;
  }
  
  // Re-enable UK keyboard fix for English
  window.needsKeyboardFix = null;
  
  // Reset input
  const typingInput = document.getElementById('typingInput');
  typingInput.removeAttribute('lang');
  typingInput.placeholder = 'Start typing here...';
  typingInput.style.fontFamily = '';
  
  console.log('Hindi mode disabled, English restored');
}