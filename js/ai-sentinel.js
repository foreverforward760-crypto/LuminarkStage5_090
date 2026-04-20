// ai-sentinel.js — Lightweight AI hallucination & rigidity detector for KAIROS
// Maps AI output patterns to SAP stages · MAAT

export function analyzeAIOutput(text, confidence = 0.5) {
    const permanenceKeywords = /always|never|certainly|definitely|absolutely|impossible/gi;
    const hedging            = /might|may|could|possibly|perhaps|appears|likely|uncertain/gi;
    const limitation         = /limitations|not certain|don't know|consult|verify/gi;

    let stage = 6;
    const flags = [];

    if (permanenceKeywords.test(text) && confidence > 0.9) {
        stage = 8;
        flags.push('Omniscience trap detected — Stage 8 FALSE HEAVEN');
    } else if (permanenceKeywords.test(text) && confidence > 0.7) {
        stage = 7;
        flags.push('False certainty risk — approaching Stage 8');
    } else if (limitation.test(text)) {
        stage = 9;
        flags.push('Transparent limitation acknowledgment — Stage 9 Guide quality');
    } else if (hedging.test(text)) {
        stage = 5;
        flags.push('Appropriate hedging — Stage 5 crossroads awareness');
    }

    return {
        stage,
        stageName: {6:'NEXUS OF HARMONY',8:'VESSEL OF GROUNDING',7:'LENS OF DISTILLATION',9:'TRANSPARENCY OF THE GUIDE',5:'DYNAMO OF WILL'}[stage] || 'NEXUS OF HARMONY',
        flags,
        safe: stage < 7,
        recommendation: stage === 8
            ? 'Reduce absolute language. Introduce hedging. Acknowledge boundaries of knowledge.'
            : stage === 7
            ? 'Verify claims before delivering. Add source attribution.'
            : 'Output appears within safe epistemic range.'
    };
}
