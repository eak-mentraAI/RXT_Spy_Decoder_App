// ========================================
// Core Caesar Cipher Logic
// ========================================

function caesarDecode(text, shift) {
    // Normalize shift to be within -26 to 26
    shift = ((shift % 26) + 26) % 26;
    
    return text.toUpperCase().split('').map(char => {
        // Only shift A-Z characters
        if (char >= 'A' && char <= 'Z') {
            let code = char.charCodeAt(0);
            // Apply shift
            code = ((code - 65 + shift) % 26) + 65;
            return String.fromCharCode(code);
        }
        // Keep non-letter characters unchanged
        return char;
    }).join('');
}

function sanitizeInput(text) {
    // Remove any potentially harmful characters, keep only letters, spaces, and basic punctuation
    return text.replace(/[^A-Za-z0-9\s.,!?'-]/g, '');
}

// ========================================
// Analytics System
// ========================================

class PrivacyAnalytics {
    constructor() {
        this.storageKey = 'spy-decoder-stats';
        this.sessionStart = Date.now();
        this.stats = this.loadStats();
    }
    
    loadStats() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultStats();
        } catch (e) {
            return this.getDefaultStats();
        }
    }
    
    getDefaultStats() {
        return {
            totalDecodes: 0,
            successfulUnlocks: 0,
            winningPhrases: [],
            averageShift: 0,
            sessionCount: 0,
            lastUsed: null,
            deviceType: this.getDeviceType()
        };
    }
    
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    track(event, data = {}) {
        switch(event) {
            case 'decode':
                this.stats.totalDecodes++;
                this.updateAverageShift(data.shift);
                break;
            case 'unlock':
                this.stats.successfulUnlocks++;
                if (data.phrase && !this.stats.winningPhrases.includes(data.phrase)) {
                    this.stats.winningPhrases.push(data.phrase);
                }
                break;
            case 'session':
                this.stats.sessionCount++;
                break;
        }
        
        this.stats.lastUsed = new Date().toISOString();
        this.saveStats();
    }
    
    updateAverageShift(shift) {
        const total = this.stats.totalDecodes;
        const currentAvg = this.stats.averageShift || 0;
        this.stats.averageShift = ((currentAvg * (total - 1)) + shift) / total;
    }
    
    saveStats() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    }
    
    getSessionDuration() {
        return Math.floor((Date.now() - this.sessionStart) / 1000);
    }
    
    generateReport() {
        return {
            ...this.stats,
            sessionDuration: this.getSessionDuration(),
            completionRate: this.stats.totalDecodes > 0 
                ? (this.stats.successfulUnlocks / this.stats.totalDecodes * 100).toFixed(1) + '%'
                : '0%',
            averageShift: (this.stats.averageShift || 0).toFixed(1)
        };
    }
}

// ========================================
// Sound Manager with iOS Support
// ========================================

class EnhancedSoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.initialized = false;
        this.audioSupported = 'Audio' in window;
        this.iosAudioUnlocked = false;
        
        // Detect iOS
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Initialize based on platform
        if (this.isIOS) {
            this.setupIOSAudioUnlock();
        } else {
            this.loadSounds();
        }
    }
    
    setupIOSAudioUnlock() {
        // Check if already enabled in session
        if (sessionStorage.getItem('audioEnabled') === 'true') {
            this.loadSounds();
            this.iosAudioUnlocked = true;
            return;
        }
        
        // Setup unlock on first user interaction
        const unlockOnTouch = () => {
            if (!this.iosAudioUnlocked) {
                this.unlockIOSAudio();
                document.removeEventListener('touchstart', unlockOnTouch);
                document.removeEventListener('click', unlockOnTouch);
            }
        };
        
        document.addEventListener('touchstart', unlockOnTouch);
        document.addEventListener('click', unlockOnTouch);
    }
    
    unlockIOSAudio() {
        // Create and play silent audio to unlock
        const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        silentAudio.play().then(() => {
            this.iosAudioUnlocked = true;
            this.loadSounds();
            sessionStorage.setItem('audioEnabled', 'true');
            console.log('iOS audio unlocked');
        }).catch(e => {
            console.warn('Failed to unlock iOS audio:', e);
        });
    }
    
    loadSounds() {
        if (!this.audioSupported || this.initialized) return;
        
        // Create placeholder sounds with data URIs (simple beeps)
        const clickSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE';
        
        const soundFiles = {
            'click': clickSound,
            'decode': clickSound,
            'unlock': clickSound
        };
        
        Object.entries(soundFiles).forEach(([name, data]) => {
            try {
                const audio = new Audio(data);
                audio.volume = 0.3;
                this.sounds[name] = audio;
            } catch (e) {
                console.warn(`Could not load sound: ${name}`, e);
            }
        });
        
        this.initialized = true;
    }
    
    play(soundName) {
        if (!this.enabled || !this.audioSupported || !this.initialized) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            try {
                const clone = sound.cloneNode();
                clone.volume = sound.volume;
                clone.play().catch(() => {
                    // Silently handle autoplay failures
                });
            } catch (e) {
                console.log('Sound play failed:', e);
            }
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ========================================
// Admin System
// ========================================

class AdminSystem {
    constructor() {
        this.PASSWORD = 'rxtproduct25';
        this.isAuthenticated = false;
        this.storageKeys = {
            phrases: 'spy-decoder-winning-phrases',
            stats: 'spy-decoder-stats',
            adminAuth: 'spy-decoder-admin-auth'
        };
        
        this.initializeAdmin();
    }
    
    initializeAdmin() {
        // Check for existing admin session
        const savedAuth = sessionStorage.getItem(this.storageKeys.adminAuth);
        if (savedAuth === 'true') {
            this.isAuthenticated = true;
        }
        
        // Load saved phrases
        this.loadWinningPhrases();
        
        // Setup admin toggle
        this.setupAdminToggle();
    }
    
    setupAdminToggle() {
        // Triple-click on header to open admin
        let clickCount = 0;
        let clickTimer;
        
        const header = document.querySelector('.app-header');
        if (header) {
            header.addEventListener('click', (e) => {
                // Don't count clicks on the sound toggle
                if (e.target.closest('.sound-toggle')) return;
                
                clickCount++;
                
                if (clickCount === 3) {
                    this.showAdminLogin();
                    clickCount = 0;
                }
                
                clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 500);
            });
        }
        
        // Keyboard shortcut (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showAdminLogin();
            }
        });
    }
    
    showAdminLogin() {
        if (this.isAuthenticated) {
            this.showManagementPanel();
            return;
        }
        
        const modal = document.getElementById('admin-login-modal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        
        const passwordInput = document.getElementById('admin-password');
        const loginBtn = document.getElementById('admin-login-btn');
        const cancelBtn = document.getElementById('admin-cancel-btn');
        const errorMsg = document.getElementById('admin-error');
        
        // Clear previous attempts
        passwordInput.value = '';
        errorMsg.style.display = 'none';
        
        // Focus password input
        passwordInput.focus();
        
        // Handle login
        const attemptLogin = () => {
            if (passwordInput.value === this.PASSWORD) {
                this.isAuthenticated = true;
                sessionStorage.setItem(this.storageKeys.adminAuth, 'true');
                modal.style.display = 'none';
                this.showManagementPanel();
            } else {
                errorMsg.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
                
                // Log failed attempt
                analytics.track('admin_login_failed');
            }
        };
        
        loginBtn.onclick = attemptLogin;
        passwordInput.onkeypress = (e) => {
            if (e.key === 'Enter') attemptLogin();
        };
        
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    showManagementPanel() {
        const panel = document.getElementById('admin-management');
        if (!panel) return;
        
        panel.style.display = 'block';
        
        // Load current phrases
        this.displayCurrentPhrases();
        
        // Load statistics
        this.displayStatistics();
        
        // Setup save button
        const saveBtn = document.getElementById('save-phrases-btn');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveWinningPhrases();
        }
        
        // Setup logout
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
        
        // Setup stats management
        const clearStatsBtn = document.getElementById('clear-stats-btn');
        if (clearStatsBtn) {
            clearStatsBtn.onclick = () => {
                if (confirm('Clear all statistics? This cannot be undone.')) {
                    this.clearStatistics();
                }
            };
        }
        
        const exportBtn = document.getElementById('export-stats-btn');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportStatistics();
        }
    }
    
    loadWinningPhrases() {
        try {
            const saved = localStorage.getItem(this.storageKeys.phrases);
            if (saved) {
                window.WINNING_PHRASES = JSON.parse(saved);
            } else {
                // Default phrases
                window.WINNING_PHRASES = [
                    'TOP SECRET',
                    'MISSION COMPLETE',
                    'CRYPTO',
                    'RACKSPACE',
                    'TRICK OR TREAT',
                    'HALLOWEEN',
                    'ACCESS GRANTED'
                ];
                // Save defaults
                localStorage.setItem(this.storageKeys.phrases, JSON.stringify(window.WINNING_PHRASES));
            }
        } catch (e) {
            console.error('Failed to load winning phrases:', e);
            // Use defaults on error
            window.WINNING_PHRASES = ['TOP SECRET', 'MISSION COMPLETE'];
        }
    }
    
    displayCurrentPhrases() {
        const editor = document.getElementById('winning-phrases-editor');
        if (editor && window.WINNING_PHRASES) {
            editor.value = window.WINNING_PHRASES.join('\n');
        }
    }
    
    saveWinningPhrases() {
        const editor = document.getElementById('winning-phrases-editor');
        const statusDiv = document.getElementById('save-status');
        
        if (!editor || !statusDiv) return;
        
        try {
            // Parse phrases from textarea
            const phrases = editor.value
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            
            // Update global variable
            window.WINNING_PHRASES = phrases;
            
            // Save to localStorage
            localStorage.setItem(this.storageKeys.phrases, JSON.stringify(phrases));
            
            // Show success message
            statusDiv.textContent = '✅ Phrases saved successfully!';
            statusDiv.style.color = 'var(--success-color)';
            
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
            
            // Log admin action
            analytics.track('admin_phrases_updated', { count: phrases.length });
            
        } catch (e) {
            statusDiv.textContent = '❌ Error saving phrases';
            statusDiv.style.color = 'var(--danger-color)';
            console.error('Failed to save phrases:', e);
        }
    }
    
    displayStatistics() {
        const report = analytics.generateReport();
        
        const elements = {
            'stat-decodes': report.totalDecodes,
            'stat-unlocks': report.successfulUnlocks,
            'stat-rate': report.completionRate,
            'stat-shift': report.averageShift,
            'stat-sessions': report.sessionCount
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }
    
    clearStatistics() {
        localStorage.removeItem(this.storageKeys.stats);
        analytics.stats = analytics.getDefaultStats();
        this.displayStatistics();
    }
    
    exportStatistics() {
        const stats = analytics.generateReport();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `spy-decoder-stats-${timestamp}.json`;
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
    }
    
    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem(this.storageKeys.adminAuth);
        const panel = document.getElementById('admin-management');
        if (panel) panel.style.display = 'none';
    }
}

