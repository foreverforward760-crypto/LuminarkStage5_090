// diagnostic.js — KAIROS self-reflection check-in
// 15-question project-defined NSDT scoring matrix; not a validated psychometric or clinical assessment.
// Stanfield's Axiom of Perpetuity v8.1 · MAAT · Meridian Axiom Alignment Technologies

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
// Questionnaire vector order: [Complexity, Stability, Adaptability, Tension, Coherence].
// app.js explicitly reorders this to the engine's [N, S, T, D, C] input order.
// Scoring: option index 0–n maps to axis values 0.0–1.0

export const NSDT_QUESTIONS = [
    // ── CATEGORY 1: TRAJECTORY & MOMENTUM ──────────────────────────────────
    {
        id: 1,
        category: "Trajectory & Momentum",
        text: "In the last 72 hours, is the effort required to maintain your current pace increasing, decreasing, or plateauing?",
        note: null,
        primaryAxis: "tension",    // axis index 3
        secondaryAxis: "stability", // axis index 1
        options: [
            { text: "Increasing — it demands progressively more to maintain the same output.", scores: [0.7, 0.3, 0.5, 0.8, 0.4] },
            { text: "Plateauing — effort and output are holding in rough equilibrium.",         scores: [0.5, 0.6, 0.5, 0.5, 0.6] },
            { text: "Decreasing — the same output now requires less systemic overhead.",        scores: [0.4, 0.8, 0.6, 0.3, 0.7] },
            { text: "Inconsistent — there is no stable baseline I can measure against.",       scores: [0.8, 0.2, 0.4, 0.7, 0.3] },
        ]
    },
    {
        id: 2,
        category: "Trajectory & Momentum",
        text: "Does waking up feel like a fresh 'upload' of new data or a 'reboot' of an old systemic error?",
        note: null,
        primaryAxis: "coherence",
        secondaryAxis: "stability",
        options: [
            { text: "Upload — I wake with new signal, forward orientation, and usable energy.",   scores: [0.5, 0.8, 0.7, 0.3, 0.8] },
            { text: "Mixed — some mornings upload, some mornings error-state.",                   scores: [0.6, 0.5, 0.5, 0.5, 0.5] },
            { text: "Reboot of old error — I wake into the same unresolved system state.",        scores: [0.6, 0.3, 0.3, 0.7, 0.3] },
            { text: "I cannot distinguish — my waking state carries no reliable signature.",      scores: [0.8, 0.2, 0.3, 0.8, 0.2] },
        ]
    },
    {
        id: 3,
        category: "Trajectory & Momentum",
        text: "When you consider your current path, do you feel you are moving toward a center or drifting toward a boundary?",
        note: null,
        primaryAxis: "coherence",
        secondaryAxis: "adaptability",
        options: [
            { text: "Toward a center — convergence, increasing clarity, increasing coherence.", scores: [0.5, 0.7, 0.6, 0.3, 0.8] },
            { text: "Stationary — no perceptible trajectory at this time.",                    scores: [0.3, 0.6, 0.4, 0.4, 0.5] },
            { text: "Toward a boundary — expansion, pressure against edges, systemic limit.",  scores: [0.7, 0.4, 0.5, 0.7, 0.5] },
            { text: "Drifting — no center and no boundary I can orient to.",                   scores: [0.8, 0.2, 0.3, 0.6, 0.2] },
        ]
    },

    // ── CATEGORY 2: COMPLEXITY & BANDWIDTH ─────────────────────────────────
    {
        id: 4,
        category: "Complexity & Bandwidth",
        text: "How many 'open tabs' are currently running in your mind that you feel you cannot close?",
        note: null,
        primaryAxis: "complexity",
        secondaryAxis: "tension",
        options: [
            { text: "None or very few — my mental workspace is largely uncluttered.",       scores: [0.2, 0.8, 0.7, 0.2, 0.8] },
            { text: "A manageable number — load is present but within operational limits.", scores: [0.5, 0.6, 0.6, 0.4, 0.6] },
            { text: "Many — I am running above comfortable capacity.",                      scores: [0.7, 0.4, 0.4, 0.7, 0.4] },
            { text: "System-saturating — cognitive bandwidth is critically overloaded.",    scores: [0.9, 0.2, 0.3, 0.9, 0.2] },
        ]
    },
    {
        id: 5,
        category: "Complexity & Bandwidth",
        text: "Does your current environment feel like a source of raw data or a source of overwhelming noise?",
        note: null,
        primaryAxis: "complexity",
        secondaryAxis: "coherence",
        options: [
            { text: "Raw data — signal is present, filterable, and usable.",                    scores: [0.5, 0.7, 0.7, 0.3, 0.7] },
            { text: "Both — there is signal but it requires significant energy to extract.",    scores: [0.7, 0.5, 0.5, 0.6, 0.5] },
            { text: "Overwhelming noise — signal-to-noise ratio is critically degraded.",       scores: [0.9, 0.3, 0.3, 0.8, 0.2] },
            { text: "Neither — my environment is generating no detectable signal at all.",      scores: [0.2, 0.5, 0.4, 0.4, 0.3] },
        ]
    },
    {
        id: 6,
        category: "Complexity & Bandwidth",
        text: "When processing a complex problem, does your mind seek to simplify it (Entropy reduction) or expand upon it (Integration)?",
        note: null,
        primaryAxis: "complexity",
        secondaryAxis: "adaptability",
        options: [
            { text: "Simplify — I distill to the irreducible core before anything else.",  scores: [0.4, 0.7, 0.5, 0.3, 0.8] },
            { text: "Both, in sequence — expansion first, then reduction.",                scores: [0.7, 0.6, 0.7, 0.5, 0.7] },
            { text: "Expand — I integrate more variables, more context, more depth.",      scores: [0.8, 0.5, 0.8, 0.5, 0.5] },
            { text: "Neither — processing complex problems currently feels blocked.",      scores: [0.7, 0.3, 0.2, 0.8, 0.3] },
        ]
    },

    // ── CATEGORY 3: CULTURAL INTELLIGENCE & RESILIENCE ─────────────────────
    {
        id: 7,
        category: "Cultural Intelligence & Resilience",
        text: "How quickly can you shift your tone or approach when your environment or the 'audience' around you changes?",
        note: "This response option applies a project-defined +20% adjustment to the Adaptability score; it is not a validated correction.",
        primaryAxis: "adaptability",
        secondaryAxis: "complexity",
        culturalCorrection: true,  // Q7 triggers +20% adaptability for survival brilliance
        options: [
            { text: "Instantly — code-switching is an automatic, low-cost operation for me.",          scores: [0.7, 0.5, 1.0, 0.4, 0.7] },
            { text: "Quickly — I adapt within minutes with minimal cognitive overhead.",               scores: [0.6, 0.6, 0.8, 0.4, 0.7] },
            { text: "With effort — shifting requires deliberate energy and may lag the situation.",    scores: [0.5, 0.6, 0.5, 0.5, 0.5] },
            { text: "Poorly or not at all — adaptation under environmental pressure is very costly.", scores: [0.4, 0.7, 0.2, 0.6, 0.5] },
        ]
    },
    {
        id: 8,
        category: "Cultural Intelligence & Resilience",
        text: "When you feel hyper-vigilant, do you view it as a 'disorder' or a necessary defensive 'firewall'?",
        note: null,
        primaryAxis: "adaptability",
        secondaryAxis: "tension",
        options: [
            { text: "As a firewall — it is adaptive intelligence responding to a historically threatening environment.", scores: [0.6, 0.5, 0.8, 0.5, 0.6] },
            { text: "Both — it serves a protective function but also imposes overhead cost.",                           scores: [0.6, 0.5, 0.6, 0.6, 0.5] },
            { text: "As a disorder — I experience it primarily as a dysfunction.",                                     scores: [0.5, 0.4, 0.4, 0.7, 0.4] },
            { text: "I do not experience hyper-vigilance in a way I can assess.",                                      scores: [0.4, 0.6, 0.5, 0.3, 0.6] },
        ]
    },
    {
        id: 9,
        category: "Cultural Intelligence & Resilience",
        text: "How much of your daily energy is spent 'translating' your true self into a version others can understand?",
        note: null,
        primaryAxis: "tension",
        secondaryAxis: "coherence",
        options: [
            { text: "Very little — I operate with high authenticity and low translation cost.",         scores: [0.4, 0.7, 0.7, 0.2, 0.8] },
            { text: "A moderate amount — translation is a background process I manage.",               scores: [0.6, 0.5, 0.6, 0.5, 0.5] },
            { text: "A significant amount — translation is a primary energy drain.",                   scores: [0.7, 0.4, 0.5, 0.7, 0.4] },
            { text: "Almost entirely — authentic self-expression is rarely available in my context.", scores: [0.8, 0.3, 0.3, 0.9, 0.2] },
        ]
    },

    // ── CATEGORY 4: TENSION & TRAP ENERGY ──────────────────────────────────
    {
        id: 10,
        category: "Tension & Trap Energy",
        text: "When you encounter a recurring obstacle, is your response: Innovation, Indifference, or a sense of 'Here we go again'?",
        note: "This answer option triggers a project-defined loop-pattern flag in the reflection summary; it is not a clinical or psychological finding.",
        primaryAxis: "tension",
        secondaryAxis: "adaptability",
        cynicalLoopProbe: true,
        options: [
            { text: "Innovation — I consistently generate new approaches to persistent problems.", scores: [0.7, 0.5, 0.8, 0.3, 0.7] },
            { text: "Indifference — the obstacle no longer registers as a significant variable.",  scores: [0.3, 0.7, 0.5, 0.2, 0.6] },
            { text: "'Here we go again' — I recognize the loop but feel trapped within it.",       scores: [0.6, 0.4, 0.3, 0.8, 0.3] },
            { text: "Avoidance — I route around the obstacle rather than engaging it directly.",   scores: [0.5, 0.5, 0.4, 0.6, 0.4] },
        ]
    },
    {
        id: 11,
        category: "Tension & Trap Energy",
        text: "Does your current level of motivation feel like a 'Push' (Duty/obligation) or a 'Pull' (Inspiration/alignment)?",
        note: null,
        primaryAxis: "coherence",
        secondaryAxis: "tension",
        options: [
            { text: "Pure Pull — I am drawn forward by genuine alignment with my purpose.",    scores: [0.5, 0.7, 0.7, 0.2, 0.9] },
            { text: "Mostly Pull with some Push — inspiration leads, obligation supports.",    scores: [0.5, 0.6, 0.7, 0.3, 0.7] },
            { text: "Mostly Push with some Pull — obligation leads, inspiration is faint.",   scores: [0.6, 0.5, 0.4, 0.6, 0.4] },
            { text: "Pure Push — I am operating entirely on duty with no inspiring signal.",   scores: [0.6, 0.4, 0.3, 0.8, 0.2] },
            { text: "Neither — motivation is absent in both dimensions.",                      scores: [0.3, 0.3, 0.2, 0.5, 0.2] },
        ]
    },
    {
        id: 12,
        category: "Tension & Trap Energy",
        text: "Are you currently holding a secret, a resentment, or a plan that feels 'heavy' in your physical body?",
        note: null,
        primaryAxis: "tension",
        secondaryAxis: "coherence",
        options: [
            { text: "No — my system is largely clear of stored, unresolved weight.",                  scores: [0.3, 0.7, 0.6, 0.2, 0.8] },
            { text: "Minor — there is some weight but it does not impair function.",                  scores: [0.4, 0.6, 0.5, 0.4, 0.6] },
            { text: "Significant — I am carrying weight that is consuming measurable bandwidth.",      scores: [0.7, 0.4, 0.4, 0.7, 0.4] },
            { text: "Critical — the weight is pervasive and is affecting systemic coherence.",        scores: [0.8, 0.3, 0.3, 0.9, 0.2] },
        ]
    },

    // ── CATEGORY 5: STABILITY & COHERENCE ──────────────────────────────────
    {
        id: 13,
        category: "Stability & Coherence",
        text: "If asked to sit in total silence for 5 minutes right now, would it feel like a relief, a chore, or physically impossible?",
        note: null,
        primaryAxis: "stability",
        secondaryAxis: "tension",
        options: [
            { text: "A relief — silence would be welcome and immediately restorative.",        scores: [0.4, 0.7, 0.6, 0.3, 0.8] },
            { text: "Neutral — I could do it without significant cost or benefit.",            scores: [0.4, 0.7, 0.5, 0.4, 0.6] },
            { text: "A chore — I could manage it but it would require deliberate effort.",     scores: [0.6, 0.5, 0.4, 0.6, 0.4] },
            { text: "Physically impossible — my system cannot sustain that level of stillness.", scores: [0.8, 0.2, 0.3, 0.9, 0.2] },
        ]
    },
    {
        id: 14,
        category: "Stability & Coherence",
        text: "Is your current focus directed at 'fixing the past,' 'securing the present,' or 'building the future'?",
        note: null,
        primaryAxis: "coherence",
        secondaryAxis: "stability",
        options: [
            { text: "Fixing the past — a significant portion of energy is allocated to repair or resolution.", scores: [0.6, 0.4, 0.4, 0.7, 0.3] },
            { text: "Securing the present — stabilizing current position is the primary directive.",          scores: [0.5, 0.8, 0.5, 0.4, 0.7] },
            { text: "Building the future — I am primarily oriented toward forward construction.",             scores: [0.7, 0.5, 0.7, 0.3, 0.6] },
            { text: "All three simultaneously — I am currently operating across all time axes.",             scores: [0.9, 0.5, 0.7, 0.7, 0.5] },
            { text: "None — temporal orientation is unclear or absent at this time.",                        scores: [0.5, 0.3, 0.3, 0.5, 0.3] },
        ]
    },
    {
        id: 15,
        category: "Stability & Coherence",
        text: "Do you feel your 'Heart' is currently lighter than, or heavier than, the 'Feather of Truth' — the Ma'at Balance?",
        note: "The Ma'at Balance: in the Hall of Two Truths, the heart is weighed against the feather. Heaviness is accumulated untruth. Lightness is alignment.",
        primaryAxis: "coherence",
        secondaryAxis: "stability",
        options: [
            { text: "Lighter — I am in alignment with my truth and it costs me very little to carry.", scores: [0.3, 0.8, 0.7, 0.2, 0.9] },
            { text: "Approximately equal — there is balance but it is not effortless.",                scores: [0.5, 0.7, 0.6, 0.4, 0.7] },
            { text: "Heavier — I am carrying weight that I know is not in alignment with my truth.",   scores: [0.6, 0.4, 0.4, 0.7, 0.4] },
            { text: "Much heavier — the accumulated weight is significant and felt somatically.",      scores: [0.7, 0.3, 0.3, 0.8, 0.2] },
        ]
    },
];

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
// Axis index map: [Complexity=0, Stability=1, Adaptability=2, Tension=3, Coherence=4]
const AXIS_NAMES = ['Complexity', 'Stability', 'Adaptability', 'Tension', 'Coherence'];
const AXIS_COLORS = ['#f59e0b', '#60a5fa', '#10b981', '#ef4444', '#a78bfa'];
const AXIS_ABBREV = ['N', 'S', 'A', 'T', 'C'];

