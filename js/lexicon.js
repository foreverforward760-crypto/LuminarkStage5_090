// lexicon.js — Terminology Adapter for Professional Localization
// Translates SAP canonical terms across industry contexts
// MAAT · Meridian Axiom Alignment Technologies

export const LEXICON = {
    default: {
        stage0: "PLENARA — The Void",
        stage5: "DYNAMO OF WILL — Inversion Gateway · Crossroads · Threshold Point of No Return",
        stage8: "VESSEL OF GROUNDING — Illusion of Permanence · Rigidity Risk · Systemic Stasis",
        rigidity: "Rigidity Risk",
        entropy: "Entropy",
        coherence: "Coherence"
    },
    engineering: {
        stage0: "Ground State Reset (PLENARA)",
        stage5: "Bifurcation Node — Inversion Gateway (DYNAMO OF WILL)",
        stage8: "Systemic Kinetic Stasis — Rigidity Risk · Entropy Ceiling",
        rigidity: "Structural Brittleness Index",
        entropy: "Noise Floor",
        coherence: "Signal Integrity"
    },
    clinical: {
        stage0: "Baseline Restoration (PLENARA)",
        stage5: "Decisional Inversion Gateway (DYNAMO OF WILL) — Threshold Point of No Return",
        stage8: "Chronic Allostatic Load — Illusion of Permanence · Rigidity Risk",
        rigidity: "Cognitive Inflexibility Marker",
        entropy: "Behavioral Variance",
        coherence: "Autonomic Regulation"
    },
    creative: {
        stage0: "The Fertile Void (PLENARA)",
        stage5: "The Inversion Gateway (DYNAMO OF WILL) — Hidden Duality · Middle Path",
        stage8: "The Illusion of Permanence — Rigidity Risk · Systemic Stasis",
        rigidity: "Rigidity Risk · Creative Stasis Index",
        entropy: "Divergent Potential",
        coherence: "Flow Alignment"
    }
};

let currentLexicon = 'default';

export function setLexiconMode(mode) {
    if (LEXICON[mode]) currentLexicon = mode;
    return currentLexicon;
}

export function getTerm(termKey) {
    return LEXICON[currentLexicon][termKey] || LEXICON.default[termKey] || termKey;
}

export function getCurrentMode() {
    return currentLexicon;
}