// ========================================
// Success History Manager
// ========================================

class SuccessHistoryManager {
    constructor() {
        this.storageKey = 'spy-decoder-success-history';
        this.successHistory = this.loadHistory();
        this.historySection = null;
        this.historyContent = null;
        this.progressText = null;
        this.progressFill = null;
    }
    
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.successHistory));
        } catch (e) {
            console.warn('Could not save success history:', e);
        }
    }
    
    addSuccess(phrase) {
        // Normalize phrase for comparison
        const normalizedPhrase = phrase.toUpperCase().trim();
        
        // Check if already in history
        if (!this.successHistory.includes(normalizedPhrase)) {
            this.successHistory.push(normalizedPhrase);
            this.saveHistory();
            this.updateDisplay(normalizedPhrase);
            return true; // New success
        }
        return false; // Already had this one
    }
    
    clearHistory() {
        this.successHistory = [];
        this.saveHistory();
        this.updateDisplay();
    }
    
    initializeDisplay() {
        this.historySection = document.getElementById('success-history');
        this.historyContent = document.getElementById('history-content');
        this.progressText = document.getElementById('progress-text');
        this.progressFill = document.getElementById('progress-fill');
        
        // Set up clear button
        const clearBtn = document.getElementById('clear-history');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.successHistory.length > 0) {
                    if (confirm('Clear all successfully decoded phrases?')) {
                        this.clearHistory();
                    }
                }
            });
        }
        
        // Initial display update
        this.updateDisplay();
    }
    
    updateDisplay(newPhrase = null) {
        if (!this.historySection || !this.historyContent) return;
        
        // Show section if we have history
        if (this.successHistory.length > 0) {
            this.historySection.style.display = 'block';
            
            // Update content
            this.historyContent.innerHTML = '';
            this.successHistory.forEach((phrase, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                if (phrase === newPhrase) {
                    item.classList.add('new-item');
                }
                item.textContent = phrase;
                this.historyContent.appendChild(item);
            });
        } else {
            // Show empty state or hide section
            this.historySection.style.display = 'none';
        }
        
        // Update progress
        this.updateProgress();
    }
    
    updateProgress() {
        if (!this.progressText || !this.progressFill) return;
        
        const total = window.WINNING_PHRASES ? window.WINNING_PHRASES.length : 7;
        const found = this.successHistory.length;
        const percentage = (found / total) * 100;
        
        this.progressText.textContent = `${found} of ${total} phrases found`;
        this.progressFill.style.width = `${percentage}%`;
        
        // Add complete class if all found
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            if (percentage >= 100) {
                progressBar.classList.add('complete');
            } else {
                progressBar.classList.remove('complete');
            }
        }
    }
}

