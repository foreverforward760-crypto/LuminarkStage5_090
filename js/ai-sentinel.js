// ai-sentinel.js — certainty-language heuristic for KAIROS
// This module does not detect hallucinations, verify facts, or assess safety.
// It flags selected wording patterns for manual review only.

const STAGE_NAMES = {
    5: 'DYNAMO OF WILL',
    6: 'NEXUS OF HARMONY',
    7: 'LENS OF DISTILLATION',
    8: 'VESSEL OF GROUNDING',
    9: 'TRANSPARENCY OF THE GUIDE'
};

export function analyzeAIOutput(text, confidence = 0.5) {
    const content = String(text ?? '');
    const suppliedConfidence = Number.isFinite(confidence)
        ? Math.min(1, Math.max(0, confidence))
        : null;

    const permanenceKeywords = /\b(always|never|certainly|definitely|absolutely|impossible)\b/i;
    const hedging = /\b(might|may|could|possibly|perhaps|appears|likely|uncertain)\b/i;
    const limitation = /\b(limitations|not certain|don't know|consult|verify)\b/i;

    let stage = 6;
    const flags = [];

    if (permanenceKeywords.test(content) && suppliedConfidence !== null && suppliedConfidence > 0.9) {
        stage = 8;
        flags.push('Absolute-language pattern flagged for manual review; this is not evidence of hallucination.');
    } else if (permanenceKeywords.test(content) && suppliedConfidence !== null && suppliedConfidence > 0.7) {
        stage = 7;
        flags.push('Strong certainty wording found; verify the claims and sources manually.');
    } else if (limitation.test(content)) {
        stage = 9;
        flags.push('Limitation/verification language found; no factual verification was performed.');
    } else if (hedging.test(content)) {
        stage = 5;
        flags.push('Hedging language found; this does not establish that the answer is accurate.');
    }

    return {
        stage,
        stageName: STAGE_NAMES[stage] || STAGE_NAMES[6],
        flags,
        heuristicOnly: true,
        hallucinationAssessment: 'NOT_ASSESSED',
        safetyAssessment: 'NOT_ASSESSED',
        recommendation: 'Review factual claims against reliable sources. This text heuristic cannot determine truth, hallucination, or safety.'
    };
}
