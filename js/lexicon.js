// lexicon.js — Terminology Adapter for Professional Localization
// Translates SAP canonical terms across industry contexts
// MAAT · Meridian Axiom Alignment Technologies

export const LEXICON = {
    default: {
        stage0: "PLENARA — The Void",
        stage5: "DYNAMO OF WILL — Crossroads",
        stage8: "VESSEL OF GROUNDING — The Illusion of Permanence",
        rigidity: "Rigidity Risk",
        entropy: "Entropy",
        coherence: "Coherence"
    },
    engineering: {
        stage0: "Ground State Reset (PLENARA)",
        stage5: "Bifurcation Node (DYNAMO OF WILL)",
        stage8: "Systemic Kinetic Stasis — Entropy Ceiling",
        rigidity: "Structural Brittleness Index",
        entropy: "Noise Floor",
        coherence: "Signal Integrity"
    },
    clinical: {
        stage0: "Baseline Restoration (PLENARA)",
        stage5: "Decisional Crossroads (DYNAMO OF WILL)",
        stage8: "Chronic Allostatic Load — Perceived Permanence",
        rigidity: "Cognitive Inflexibility Marker",
        entropy: "Behavioral Variance",
        coherence: "Autonomic Regulation"
    },
    creative: {
        stage0: "The Fertile Void (PLENARA)",
        stage5: "The Edge of Becoming (DYNAMO OF WILL)",
        stage8: "The Illusion of Arrival",
        rigidity: "Creative Block Index",
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