// ========================================
// Main Application Logic
// ========================================

// DOM elements
let codedMessageInput, shiftSlider, shiftNumber, shiftDisplay;
let decodeButton, outputSection, decodedOutput, successModal;
let charCount;

// Initialize managers
let soundManager, adminSystem, analytics, successHistory;

// Constants
const MAX_MESSAGE_LENGTH = 500;
const CHUNK_SIZE = 100;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeManagers();
    setupEventListeners();
    setupKeyboardShortcuts();
    setupTouchGestures();
    setupServiceWorker();
});

function initializeElements() {
    // Get all DOM elements
    codedMessageInput = document.getElementById('coded-message');
    shiftSlider = document.getElementById('shift-slider');
    shiftNumber = document.getElementById('shift-number');
    shiftDisplay = document.getElementById('shift-value');
    decodeButton = document.getElementById('decode-btn');
    outputSection = document.getElementById('output-section');
    decodedOutput = document.getElementById('decoded-output');
    successModal = document.getElementById('success-modal');
    charCount = document.getElementById('char-count');
}

function initializeManagers() {
    // Initialize all manager classes
    soundManager = new EnhancedSoundManager();
    adminSystem = new AdminSystem();
    analytics = new PrivacyAnalytics();
    successHistory = new SuccessHistoryManager();
    
    // Initialize success history display
    successHistory.initializeDisplay();
    
    // Track session start
    analytics.track('session');
}

