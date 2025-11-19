let allWords = [];
let punctuatedPhrases = [];
let totalTime = 300;
let timeLeft = 300;
let timer;
let currentWordIndex = 0;
let correctWords = 0;
let totalWords = 0;
let isRunning = false;
let randomWords = [];
let isGeneratingWords = false;

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

// Load words from Monkeytype format JSON
async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        
        // Check if it's Monkeytype format with "words" array
        if (data.words && Array.isArray(data.words)) {
            allWords = data.words;
            console.log(`Loaded ${allWords.length} words from ${data.name || 'word list'}`);
        } else if (Array.isArray(data)) {
            // If it's just an array of words
            allWords = data;
            console.log(`Loaded ${allWords.length} words`);
        } else {
            console.error('Unexpected JSON format');
            allWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it'];
        }
        
        // Load punctuated phrases if available
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
    
    // 95% words from main list, 5% punctuated phrases (if available)
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.80 || punctuatedPhrases.length === 0) {
            tempWords.push(allWords[Math.floor(Math.random() * allWords.length)]);
        } else {
            tempWords.push(punctuatedPhrases[Math.floor(Math.random() * punctuatedPhrases.length)]);
        }
    }
    
    // Split multi-word phrases into individual words
    const splitWords = tempWords.flatMap(word => {
        if (word.includes(' ')) {
            return word.split(' ').filter(w => w.trim().length > 0);
        }
        return [word];
    });
    
    console.log('Generated', splitWords.length, 'words');
    return splitWords;
}

// Add more words dynamically
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

function startPractice(duration) {
    if (allWords.length === 0) {
        alert('Please wait, words are still loading...');
        return;
    }
    
    totalTime = duration;
    timeLeft = duration;
    isRunning = true;
    currentWordIndex = 0;
    correctWords = 0;
    totalWords = 0;
    
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
    
    timer = setInterval(updateTimer, 1000);
    
    enterFullscreen();
    
    setTimeout(scrollToCurrentWord, 100);
}

function endPractice() {
    isRunning = false;
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
    typingInput.disabled = false;
    resultsDiv.style.display = 'none';
    timeSelection.style.display = 'block';
    customTimeInput.value = '';
}

typingInput.addEventListener('input', (e) => {
    if (!isRunning) return;
    
    const typedWord = e.target.value.trim();
    
    if (e.target.value.endsWith(' ')) {
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