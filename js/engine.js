// engine.js - KAIROS Cognitive Math Engine
// Stanfield's Axiom of Perpetuity · NSDT Vector · MAAT
// Audit v1.1: hardened NaN/zero-entropy edge cases throughout

import { CulturalIntelligenceFilter } from './cultural.js';

export function calculateMean(arr) {
    if (!arr || !arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function calculateStd(arr, mean) {
    if (!arr || arr.length < 2) return 0;
    const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
    const result = Math.sqrt(variance);
    return isFinite(result) ? result : 0;
}

export function calculateEntropy(arr) {
    if (!arr || !arr.length) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;                          // ✅ AUDIT FIX 1: zero-sum guard
    const probs = arr.map(v => v / sum);
    let entropy = 0;
    for (const p of probs) {
        if (p > 0 && isFinite(p)) entropy -= p * Math.log2(p); // ✅ isFinite guard
    }
    return isFinite(entropy) ? entropy : 0;           // ✅ final NaN guard
}

export function computePressureScore(arr) {
    if (!arr || !arr.length) return 0;
    const mean     = calculateMean(arr);
    const std      = calculateStd(arr, mean);
    const entropy  = calculateEntropy(arr);
    const maxEntr  = Math.log2(arr.length);
    const normEntr = maxEntr > 0 ? entropy / maxEntr : 0;
    const normStd  = mean > 0 ? std / mean : 0;
    const result   = 0.6 * normStd + 0.4 * normEntr;
    return isFinite(result) ? Math.min(1, Math.max(0, result)) : 0; // ✅ clamp + NaN guard
}

export function computeConfidenceScore(arr) {
    if (!arr || !arr.length) return 0;
    const mean = calculateMean(arr);
    const std  = calculateStd(arr, mean);
    if (mean === 0) return 0;
    const result = 1 - (std / mean);
    return isFinite(result) ? Math.min(1, Math.max(0, result)) : 0; // ✅ clamp + NaN guard
}

export function getCategory(meanValue) {
    if (!isFinite(meanValue) || meanValue <= 2.5) return 'void';
    if (meanValue <= 4.5) return 'crossroads';
    if (meanValue <= 6.5) return 'flow';
    if (meanValue <= 7.8) return 'heat';
    return 'absolute';
}

export function getPressureLabel(pressure) {
    if (!isFinite(pressure) || pressure < 0.3) return 'Stable';
    if (pressure < 0.5) return 'Tension';
    if (pressure < 0.7) return 'Conflict';
    return 'High Conflict';
}

export function getDecisionSignal(pressure, confidence, stage) {
    // ✅ AUDIT FIX 2: guard against NaN inputs
    const p = isFinite(pressure)   ? pressure   : 0;
    const c = isFinite(confidence) ? confidence : 0;
    if (stage === 8) {
        return { mode: 'disrupt', urgency: 1.0, delay: false, warning: 'Illusion of Permanence' };
    }
    if (p > 0.7) {
        return { mode: c > 0.5 ? 'delay' : 'reflect', urgency: c > 0.5 ? 0.7 : 0.9, delay: true };
    }
    if (p < 0.3) {
        return { mode: 'act', urgency: 0.2, delay: false };
    }
    return { mode: 'paradox', urgency: 0.5, delay: false };
}

const STAGE_CENTROIDS = {
    0: [0, 0, 0, 0, 0],
    1: [10, 80, 10, 10, 10],
    2: [20, 70, 20, 20, 20],
    3: [40, 70, 25, 30, 40],
    4: [35, 65, 30, 35, 50],
    5: [50, 40, 50, 50, 45],
    6: [60, 55, 40, 60, 65],
    7: [65, 30, 70, 70, 35],
    8: [75, 70, 80, 20, 20],
    9: [80, 20, 85, 15, 15],
};

export function classifySAPStage(nsdt) {
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, T, D, C] = safe.map(v => (isFinite(v) ? Math.min(100, Math.max(0, v)) : 50));

    const P  = 0.5*S + 0.3*(100-T) + 0.2*N;
    const Cs = 0.4*C + 0.4*D + 0.2*(100-N);
    const U  = Math.round(0.25*(S/100)*100 + 0.30*(D/100)*100 + 0.20*(T/100)*100 + 0.25*(C/100)*100);

    // Fuzzy Proximity Score
    const distances = Object.entries(STAGE_CENTROIDS).map(([st, centroid]) => {
        let sumSq = 0;
        sumSq += Math.pow(centroid[0] - N, 2);
        sumSq += Math.pow(centroid[1] - S, 2);
        sumSq += Math.pow(centroid[2] - T, 2);
        sumSq += Math.pow(centroid[3] - D, 2);
        sumSq += Math.pow(centroid[4] - C, 2);
        return { stage: parseInt(st), distance: Math.sqrt(sumSq) };
    });
    
    // Convert to proximities
    let invSum = 0;
    const proximities = distances.map(d => {
        const prox = 1 / (d.distance + 1);
        invSum += prox;
        return { stage: d.stage, prox };
    });
    
    proximities.forEach(p => { p.score = (p.prox / invSum) * 100; });
    proximities.sort((a,b) => b.score - a.score);
    
    const primary = proximities[0];
    const shadow = proximities[1];
    
    let stage = primary.stage;
    let trap = false, trapMsg = '';
    
    // Override absolute trap triggers
    if (stage === 6 && D < 30) { trap = true; trapMsg = 'RIGIDITY RISK: Adaptability below threshold while claiming harmony. The system is consolidating prematurely — transition toward Stage 8 Systemic Stasis is indicated.'; }

    const shadowText = `${Math.round(primary.score)}% Stage ${primary.stage} / ${Math.round(shadow.score)}% Stage ${shadow.stage}`;

    let kairos = null;
    if (stage === 5) {
        // Bifurcation Calculus: Weigh D vs T
        const a = Math.max(0.05, (D+C-T-30)/200);
        const r = Math.max(0.05, (T-D+60)/200);
        const c2 = T > 70 ? 0.22 : 0.08;
        const tot = a + r + c2;
        kairos = {
            advance: Math.round(a/tot*100),
            regress: Math.round(r/tot*100),
            crisis:  Math.round(c2/tot*100),
        };
    }

    const dissolving  = stage === 9 && C >= 95 && D >= 80 && T <= 20;

    return { stage, P: Math.round(P), Cs: Math.round(Cs), U, trap, trapMsg, kairos, dissolving, shadowText, primaryPct: primary.score, shadowPct: shadow.score, shadowStage: shadow.stage };
}

// Canonical SAP stage data — CONSTITUTIONAL · NEVER ALTER NAMES
export const SAP_STAGES = {
    0: { name:'PLENARA',                    label:'The Void',     color:'#818cf8', theme:'Dissolution & Primordial Reset' },
    1: { name:'SPARK OF NAVIGATION',        label:'The Spark',    color:'#60a5fa', theme:'First Movement & Orientation' },
    2: { name:'FORGE OF POLARITY',          label:'The Forge',    color:'#f59e0b', theme:'Polarization & Creative Tension' },
    3: { name:'ENGINE OF EXPRESSION',       label:'The Engine',   color:'#f97316', theme:'First Self-Reflection · Creative Emergence · Self-Correction Loop' },
    4: { name:'CRUCIBLE OF EQUILIBRIUM',    label:'The Crucible', color:'#ef4444', theme:'Threshold Pressure · Foundation Under Load' },
    5: {
        name:'DYNAMO OF WILL',
        label:'The Inversion Gateway',
        color:'#8b5cf6',
        theme:'Threshold Point of No Return · Hidden Duality · Crossroads · Inversion Gateway',
        properties: [
            'Threshold Point of No Return — momentum reaches critical mass',
            'Hidden Duality — opposing forces operating as a single unit',
            'Crossroads & Middle Path Gateway — between expansion and contraction',
            'Inversion Gateway — internal logic projects outward with increased intensity',
        ]
    },
    6: { name:'NEXUS OF HARMONY',           label:'The Nexus',    color:'#10b981', theme:'Peak Integration — All Systems Synchronized' },
    7: { name:'LENS OF DISTILLATION',       label:'The Lens',     color:'#06b6d4', theme:'Deep Refinement & Wisdom Integration' },
    8: {
        name:'VESSEL OF GROUNDING',
        label:'The Vessel',
        color:'#f59e0b',
        theme:'Illusion of Permanence · Rigidity Risk · Systemic Stasis',
        properties: [
            'Rigidity Risk — system loses adaptive capacity through over-consolidation',
            'Illusion of Permanence — temporary state perceived as unchanging reality',
            'Systemic Stasis — active resistance to the inevitable transition back toward zero-point',
        ],
        description: 'Maximum charge and density. The system has reached peak consolidation which mimics finality. The descending arc claims permanent arrival. The ascending arc holds embodied wisdom without claiming permanence.',
        directive: 'Recognize the illusion. Your current form is a temporary vessel, not a permanent monument. Prepare for the transparency of Stage 9.'
    },
    9: {
        name:'TRANSPARENCY OF THE GUIDE',
        label:'The Nonagon → Circle',
        color:'#a78bfa',
        theme:'Total Mirroring · Now-Only Reality · Nonagon Dissolution · Return to PLENARA',
        properties: [
            'Total Mirroring — the 9-property: sees self in everything, everything in self',
            'Now-Only Reality — reality exists only at the exact moment of observation',
            'Ego Dissolution — self-identification as separate individual releases completely',
            'Nonagon Dissolution — individual edges dissolve; the shape returns to the circle',
            'Memory Fallibility — even the past is imperfect reconstruction, not playback',
            'All-Is-One Recognition — every stage is the same process at different consciousness depth',
        ]
    },
};

// ─── Cultural Intelligence Integration ───────────────────────────────────────
export function getFinalStage(nsdtArray, userText = '', culturalContext = {}) {
    const baseMean  = calculateMean(nsdtArray);
    const baseStr   = getCategory(baseMean);
    const stageMap  = { 'void':0, 'crossroads':5, 'flow':6, 'heat':4, 'absolute':9 };
    const numericStage = stageMap[baseStr] || 6;
    const corrected = CulturalIntelligenceFilter.applyCorrections(numericStage, userText, culturalContext);
    return {
        baseStage:     numericStage,
        adjustedStage: corrected.adjustedStage,
        corrections:   corrected.corrections,
        ptssDetected:  corrected.ptssDetected,
        ekmanNote:     corrected.ekmanCorrection,
        totalCorrection: corrected.totalCorrection
    };
}