function setupEventListeners() {
    // Character counter
    if (codedMessageInput && charCount) {
        codedMessageInput.addEventListener('input', () => {
            const length = codedMessageInput.value.length;
            charCount.textContent = length;
            
            // Change color when approaching limit
            if (length > 450) {
                charCount.style.color = 'var(--danger-color)';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });
    }
    
    // Shift controls synchronization
    if (shiftSlider && shiftNumber && shiftDisplay) {
        shiftSlider.addEventListener('input', (e) => {
            syncShiftInputs(e.target.value);
            soundManager.play('click');
        });
        
        shiftNumber.addEventListener('input', (e) => {
            syncShiftInputs(e.target.value);
        });
        
        shiftNumber.addEventListener('blur', (e) => {
            if (isNaN(e.target.value) || e.target.value === '') {
                syncShiftInputs(0);
            }
        });
    }
    
    // Decode button
    if (decodeButton) {
        decodeButton.addEventListener('click', performDecode);
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const isEnabled = soundManager.toggle();
            const soundOn = soundToggle.querySelector('.sound-on');
            const soundOff = soundToggle.querySelector('.sound-off');
            
            if (soundOn && soundOff) {
                soundOn.style.display = isEnabled ? 'inline' : 'none';
                soundOff.style.display = isEnabled ? 'none' : 'inline';
            }
            
            soundToggle.setAttribute('aria-pressed', isEnabled.toString());
            soundManager.play('click');
        });
    }
    
    // Success modal close on click
    if (successModal) {
        successModal.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }
    
    // Help button functionality
    const helpButton = document.getElementById('help-toggle');
    const userGuideModal = document.getElementById('user-guide-modal');
    const closeGuideButton = document.getElementById('close-guide');
    
    if (helpButton && userGuideModal) {
        // Open guide
        helpButton.addEventListener('click', () => {
            userGuideModal.style.display = 'flex';
            soundManager.play('click');
        });
        
        // Close guide with X button
        if (closeGuideButton) {
            closeGuideButton.addEventListener('click', () => {
                userGuideModal.style.display = 'none';
                soundManager.play('click');
            });
        }
        
        // Close guide when clicking outside
        userGuideModal.addEventListener('click', (e) => {
            if (e.target === userGuideModal) {
                userGuideModal.style.display = 'none';
            }
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to decode
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            performDecode();
        }
        
        // Escape to clear or close modals
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            const userGuideModal = document.getElementById('user-guide-modal');
            
            // First check if user guide is open
            if (userGuideModal && userGuideModal.style.display === 'flex') {
                userGuideModal.style.display = 'none';
                return;
            }
            
            // If in admin password field, close modal
            if (activeElement && activeElement.id === 'admin-password') {
                const modal = document.getElementById('admin-login-modal');
                if (modal) modal.style.display = 'none';
            } else if (codedMessageInput && codedMessageInput.value) {
                if (confirm('Clear all inputs?')) {
                    codedMessageInput.value = '';
                    syncShiftInputs(0);
                    outputSection.style.display = 'none';
                    if (charCount) charCount.textContent = '0';
                }
            }
        }
    });
    
    // Allow Enter key to decode from input field
    if (codedMessageInput) {
        codedMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                performDecode();
            }
        });
    }
}

function setupTouchGestures() {
    // Improve touch responsiveness
    if ('vibrate' in navigator && decodeButton) {
        decodeButton.addEventListener('touchstart', () => {
            navigator.vibrate(10); // Light haptic tap
        });
    }
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Swipe to clear functionality
    if (codedMessageInput) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        codedMessageInput.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        codedMessageInput.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(touchStartX, touchEndX);
        });
    }
}

function handleSwipe(startX, endX) {
    if (endX < startX - 50) {
        // Swipe left - clear input
        if (confirm('Clear the message?')) {
            codedMessageInput.value = '';
            outputSection.style.display = 'none';
            if (charCount) charCount.textContent = '0';
        }
    }
}

function syncShiftInputs(value) {
    // Clamp value to valid range
    const clampedValue = Math.max(-13, Math.min(13, parseInt(value) || 0));
    
    // Update all related elements
    if (shiftSlider) shiftSlider.value = clampedValue;
    if (shiftNumber) shiftNumber.value = clampedValue;
    if (shiftDisplay) shiftDisplay.textContent = clampedValue;
    
    return clampedValue;
}

