// Language selection variables
// Language selection variables
// Language selection variables
let selectedLanguage = null;
let originalEnglishWords = [];
let originalEnglishPhrases = [];
const languageSelection = document.getElementById('languageSelection');
const langBtns = document.querySelectorAll('.lang-btn');
const backToLangBtn = document.getElementById('backToLangBtn');

// Language selection handler
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedLanguage = btn.getAttribute('data-lang');
        languageSelection.style.display = 'none';
        
        if (selectedLanguage === 'hindi') {
            // Save English words before switching to Hindi
            if (allWords.length > 0 && originalEnglishWords.length === 0) {
                originalEnglishWords = [...allWords];
                originalEnglishPhrases = [...punctuatedPhrases];
            }
            // Initialize Hindi mode
            initHindiMode();
        } else {
            // English mode - restore original English words
            if (originalEnglishWords.length > 0) {
                allWords = [...originalEnglishWords];
                punctuatedPhrases = [...originalEnglishPhrases];
            }
            // Make sure we're in English mode
            resetToEnglishMode();
            // Show time selection for English
            document.getElementById('timeSelection').style.display = 'block';
        }
    });
});
// Back to language button handler
backToLangBtn.addEventListener('click', () => {
    goBackToLanguageSelection();
});

// Function to go back to language selection
// Function to go back to language selection
function goBackToLanguageSelection() {
    document.getElementById('timeSelection').style.display = 'none';
    languageSelection.style.display = 'block';
    
    // Reset language
    selectedLanguage = null;
    
    // Fully reset to English mode
    resetToEnglishMode();
}
// Function to fully reset to English mode
// Function to fully reset to English mode
function resetToEnglishMode() {
    // Call Hindi disable function if it exists
    if (typeof disableHindiMode === 'function') {
        disableHindiMode();
    }
    
    // Restore original English words
    if (originalEnglishWords.length > 0) {
        allWords = [...originalEnglishWords];
        punctuatedPhrases = [...originalEnglishPhrases];
    }
    
    // Clear old words
    randomWords = [];
    document.getElementById('wordDisplay').innerHTML = '';
    
    // Reset input state
    const typingInput = document.getElementById('typingInput');
    typingInput.value = '';
    previousInputLength = 0;
    
    console.log('Reset to English mode complete');
}
// Rest of your existing script.js code continues below...


let allWords = [];
let punctuatedPhrases = [];
let totalTime = 300;
let timeLeft = 300;
let timer;
let currentWordIndex = 0;
let correctWords = 0;
let totalWords = 0;
let isRunning = false;
let timerStarted = false; // New: track if timer has started
let randomWords = [];
let isGeneratingWords = false;
let needsKeyboardFix = null;
let previousInputLength = 0;

const timeSelection = document.getElementById('timeSelection');
const practiceScreen = document.getElementById('practiceScreen');
const resultsDiv = document.getElementById('results');
const timeBtns = document.querySelectorAll('.time-btn');
const customTimeInput = document.getElementById('customTime');
const customStartBtn = document.getElementById('customStartBtn');
const typingInput = document.getElementById('typingInput');
const wordDisplay = document.getElementById('wordDisplay');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const wordCountDisplay = document.getElementById('wordCount');
const accuracyDisplay = document.getElementById('accuracy');
const endBtn = document.getElementById('endBtn');
const restartBtn = document.getElementById('restartBtn');

// Fullscreen functions
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.log('Exit fullscreen failed:', err);
        });
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Capitalize first letter of a word
function capitalizeWord(word) {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Fix last character if UK keyboard detected
function fixLastCharacter(text) {
    if (!needsKeyboardFix || text.length === 0) return text;
    
    const lastChar = text[text.length - 1];
    let fixedChar = lastChar;
    
    if (lastChar === '@') fixedChar = '"';
    else if (lastChar === '"') fixedChar = '@';
    else if (lastChar === '£') fixedChar = '#';
    
    return text.slice(0, -1) + fixedChar;
}

// Start the timer (called on first keystroke)
function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        timer = setInterval(updateTimer, 1000);
        console.log('Timer started!');
    }
}

