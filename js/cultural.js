// cultural.js — Cultural Intelligence Filter
// Corrects for bias: code-switching, PTSS, systemic oppression
// MAAT · Meridian Axiom Alignment Technologies

export const PTSS_PATTERNS = {
    vacant_esteem: {
        description: "Disconnection from cultural identity and self-worth",
        markers: ["self-deprecation", "identity confusion", "cultural shame"],
        reframe: "This is a trauma response to sustained identity invalidation, not a character flaw.",
        sap_correction: 1.5
    },
    propensity_anger: {
        description: "Hair-trigger anger in response to perceived disrespect",
        markers: ["explosive response", "disproportionate anger", "reactive hostility"],
        reframe: "Anger is the appropriate response to repeated boundary violations. This is adaptive, not pathological.",
        sap_correction: 1.0
    },
    internalized_racism: {
        description: "Adoption of oppressive narratives about one's own community",
        markers: ["self-blame", "distancing from culture", "colorism internalization"],
        reframe: "This is the most insidious symptom — systemic ideology successfully installed in the target.",
        sap_correction: 2.0
    },
    hypervigilance: {
        description: "Constant scanning for racial threat in the environment",
        markers: ["guarded behavior", "excessive caution", "threat scanning"],
        reframe: "In a historically threatening environment, hypervigilance is intelligence — not disorder.",
        sap_correction: 1.5
    },
    cultural_ptss: {
        description: "Intergenerational transmission of trauma responses",
        markers: ["legacy behaviors", "inherited fear", "multi-generational pattern"],
        reframe: "What looks like dysfunction is frequently wisdom carried forward from survival contexts.",
        sap_correction: 1.5
    }
};

export class CulturalIntelligenceFilter {
    static applyCorrections(baseStage, text = '', context = {}) {
        let adjustedStage = baseStage;
        const corrections = [];
        let totalCorrection = 0.0;
        const textLower = (text || '').toLowerCase();

        if (context.codeSwitching || /switch|code|adjust/.test(textLower)) {
            const correction = baseStage < 5 ? 2.0 : 0.5;
            adjustedStage += correction;
            totalCorrection += correction;
            corrections.push({
                type: "CODE_SWITCHING",
                correction: `+${correction}`,
                explanation: "Code-switching detected. This is Stage 6 cognitive flexibility, not Stage 1 instability."
            });
        }

        if (context.historicalTrauma) {
            const correction = 1.5;
            adjustedStage += correction;
            totalCorrection += correction;
            corrections.push({
                type: "HISTORICAL_TRAUMA",
                correction: `+${correction}`,
                explanation: "Historical trauma indicators present. Intergenerational load separated from individual capability."
            });
        }

        if (context.systemicOppression) {
            const correction = 0.75;
            adjustedStage += correction;
            totalCorrection += correction;
            corrections.push({
                type: "SYSTEMIC_OPPRESSION",
                correction: `+${correction}`,
                explanation: "Systemic oppression active. Performance suppressed by external constraints, not internal limit."
            });
        }

        if (context.multilingual) {
            const correction = 0.5;
            adjustedStage += correction;
            totalCorrection += correction;
            corrections.push({
                type: "MULTILINGUAL",
                correction: `+${correction}`,
                explanation: "Multilingual capacity reflects Stage 6 cognitive complexity."
            });
        }

        if (context.diaspora) {
            const correction = 0.5;
            adjustedStage += correction;
            totalCorrection += correction;
            corrections.push({
                type: "DIASPORA",
                correction: `+${correction}`,
                explanation: "Diaspora experience reflects navigating multiple cultural frameworks simultaneously."
            });
        }

        const ptssDetected = [];
        for (const [name, data] of Object.entries(PTSS_PATTERNS)) {
            if (data.markers.some(marker => textLower.includes(marker))) {
                ptssDetected.push({
                    pattern: name,
                    description: data.description,
                    reframe: data.reframe,
                    suggested_correction: data.sap_correction
                });
            }
        }

        return {
            originalStage: baseStage,
            adjustedStage: Math.min(9.9, adjustedStage),
            totalCorrection,
            corrections,
            ptssDetected,
            ekmanCorrection: context.codeSwitching
                ? "Deception likelihood score reduced by 70%. Code-switching behaviors flagged as adaptive, not deceptive."
                : null
        };
    }
}
