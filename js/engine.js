// engine.js - KAIROS Cognitive Math Engine
// Stanfield's Axiom of Perpetuity · NSDT Vector · MAAT
// Audit v1.1: hardened NaN/zero-entropy edge cases throughout

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

// SAP Stage classifier — NSDT 5-vector [N,S,D,T,C] each 0-100
export function classifySAPStage(nsdt) {
    // ✅ AUDIT FIX 3: defensive array guard with safe defaults
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, D, T, C] = safe.map(v => (isFinite(v) ? Math.min(100, Math.max(0, v)) : 50));

    const P  = 0.5*S + 0.3*(100-T) + 0.2*N;
    const Cs = 0.4*C + 0.4*D + 0.2*(100-N);
    const U  = Math.round(0.25*(S/100)*100 + 0.30*(D/100)*100 + 0.20*(T/100)*100 + 0.25*(C/100)*100);

    let stage, trap = false, trapMsg = '';
    if      (C >= 90 && D >= 80 && T <= 20)   stage = 9;
    else if (N<15&&S<20&&T<25&&D<25&&C<25)    stage = 0;
    else if (T > 68 && C > 50 && D < 45)      stage = 8;
    else if (C>72&&D>62&&T>42&&N>48)          stage = 7;
    else if (P>=60&&Cs>=60&&T<52) {
        stage = 6;
        if (D < 30) { trap = true; trapMsg = 'ILLUSION OF PERMANENCE: Adaptability below threshold while claiming harmony. Rigidity masking as stability.'; }
    }
    else if (P>=70&&Cs<58&&S>T)    stage = 1;
    else if (P>=58&&Cs<58&&S<=T)   stage = 2;
    else if (P<50&&Cs>=70&&N<42)   stage = 3;
    else if (P<55&&Cs>=62&&N>=42)  stage = 4;
    else                           stage = 5;

    let kairos = null;
    if (stage === 5) {
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

    const illusionT  = stage === 8 ? Math.min(100, Math.round(T * 1.45)) : null;
    const dissolving  = stage === 9 && C >= 95 && D >= 80 && T <= 20;

    return { stage, P: Math.round(P), Cs: Math.round(Cs), U, trap, trapMsg, kairos, illusionT, dissolving };
}

// Canonical SAP stage data — CONSTITUTIONAL · NEVER ALTER NAMES
export const SAP_STAGES = {
    0: { name:'PLENARA',                    label:'The Void',     color:'#818cf8', theme:'Dissolution & Primordial Reset' },
    1: { name:'SPARK OF NAVIGATION',        label:'The Spark',    color:'#60a5fa', theme:'First Movement & Orientation' },
    2: { name:'FORGE OF POLARITY',          label:'The Forge',    color:'#f59e0b', theme:'Polarization & Creative Tension' },
    3: { name:'ENGINE OF EXPRESSION',       label:'The Engine',   color:'#f97316', theme:'Creative Emergence & 3D Complexity' },
    4: { name:'CRUCIBLE OF EQUILIBRIUM',    label:'The Crucible', color:'#ef4444', theme:'Threshold Pressure' },
    5: { name:'DYNAMO OF WILL',             label:'The Dynamo',   color:'#8b5cf6', theme:'Crossroads & The Backward Doorway' },
    6: { name:'NEXUS OF HARMONY',           label:'The Nexus',    color:'#10b981', theme:'Peak Integration — All Systems Synchronized' },
    7: { name:'LENS OF DISTILLATION',       label:'The Lens',     color:'#06b6d4', theme:'Deep Refinement & Wisdom Integration' },
    8: { 
        name:'VESSEL OF GROUNDING — Illusion of Permanence',
        label:'The Vessel',
        color:'#f59e0b',
        theme:'Consolidation, Grounding & Duality Mastery',
        description:"The peak of systemic density. The system has reached a level of consolidation that mimics finality. This is the 'Trap State' where the current structure claims to be the end-state, creating an illusion that change is no longer necessary or possible.",
        sensation:"Extreme weight, absolute conviction, or a paralyzing fear that the current situation is unchangeable.",
        risk:"Rigidity Risk. The system becomes so 'grounded' it loses the ability to pivot, leading to catastrophic fracture instead of graceful transition.",
        directive:"Recognize the illusion. Your current form is a temporary vessel, not a permanent monument. Prepare for the transparency of Stage 9."
    },
    9: { name:'TRANSPARENCY OF THE GUIDE',  label:'The Guide',    color:'#a78bfa', theme:'Completion, Transparency & Dissolution' },
};
