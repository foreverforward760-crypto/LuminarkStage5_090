// state.js - KAIROS State Manager (Pub/Sub + browser localStorage)\n// Journal and check-in content is stored locally in the browser and is not encrypted by this app.
// ✅ PERF FIX A: Debounced localStorage writes (300ms idle delay)

class StateManager {
    constructor() {
        this.state = {
            nsdt: [5.0, 5.5, 6.0, 5.2, 5.8],
            nsdtVector: [50, 60, 40, 65, 72], // Engine order [N,S,T,D,C] 0-100
            history: [],
            sessionHistory: [],
            contentHistory: [],
            currentCategory: 'flow',
            pressure: 0.3,
            confidence: 0.7,
            decision: { mode: 'act', urgency: 0.2, delay: false },
            sapStage: null,
            journalEntries: [],
            culturalContext: {
                codeSwitching: false,
                historicalTrauma: false,
                systemicOppression: false,
                multilingual: false,
                diaspora: false
            },
            maatHistory: [],
            predictions: [],
        };
        this.observers = [];
        this.debounceTimer = null;
        this.pendingSave = false;
        this.loadFromStorage();
        this.applyDecay();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('kairos_state_v2');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state = { ...this.state, ...parsed };
            }
        } catch(e) {}
    }

    // ✅ PERF FIX A: Debounced save (300ms idle delay)
    saveToStorage() {
        try {
            localStorage.setItem('kairos_state_v2', JSON.stringify(this.state));
        } catch(e) {}
    }

    // ✅ PERF FIX A: Debounce wrapper
    debouncedSave() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.pendingSave = true;
        this.debounceTimer = setTimeout(() => {
            this.saveToStorage();
            this.pendingSave = false;
        }, 300);
    }

    subscribe(fn) { this.observers.push(fn); }

    notify() {
        this.observers.forEach(fn => fn(this.state));
        this.debouncedSave(); // ✅ Use debounced save instead of direct
    }

    updateNSDT(arr) {
        this.state.nsdt = arr;
        this.state.sessionHistory.push({ timestamp: Date.now(), nsdt: [...arr] });
        this.applyDecay();
        this.notify();
    }

    updateNSDTVector(vec) {
        this.state.nsdtVector = vec;
        this.notify();
    }

    updateMetrics(category, pressure, confidence, decision, sapStage) {
        this.state.currentCategory = category;
        this.state.pressure = pressure;
        this.state.confidence = confidence;
        this.state.decision = decision;
        this.state.sapStage = sapStage;
        this.notify();
    }

    addContentHistory(entry) {
        this.state.contentHistory.push({ id: entry.id, timestamp: Date.now() });
        if (this.state.contentHistory.length > 200) {
            this.state.contentHistory = this.state.contentHistory.slice(-200);
        }
        this.notify();
    }

    addJournalEntry(text) {
        this.state.journalEntries.unshift({ text, timestamp: Date.now(), category: this.state.currentCategory });
        if (this.state.journalEntries.length > 100) {
            this.state.journalEntries = this.state.journalEntries.slice(0, 100);
        }
        this.notify();
    }

    addMaatInteraction(confessionId, action) {
        if (!this.state.maatHistory) this.state.maatHistory = [];
        this.state.maatHistory.push({ confessionId, action, timestamp: Date.now() });
        if (this.state.maatHistory.length > 100) {
            this.state.maatHistory = this.state.maatHistory.slice(-100);
        }
        this.notify();
    }

    addPrediction(prediction) {
        if (!this.state.predictions) this.state.predictions = [];
        this.state.predictions.push({ ...prediction, timestamp: Date.now(), verified: null });
        this.notify();
    }

    verifyPrediction(predictionId, wasAccurate) {
        const pred = (this.state.predictions || []).find(p => p.id === predictionId);
        if (pred) { pred.verified = wasAccurate; pred.verifiedAt = Date.now(); this.notify(); }
    }

    setCulturalContext(updates) {
        this.state.culturalContext = { ...this.state.culturalContext, ...updates };
        this.notify();
    }

    getContentHistoryIds() {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return this.state.contentHistory.filter(h => h.timestamp > cutoff).map(h => h.id);
    }

    applyDecay() {
        const now = Date.now();
        const limit = 36 * 60 * 60 * 1000;
        this.state.sessionHistory = this.state.sessionHistory.filter(e => now - e.timestamp < limit);
    }

    // Flush pending saves on demand (e.g., before page unload)
    flushSave() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        if (this.pendingSave) this.saveToStorage();
    }
}

export const stateManager = new StateManager();

// ✅ Flush on unload
window.addEventListener('beforeunload', () => {
    stateManager.flushSave();
});
