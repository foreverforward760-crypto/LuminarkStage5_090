// state.js - KAIROS State Manager (Pub/Sub + localStorage)

class StateManager {
    constructor() {
        this.state = {
            nsdt: [5.0, 5.5, 6.0, 5.2, 5.8],
            nsdtVector: [50, 60, 65, 40, 72], // SAP NSDT [N,S,D,T,C] 0-100
            history: [],
            sessionHistory: [],
            contentHistory: [],
            currentCategory: 'flow',
            pressure: 0.3,
            confidence: 0.7,
            decision: { mode: 'act', urgency: 0.2, delay: false },
            sapStage: null,
            journalEntries: [],
        };
        this.observers = [];
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

    saveToStorage() {
        try { localStorage.setItem('kairos_state_v2', JSON.stringify(this.state)); } catch(e) {}
    }

    subscribe(fn) { this.observers.push(fn); }

    notify() {
        this.observers.forEach(fn => fn(this.state));
        this.saveToStorage();
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

    getContentHistoryIds() {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return this.state.contentHistory.filter(h => h.timestamp > cutoff).map(h => h.id);
    }

    applyDecay() {
        const now = Date.now();
        const limit = 36 * 60 * 60 * 1000;
        this.state.sessionHistory = this.state.sessionHistory.filter(e => now - e.timestamp < limit);
    }
}

export const stateManager = new StateManager();
