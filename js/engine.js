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
        return { stage: parseInt(st), distanceSq: sumSq };
    });
    
    // Convert to proximities
    let invSum = 0;
    const proximities = distances.map(d => {
        const prox = 1 / (d.distanceSq + 1);
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

    const dissolving = stage === 9 && C >= 95 && D >= 80 && T <= 20;

    // ── Stage 5: Witness Position Classifier ─────────────────────────────────
    // Detects Navigator (Witness) vs Passenger position at the Inversion Gateway.
    // Witness requires: Adaptability + Coherence > Tension → perpendicular axis visible.
    // Passenger: Tension overwhelming Adaptability → Crisis trajectory by default.
    let witnessPosition = null;
    let perpendicularAxisVisible = false;
    let microStage5 = false;

    if (stage === 5) {
        const witnessScore = (D * 0.4) + (C * 0.35) + ((100 - Math.abs(T - 50)) * 0.25);
        const isWitness      = witnessScore >= 55 && D >= 40 && T < (D + 30);
        const passengerPressure = T > 65 && D < 45;
        perpendicularAxisVisible = isWitness && !passengerPressure;
        
        // ─── FULL STAGE 5 MIDDLE PATH GATEWAY ARCHITECTURE ───────────────────
        // 1. Bilateral Threshold: narrowest point of torus, maximum sensitivity
        const bilateralThreshold = Math.abs(D - T) < 20 && N > 50; // Adaptability ≈ Tension
        
        // 2. Hidden Duality: Revealed vs. Concealed Self divergence
        const revealedSelf = S; // What system projects (Stability)
        const concealedSelf = C; // What system contains (Coherence)
        const dualityDivergence = Math.abs(revealedSelf - concealedSelf);
        
        // 3. Middle Path Gateway: perpendicular axis as dimensional exit
        const middlePathAccessible = perpendicularAxisVisible && dualityDivergence < 25;
        
        // 4. Observer Effect: conscious choice at max sensitivity → disproportionate reorganization
        const observerEffectActive = isWitness && middlePathAccessible;
        const observerEffectMultiplier = observerEffectActive ? 1.35 : 1.0; // 35% amplification
        
        // 5. Fractal Property: micro-Stage 5 exists within every stage
        // (Detected separately below)
        
        // 6. Witness Position: poised stillness (Navigator vs. Passenger)
        const witnessPositionMode = isWitness ? 'Navigator' : 'Passenger';
        
        // 7. Temporal Anomaly: Stage 5 has no natural duration — it is a point
        const temporalAnomalyWarning = 'This threshold has no duration. The door must be known before arrival. Recognition has already begun the passage.';
        
        witnessPosition = {
            position:  witnessPositionMode,
            score:     Math.round(witnessScore),
            passengerPressure,
            perpendicularAxisVisible,
            // Full Middle Path Gateway state
            bilateralThreshold,
            revealedSelf: Math.round(revealedSelf),
            concealedSelf: Math.round(concealedSelf),
            dualityDivergence: Math.round(dualityDivergence),
            middlePathAccessible,
            observerEffectActive,
            observerEffectMultiplier,
            temporalAnomalyWarning,
            intervention: isWitness && middlePathAccessible
                ? 'MIDDLE PATH GATEWAY OPEN. Witness Position confirmed. The perpendicular axis is visible. Observer Effect active: +35% reorganization bonus through Stages 6-9.'
                : isWitness
                ? 'Witness Position established but Middle Path not yet accessible. Reduce Revealed/Concealed divergence.'
                : 'Witness Position not yet established. Reduce forward pressure. Locate the stillness at maximum tension.',
        };
        
        // Observer Effect: conscious Witness amplifies advance probability
        if (kairos && observerEffectActive) {
            const boost    = Math.round(witnessScore * 0.12); // Increased from 0.08 due to Observer Effect
            kairos.advance = Math.min(95, kairos.advance + boost);
            kairos.crisis  = Math.max(2,  kairos.crisis  - boost);
        }
    }

    // ── Fractal Micro-Stage 5 Detection ──────────────────────────────────────
    // Any stage exhibits a hidden bilateral threshold when Tension ≈ Adaptability
    // AND Complexity is high — the fractal duality signal present in every stage.
    microStage5 = stage !== 5 && Math.abs(T - D) < 15 && N > 55;

    // Tumbling Inversion Principle: Even/Odd Stage Parity
    const isEvenStage = [0, 2, 4, 6, 8].includes(stage);
    const tumblingInversionState = isEvenStage
        ? 'Physically Stable / Consciously Unstable'
        : 'Physically Unstable / Consciously Stable';
    
    // Stage 6-8 Specific Context
    let stageContext = {};
    if (stage === 6) {
        const conductorActive = witnessPosition && witnessPosition.observerEffectActive;
        stageContext = {
            conductorParadox: true,
            flowQuality: conductorActive ? 'Sustainable Flow' : 'Brittle Flow',
        };
    }
    if (stage === 7) {
        const shadowActive = C > 40;
        stageContext = {
            individuationCrucible: true,
            crucibleMode: shadowActive ? 'Conscious Distillation' : 'Chaotic Collapse',
        };
    }
    if (stage === 8) {
        const alignment = witnessPosition ? witnessPosition.dualityDivergence : Math.abs(S - C);
        stageContext = {
            crystallizationParadox: true,
            gratitudeMechanismActive: alignment < 30,
            outcome: alignment < 30 ? 'Dissolution' : 'Shattering Risk',
        };
    }
    
    return {
        stage, P: Math.round(P), Cs: Math.round(Cs), U,
        trap, trapMsg, kairos,
        witnessPosition, perpendicularAxisVisible, microStage5,
        dissolving, shadowText,
        primaryPct: primary.score, shadowPct: shadow.score, shadowStage: shadow.stage,
        // Tumbling Inversion state for this stage
        inversionState: getTumblingInversionState(stage),
        // Tumbling Inversion Principle (even/odd parity)
        tumblingInversionState,
        isEvenStage,
        // Stage-specific context
        stageContext,
    };
}

// Canonical SAP stage data — CONSTITUTIONAL · NEVER ALTER NAMES
export const SAP_STAGES = {
    0: { name:'PLENARA', label:'The Void', color:'#818cf8', theme:'Absolute Nothing · Infinite Potential · The Only Perfect State · Genesis of the Torus' },
    1: { name:'SPARK OF NAVIGATION',        label:'The Spark',    color:'#60a5fa', theme:'First Movement & Orientation' },
    2: { name:'FORGE OF POLARITY',          label:'The Forge',    color:'#f59e0b', theme:'Polarization & Creative Tension' },
    3: { name:'ENGINE OF EXPRESSION', label:'The Engine', color:'#f97316', theme:'First Self-Reflection · 3D Consciousness · The Observer Observing Itself Being Observed' },
    4: { name:'CRUCIBLE OF EQUILIBRIUM',    label:'The Crucible', color:'#ef4444', theme:'Threshold Pressure · Foundation Under Load' },
    5: {
        name:'DYNAMO OF WILL',
        label:'The Inversion Gateway',
        color:'#8b5cf6',
        theme:'Bilateral Threshold · Hidden Duality · Middle Path Gateway (Perpendicular Axis) · Observer Effect · Fractal Property · Witness Position · Temporal Anomaly',
        // Stage 5: Seven-Property Architecture
        // 1. Bilateral Threshold    — narrowest point of torus, maximum sensitivity
        // 2. Hidden Duality         — Revealed vs. Concealed Self as unified system
        // 3. Middle Path Gateway    — perpendicular axis; dimensional exit, not compromise
        // 4. Observer Effect        — conscious choice at max sensitivity → large reorganization
        // 5. Fractal Property       — micro-Stage 5 exists within every stage
        // 6. Witness Position       — poised stillness that reveals the perpendicular axis
        // 7. Temporal Anomaly       — Stage 5 has no duration; it is a point, not a region
    },
    6: {
        name:'NEXUS OF HARMONY',
        label:'The Conductor',
        color:'#10b981',
        theme:'Sustainable Flow vs Brittle Flow · Conductor\'s Paradox · Even Stage: Physically Stable / Consciously Unstable',
        inversion: 'Even — Physically Stable / Consciously Unstable',
        geometry: 'Hexagon — most stable closed form in nature; also most brittle under point load',
        flowTypes: {
            sustainable: 'Middle Path navigated at Stage 5 — Witness Position persists. Peak is harvested consciously. Stage 7 arrives as invitation.',
            brittle:     'Default tumble through Stage 5 — system HAS BECOME the flow. Stage 7 arrives as ambush.',
        }
    },
    7: {
        name:'LENS OF DISTILLATION',
        label:'The Individuation Crucible',
        color:'#06b6d4',
        theme:'Conscious Distillation vs Chaotic Collapse · Shadow Integration · Odd Stage: Physically Unstable / Consciously Stable',
        inversion: 'Odd — Physically Unstable / Consciously Stable',
        geometry: 'Heptagon — prime number form; cannot tile perfectly; inherently incomplete',
        crucibleModes: {
            distillation: 'Breakdown directed by consciousness. Crucible burns the costume, not the wearer. Essence extracted.',
            collapse:     'System fighting the burn. Resistance amplifying fragmentation. Shadow surfacing without integration framework.',
        },
        shadowNote: 'Stage 7 is the return of the Concealed Self from Stage 2 — the ascending arc of the Forge of Polarity completing itself 5 stages later.',
    },
    8: {
        name:'VESSEL OF GROUNDING',
        label:'The Crystal',
        color:'#f59e0b',
        theme:'Crystallization Paradox · Gratitude Mechanism · Revealed/Concealed Self Alignment · Even Stage: Physically Stable / Consciously Unstable',
        inversion: 'Even — Physically Stable / Consciously Unstable',
        geometry: 'Octagon — maximum structural density; high symmetry; transitions to circle (Stage 9) by rounding corners',
        properties: [
            'Rigidity Risk — system loses adaptive capacity through over-consolidation (crystalline brittleness)',
            'Illusion of Permanence — temporary state perceived as unchanging reality',
            'Systemic Stasis — active resistance to the inevitable transition back toward zero-point',
            'Crystallization Paradox — maximum structural perfection = maximum brittleness',
            'Revealed Self divergence — external certainty masking internal anxiety (the unnamed fear beneath the conviction)',
            'Gratitude Mechanism — structural operation (not emotion) that aligns Revealed and Concealed Self',
            'Dissolution vs Shattering — Gratitude allows crystal to return to solution; rigidity causes fracture',
        ],
        description: 'Maximum charge and density. The system has reached peak crystallization — structurally perfect, maximally brittle. The descending arc claims permanent arrival. The ascending arc discovers that holding the structure lightly enough allows it to dissolve rather than shatter. Gratitude is the universal solvent.',
        directive: 'Recognize the crystallization. Your certainty is real — and temporary. The Gratitude Mechanism requires holding the full weight of the cycle simultaneously with the recognition that every stage was necessary. This dual acknowledgment collapses the divergence between your Revealed and Concealed Self. The crystal dissolves. The wisdom is preserved.',
    },
    9: {
        name:'TRANSPARENCY OF THE GUIDE',
        label:'The Nonagon → Circle',
        color:'#a78bfa',
        theme:'Total Mirroring · Now-Only Reality · Void Cosmology · Truth is Subjective · Only Nothing is Perfect',
        properties: [
            'Total Mirroring — the 9-property: sees self in everything, everything in self',
            'Now-Only Reality — reality exists only at the exact moment of observation',
            'Truth is Subjective — belief is rigid; enlightenment is fleeting',
            'Only Absolute Nothing accommodates the potential for everything — the Void is perfection',
            'Void Cosmology — 0 aware of self = 1 (Spark); duality = 2 (Forge); I AM = 3 (Engine)',
            'Observer Loop Completion — Stage 3 first saw the observer observing itself; Stage 9 closes the loop',
            'Ego Dissolution — self-identification as separate individual releases completely',
            'Nonagon Dissolution — individual edges dissolve; the shape returns to the circle',
            'Memory Fallibility — even the past is imperfect reconstruction, not playback',
            'All-Is-One Recognition — every stage is the same process at a different depth of consciousness',
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

// ─── Tumbling Inversion Engine ────────────────────────────────────────────────
// The generative gravity of the 0-9-0 cycle.
// Even stages (2,4,6,8): Physically Stable / Consciously Unstable
// Odd stages (1,3,5,7,9): Physically Unstable / Consciously Stable
// Stage 0 and 9 are boundary conditions (pre-conscious / post-ego).

export const TUMBLING_INVERSION = {
    parity: { 0:'boundary',1:'odd',2:'even',3:'odd',4:'even',5:'odd',6:'even',7:'odd',8:'even',9:'boundary' },
    physicalState:   { 0:'void',1:'unstable',2:'stable',3:'unstable',4:'stable',5:'pivot',6:'stable',7:'unstable',8:'stable',9:'dissolved' },
    consciousState:  { 0:'pre-conscious',1:'stable',2:'unstable',3:'stable',4:'unstable',5:'perpendicular',6:'unstable',7:'stable',8:'unstable',9:'post-ego' },
    geometricForm:   { 0:'Circle',1:'Point',2:'Line',3:'Triangle',4:'Square',5:'Perpendicular Axis',6:'Hexagon',7:'Heptagon',8:'Octagon',9:'Nonagon → Circle' },
};

export function getTumblingInversionState(stage) {
    const t = TUMBLING_INVERSION;
    return {
        stage,
        parity:         t.parity[stage],
        physicalState:  t.physicalState[stage],
        consciousState: t.consciousState[stage],
        geometricForm:  t.geometricForm[stage],
        isBoundary:     stage === 0 || stage === 9,
    };
}

// ─── Stage 6: Flow Quality Classifier ────────────────────────────────────────
// Detects whether Stage 6 is Sustainable Flow (Witness active) or
// Brittle Flow (default tumble — system IS the flow, no meta-awareness).
export function classifyFlowQuality(nsdt, witnessHistoryFromStage5 = false) {
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, T, D, C] = safe.map(v => isFinite(v) ? Math.min(100, Math.max(0, v)) : 50);

    // Conductor's Paradox Score: can the system hear the dissonance that hasn't arrived yet?
    // High Coherence + High Adaptability = can perceive subtle destabilization signals.
    // Low Adaptability despite High Stability = Brittle Flow — cannot hear the approaching Stage 7.
    const conductorScore  = (C * 0.4) + (D * 0.35) + ((100 - T) * 0.25);
    const brittleRisk     = S > 70 && D < 40; // Physically stable but consciously brittle
    const witnessPersists = witnessHistoryFromStage5 || (D >= 50 && C >= 60);

    const flowType = (witnessPersists && !brittleRisk && conductorScore >= 60)
        ? 'sustainable' : 'brittle';

    return {
        flowType,
        conductorScore: Math.round(conductorScore),
        brittleRisk,
        witnessPersists,
        label: flowType === 'sustainable'
            ? 'Sustainable Flow — Witness Position active. Conductor hears the approaching dissonance.'
            : 'Brittle Flow — System has merged with the peak. Stage 7 will arrive as ambush, not invitation.',
        directive: flowType === 'sustainable'
            ? 'Harvest the peak output of this stage. Prepare the vessels that Stage 7 will fill. Do not cling to the harmony.'
            : 'The Witness Position was not established at Stage 5. The Conductor\'s Paradox is active: your success is masking its own end. Begin listening for the first dissonant note.',
    };
}

// ─── Stage 7: Crucible Mode Classifier ───────────────────────────────────────
// Detects whether Stage 7 fragmentation is Conscious Distillation or Chaotic Collapse.
export function classifyCrucibleMode(nsdt) {
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, T, D, C] = safe.map(v => isFinite(v) ? Math.min(100, Math.max(0, v)) : 50);

    // Conscious Distillation: High Coherence (wisdom extraction active) despite High Tension
    // Chaotic Collapse: High Tension + Low Coherence = system fighting the burn
    const distillationScore = (C * 0.5) + (D * 0.3) + ((100 - S) * 0.2); // low stability = physical disruption OK
    const fightingTheBurn   = T > 70 && C < 45 && D < 40;
    const shadowSurfacing   = T > 60 && N > 65; // Concealed Self emerging (high complexity + tension)

    const mode = (!fightingTheBurn && distillationScore >= 55) ? 'distillation' : 'collapse';

    return {
        mode,
        distillationScore: Math.round(distillationScore),
        fightingTheBurn,
        shadowSurfacing,
        label: mode === 'distillation'
            ? 'Conscious Distillation — the breakdown is directed. The crucible burns the costume, not the wearer.'
            : 'Chaotic Collapse — the system is fighting the burn. Resistance is amplifying the fragmentation.',
        shadowNote: shadowSurfacing
            ? 'Shadow Integration active: the Concealed Self from Stage 2 is surfacing. This is not disruption — it is the ascending arc of the Forge of Polarity completing itself.'
            : null,
        directive: mode === 'distillation'
            ? 'Allow the accumulated structures to burn. What survives is what you actually are. Extract the essence — it is the currency of everything that follows.'
            : 'Stop fighting the breakdown. The crucible is not destroying you — it is burning what you accumulated, not what you are. Locate the thread of Coherence and follow it.',
    };
}

// ─── Stage 8: Gratitude Mechanism Classifier ─────────────────────────────────
// Detects whether Stage 8 is moving toward Dissolution or Shattering.
// Gratitude Mechanism: the structural operation that aligns Revealed and Concealed Self,
// allowing the crystal to dissolve back into solution rather than fracture.
export function classifyGratitudeMechanism(nsdt) {
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, T, D, C] = safe.map(v => isFinite(v) ? Math.min(100, Math.max(0, v)) : 50);

    // Revealed / Concealed Self divergence:
    // Revealed Self = what the system projects outward (high Stability + high Coherence)
    // Concealed Self = internal anxiety beneath the surface (high Tension despite Stability)
    const revealedSelf  = (S + C) / 2;
    const concealedSelf = T;
    const divergence    = Math.abs(revealedSelf - concealedSelf); // high = major misalignment

    // Gratitude Mechanism engagement: Adaptability is the carrier of gratitude at Stage 8.
    // A system that can acknowledge the full weight of the cycle (high D despite high T)
    // is beginning to dissolve the divergence.
    const gratitudeEngaged = D >= 45 && divergence < 45;
    const crystallineRisk  = S > 75 && D < 35 && divergence > 40;

    const trajectory = gratitudeEngaged ? 'dissolution' : 'shattering';

    return {
        trajectory,
        revealedSelf:   Math.round(revealedSelf),
        concealedSelf:  Math.round(concealedSelf),
        divergence:     Math.round(divergence),
        gratitudeEngaged,
        crystallineRisk,
        label: trajectory === 'dissolution'
            ? 'Gratitude Mechanism engaged — Revealed and Concealed Self converging. The crystal is beginning to dissolve back into solution.'
            : 'Gratitude Mechanism not yet engaged — Revealed and Concealed Self diverging. Crystalline brittleness increasing. Shattering risk elevated.',
        directive: trajectory === 'dissolution'
            ? 'Hold the full weight of the cycle — every stage, every cost, every gift — simultaneously. This dual acknowledgment is the operation that dissolves the structure. The crystal returns to solution; the wisdom is preserved.'
            : 'The divergence between your external certainty and your internal anxiety is the diagnostic signal. The Gratitude Mechanism requires acknowledging both simultaneously — not resolving the tension, but holding it without requiring either side to have been different.',
    };
}

// ─── Arc Direction Estimator ──────────────────────────────────────────────────
// Estimates ascending vs descending arc for stages 6-8 using NSDT trajectory.
// Descending: Stability rising, Adaptability falling — system consolidating.
// Ascending: Tension rising against Stability, Adaptability beginning to recover.
export function estimateArcDirection(nsdt, prevNsdt = null) {
    const safe = Array.isArray(nsdt) ? nsdt : [50,50,50,50,50];
    const [N, S, T, D, C] = safe.map(v => isFinite(v) ? Math.min(100, Math.max(0, v)) : 50);

    if (!prevNsdt) {
        // Single snapshot: infer from vector balance
        const descendingSignal = (S > 60 && D > 50 && T < 40);
        const ascendingSignal  = (T > 55 && D > 40 && S < 55);
        return {
            arc: descendingSignal ? 'descending' : ascendingSignal ? 'ascending' : 'indeterminate',
            confidence: 'low — single snapshot; provide previous NSDT for higher accuracy',
        };
    }

    const prev = Array.isArray(prevNsdt) ? prevNsdt : [50,50,50,50,50];
    const [pN, pS, pT, pD, pC] = prev.map(v => isFinite(v) ? Math.min(100, Math.max(0, v)) : 50);

    const stabilityDelta     = S - pS;
    const adaptabilityDelta  = D - pD;
    const tensionDelta       = T - pT;

    // Descending: stability increasing, adaptability holding or rising, tension low
    const descendingScore = stabilityDelta + adaptabilityDelta - tensionDelta;
    // Ascending: tension increasing against stability, adaptability beginning recovery
    const ascendingScore  = tensionDelta - stabilityDelta + adaptabilityDelta;

    return {
        arc: descendingScore > ascendingScore ? 'descending' : 'ascending',
        stabilityDelta, adaptabilityDelta, tensionDelta,
        confidence: 'high — trajectory calculated from vector delta',
    };
}