// Check keyboard layout before starting
function checkKeyboardLayout() {
    return new Promise((resolve) => {
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
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        
        dialog.innerHTML = `
            <h2 style="margin-bottom: 20px; color: #333;">Keyboard Check</h2>
            <p style="margin-bottom: 20px; color: #666; font-size: 16px;">
                Please press <strong>Shift + '</strong> to type a double quote character: <strong>"</strong>
            </p>
            <input type="text" id="keyboardTest" 
                   style="width: 100%; padding: 15px; font-size: 24px; text-align: center; 
                          border: 2px solid #667eea; border-radius: 10px; margin-bottom: 10px;"
                   maxlength="1" autofocus autocapitalize="off" autocorrect="off" spellcheck="false">
            <p style="color: #999; font-size: 14px;">Type the " character to continue</p>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        const testInput = dialog.querySelector('#keyboardTest');
        testInput.focus();
        
        testInput.addEventListener('input', () => {
            const typedChar = testInput.value;
            
            if (typedChar === '"') {
                needsKeyboardFix = false;
                document.body.removeChild(overlay);
                resolve();
            } else if (typedChar === '@') {
                needsKeyboardFix = true;
                document.body.removeChild(overlay);
                resolve();
            } else {
                testInput.value = '';
            }
        });
    });
}

// Load words from Monkeytype format JSON
async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        
        if (data.words && Array.isArray(data.words)) {
            allWords = data.words;
            console.log(`Loaded ${allWords.length} words from ${data.name || 'word list'}`);
        } else if (Array.isArray(data)) {
            allWords = data;
            console.log(`Loaded ${allWords.length} words`);
        } else {
            console.error('Unexpected JSON format');
            allWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it'];
        }
        
        if (data.punctuated && Array.isArray(data.punctuated)) {
            punctuatedPhrases = data.punctuated;
            console.log(`Loaded ${punctuatedPhrases.length} punctuated phrases`);
        }
        
    } catch (error) {
        console.error('Error loading words.json:', error);
        alert('Could not load words.json. Make sure the file is in the same folder as your HTML file.');
        allWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it'];
    }
}

function generateRandomWords(count = 300) {
    let tempWords = [];
    
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.95 || punctuatedPhrases.length === 0) {
            tempWords.push(allWords[Math.floor(Math.random() * allWords.length)]);
        } else {
            tempWords.push(punctuatedPhrases[Math.floor(Math.random() * punctuatedPhrases.length)]);
        }
    }
    
    const splitWords = tempWords.flatMap(word => {
        if (word.includes(' ')) {
            return word.split(' ').filter(w => w.trim().length > 0);
        }
        return [word];
    });
    
    // Randomly capitalize 10% of words for practice
    const finalWords = splitWords.map(word => {
        const hasUpperCase = /[A-Z]/.test(word);
        const hasPunctuation = /[.,!?;:"']/.test(word);
        
        if (!hasUpperCase && !hasPunctuation && Math.random() < 0.10) {
            return capitalizeWord(word);
        }
        return word;
    });
    
    console.log('Generated', finalWords.length, 'words (with random capitalization)');
    return finalWords;
}

function addMoreWords(count = 300) {
    if (isGeneratingWords) {
        return;
    }
    
    isGeneratingWords = true;
    console.log('Adding', count, 'more words...');
    
    const newWords = generateRandomWords(count);
    const startIndex = randomWords.length;
    
    randomWords.push(...newWords);
    
    const fragment = document.createDocumentFragment();
    newWords.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word';
        span.setAttribute('data-index', startIndex + index);
        fragment.appendChild(span);
    });
    
    wordDisplay.appendChild(fragment);
    
    console.log('Total words now:', randomWords.length);
    isGeneratingWords = false;
}

function displayWords() {
    wordDisplay.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    randomWords.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word';
        span.setAttribute('data-index', index);
        if (index === currentWordIndex) {
            span.classList.add('current');
        }
        fragment.appendChild(span);
    });
    
    wordDisplay.appendChild(fragment);
}

function scrollToCurrentWord() {
    const currentWord = wordDisplay.querySelector('.word.current');
    if (currentWord) {
        currentWord.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTimer() {
    timerDisplay.textContent = formatTime(timeLeft);
    
    if (timeLeft <= 0) {
        endPractice();
    } else {
        timeLeft--;
    }
}

function updateStats() {
    const timeElapsed = (totalTime - timeLeft) / 60;
    const wpm = timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
    
    wpmDisplay.textContent = wpm;
    wordCountDisplay.textContent = totalWords;
    accuracyDisplay.textContent = accuracy + '%';
}

function checkAndAddMoreWords() {
    const wordsRemaining = randomWords.length - currentWordIndex;
    
    if (wordsRemaining < 150 && !isGeneratingWords) {
        console.log(`Only ${wordsRemaining} words remaining, adding more...`);
        addMoreWords(300);
    }
}

async function startPractice(duration) {
    if (allWords.length === 0) {
        alert('Please wait, words are still loading...');
        return;
    }
    
    if (needsKeyboardFix === null) {
        await checkKeyboardLayout();
    }
    
    totalTime = duration;
    timeLeft = duration;
    isRunning = true;
    timerStarted = false; // Timer will start on first keystroke
    currentWordIndex = 0;
    correctWords = 0;
    totalWords = 0;
    previousInputLength = 0;
    
    randomWords = generateRandomWords(300);
    displayWords();
    
    timeSelection.style.display = 'none';
    practiceScreen.style.display = 'flex';
    resultsDiv.style.display = 'none';
    
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    
    timerDisplay.textContent = formatTime(timeLeft);
    updateStats();
    
    // Don't start timer here - wait for first keystroke
    
    enterFullscreen();
    
    setTimeout(scrollToCurrentWord, 100);
}

function endPractice() {
    isRunning = false;
    timerStarted = false;
    clearInterval(timer);
    typingInput.disabled = true;
    
    const timeElapsed = (totalTime - timeLeft) / 60;
    const finalWPM = timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0;
    const finalAccuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
    const timePracticed = totalTime - timeLeft;
    
    document.getElementById('finalWords').textContent = totalWords;
    document.getElementById('finalWPM').textContent = finalWPM;
    document.getElementById('finalAccuracy').textContent = finalAccuracy + '%';
    document.getElementById('finalTime').textContent = formatTime(timePracticed);
    
    practiceScreen.style.display = 'none';
    resultsDiv.style.display = 'block';
    
    exitFullscreen();
}

function resetToTimeSelection() {
    resultsDiv.style.display = 'none';
    languageSelection.style.display = 'block';
    customTimeInput.value = '';
    
    // Reset language
    selectedLanguage = null;
    
    // Fully reset to English mode
    resetToEnglishMode();
}
// Input handler with automatic character fixing
typingInput.addEventListener('input', (e) => {
    if (!isRunning) return;
    
    // Start timer on first keystroke
    if (!timerStarted) {
        startTimer();
    }
    
    const currentValue = typingInput.value;
    const currentLength = currentValue.length;
    
    // Only fix if we're ADDING characters (not backspacing)
    if (currentLength > previousInputLength) {
        const fixedValue = fixLastCharacter(currentValue);
        
        if (currentValue !== fixedValue) {
            const cursorPos = typingInput.selectionStart;
            typingInput.value = fixedValue;
            typingInput.selectionStart = typingInput.selectionEnd = cursorPos;
        }
    }
    
    previousInputLength = typingInput.value.length;
    
    const typedWord = typingInput.value.trim();
    
    if (typingInput.value.endsWith(' ')) {
        const currentWord = randomWords[currentWordIndex];
        totalWords++;
        
        const wordElements = wordDisplay.querySelectorAll('.word');
        const currentElement = wordElements[currentWordIndex];
        
        if (typedWord === currentWord) {
            correctWords++;
            currentElement.classList.remove('current');
            currentElement.classList.add('correct');
        } else {
            currentElement.classList.remove('current');
            currentElement.classList.add('incorrect');
        }
        
        currentWordIndex++;
        
        checkAndAddMoreWords();
        
        if (currentWordIndex < randomWords.length) {
            wordElements[currentWordIndex].classList.add('current');
            scrollToCurrentWord();
        }
        
        typingInput.value = '';
        previousInputLength = 0;
        updateStats();
    }
});

timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const duration = parseInt(btn.getAttribute('data-time'));
        startPractice(duration);
    });
});

customStartBtn.addEventListener('click', () => {
    const customMinutes = parseInt(customTimeInput.value);
    if (customMinutes && customMinutes > 0 && customMinutes <= 60) {
        startPractice(customMinutes * 60);
    } else {
        alert('Please enter a valid time between 1 and 60 minutes');
    }
});

customTimeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        customStartBtn.click();
    }
});

endBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to end the test?')) {
        endPractice();
    }
});

restartBtn.addEventListener('click', resetToTimeSelection);

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isRunning) {
        console.log('Fullscreen exited');
    }
});

// Load words when page loads
loadWords();