function performDecode() {
    if (!codedMessageInput || !decodeButton) return;
    
    const codedMessage = sanitizeInput(codedMessageInput.value);
    
    if (!codedMessage.trim()) {
        showError('Please enter a coded message!');
        return;
    }
    
    // Validate message length
    if (codedMessage.length > MAX_MESSAGE_LENGTH) {
        showError(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
        return;
    }
    
    // Show loading state
    decodeButton.disabled = true;
    decodeButton.classList.add('loading');
    decodeButton.innerHTML = '<span class="spinner"></span> DECODING...';
    
    // Play decode sound
    soundManager.play('decode');
    
    // Simulate minimum processing time for effect
    setTimeout(() => {
        const shift = parseInt(shiftSlider.value);
        const decodedMessage = caesarDecode(codedMessage, shift);
        
        // Show output
        if (outputSection && decodedOutput) {
            outputSection.style.display = 'block';
            decodedOutput.textContent = decodedMessage;
            
            // Check for winning phrase
            const winningPhrase = checkForWin(decodedMessage);
            if (winningPhrase) {
                setTimeout(() => {
                    triggerSuccessAnimation(winningPhrase);
                }, 500);
            }
        }
        
        // Track decode
        analytics.track('decode', { 
            shift: shift,
            messageLength: codedMessage.length 
        });
        
        // Reset button
        decodeButton.disabled = false;
        decodeButton.classList.remove('loading');
        decodeButton.innerHTML = '<span class="button-text">DECODE MESSAGE</span><span class="button-icon">🔓</span>';
    }, 300);
}

function checkForWin(decodedText) {
    if (!window.WINNING_PHRASES) return null;
    
    const normalizedText = decodedText.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (const phrase of window.WINNING_PHRASES) {
        const normalizedPhrase = phrase.toUpperCase().replace(/[^A-Z]/g, '');
        if (normalizedText.includes(normalizedPhrase)) {
            return phrase;
        }
    }
    
    return null;
}

function triggerSuccessAnimation(winningPhrase) {
    // Add to success history
    const isNewSuccess = successHistory.addSuccess(winningPhrase);
    
    // Play unlock sound
    soundManager.play('unlock');
    
    // Show modal
    if (successModal) {
        successModal.style.display = 'flex';
    }
    
    // Add confetti
    createConfetti();
    
    // Add screen flash effect
    document.body.style.animation = 'flash 0.5s ease';
    
    // Track success
    analytics.track('unlock', { 
        phrase: winningPhrase,
        timeToSolve: analytics.getSessionDuration(),
        isNew: isNewSuccess
    });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        if (successModal) successModal.style.display = 'none';
        document.body.style.animation = '';
    }, 4000);
}

function createConfetti() {
    const colors = ['#00ffcc', '#ff6600', '#ffff00', '#ff00ff', '#00ff00'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

function showError(message, duration = 5000) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-toast';
    errorEl.setAttribute('role', 'alert');
    errorEl.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" aria-label="Close">×</button>
    `;
    
    document.body.appendChild(errorEl);
    
    // Animate in
    requestAnimationFrame(() => {
        errorEl.classList.add('show');
    });
    
    // Close button
    const closeBtn = errorEl.querySelector('.error-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            errorEl.classList.remove('show');
            setTimeout(() => errorEl.remove(), 300);
        });
    }
    
    // Auto-remove
    if (duration > 0) {
        setTimeout(() => {
            if (errorEl.parentElement) {
                errorEl.classList.remove('show');
                setTimeout(() => errorEl.remove(), 300);
            }
        }, duration);
    }
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker registration failed, app will still work
                console.log('Service worker not registered');
            });
        });
    }
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e);
    analytics.track('error', {
        message: e.message,
        source: e.filename,
        line: e.lineno
    });
});

window.addEventListener('unhandledrejection', (e) => {
    // Don't show error for expected audio failures
    if (e.reason && e.reason.name === 'NotAllowedError') {
        return;
    }
    console.error('Unhandled promise rejection:', e);
});