export function scoreNSDTMatrix(answers) {
    // answers: Map<questionId, optionIndex>
    if (!answers || answers.size === 0) return [50, 60, 50, 40, 60]; // default

    const sums   = [0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0];
    let culturalAdaptabilityBonus = 0;
    let cynicalLoopDetected = false;

    for (const [qId, optIdx] of answers) {
        const q = NSDT_QUESTIONS.find(x => x.id === qId);
        if (!q) continue;
        const opt = q.options[optIdx];
        if (!opt) continue;

        // Apply cultural correction for Q7 (Survival Brilliance)
        let scores = [...opt.scores];
        if (q.culturalCorrection && optIdx <= 1) {
            // High flexibility on Q7: boost adaptability axis by 20%
            culturalAdaptabilityBonus += 0.20;
        }

        // Detect cynical loop: Q10 option index 2 = "Here we go again"
        if (q.cynicalLoopProbe && optIdx === 2) {
            cynicalLoopDetected = true;
        }

        scores.forEach((s, i) => {
            sums[i] += s;
            counts[i]++;
        });
    }

    // Normalize to 0–100 range
    const vector = sums.map((sum, i) => {
        const base = counts[i] > 0 ? (sum / counts[i]) * 100 : 50;
        return Math.round(Math.min(100, Math.max(0, base)));
    });

    // Apply Cultural Intelligence Adaptability correction
    if (culturalAdaptabilityBonus > 0) {
        vector[2] = Math.min(100, Math.round(vector[2] * (1 + culturalAdaptabilityBonus)));
    }

    return { vector, cynicalLoopDetected, culturalCorrectionApplied: culturalAdaptabilityBonus > 0 };
}

export function hasCynicalLoopSignal(answers) {
    for (const [qId, optIdx] of answers) {
        const q = NSDT_QUESTIONS.find(x => x.id === qId);
        if (q?.cynicalLoopProbe && optIdx === 2) return true;
    }
    return false;
}

export { AXIS_NAMES, AXIS_COLORS, AXIS_ABBREV };


/**
 * Convert questionnaire order [Complexity, Stability, Adaptability, Tension, Coherence]
 * to engine order [N, S, T, D, C] = [Complexity/Novelty, Stability, Tension, Adaptability/Dynamism, Coherence].
 */
export function toEngineVector(questionnaireVector) {
    if (!Array.isArray(questionnaireVector) || questionnaireVector.length !== 5) {
        throw new TypeError('Expected a five-value questionnaire vector.');
    }
    return [questionnaireVector[0], questionnaireVector[1], questionnaireVector[3], questionnaireVector[2], questionnaireVector[4]];
}
