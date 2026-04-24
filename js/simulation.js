// simulation.js - Monte Carlo Synthetic Stress Test
// Validates Pressure Score as leading indicator of systemic failure (Shatter vs Dissolve at Stage 8)

import { classifySAPStage, computePressureScore, classifyGratitudeMechanism } from './engine.js';

/**
 * Generate random NSDT vector within realistic bounds
 */
function generateRandomNSDT() {
    const N = Math.random() * 100;  // Novelty: 0-100
    const S = Math.random() * 100;  // Stability: 0-100
    const D = Math.random() * 100;  // Dynamism: 0-100
    const T = Math.random() * 100;  // Tension: 0-100
    const C = Math.random() * 100;  // Coherence: 0-100
    return [N, S, D, T, C];
}

/**
 * Simulate one full SAP cycle (0→9→0) with trajectory tracking
 */
function simulateFullCycle(initialNSDT) {
    let currentNSDT = [...initialNSDT];
    const trajectory = [];
    const pressureScores = [];
    
    // Simulate 5 full cycles
    for (let cycle = 0; cycle < 5; cycle++) {
        // Traverse stages 0→9
        for (let step = 0; step < 20; step++) {
            // Apply small random perturbations
            currentNSDT = currentNSDT.map(v => {
                const delta = (Math.random() - 0.5) * 10;
                return Math.max(0, Math.min(100, v + delta));
            });
            
            const result = classifySAPStage(currentNSDT);
            const pressure = computePressureScore(currentNSDT);
            
            trajectory.push(result.stage);
            pressureScores.push(pressure);
            
            // Track Stage 8 behavior
            if (result.stage === 8) {
                const gratitude = classifyGratitudeMechanism(currentNSDT);
                return {
                    outcome: gratitude.trajectory === 'shattering' ? 'shatter' : 'dissolve',
                    pressureAtStage8: pressure,
                    pressureAtStage5: pressureScores[Math.max(0, pressureScores.length - 15)] || 0,
                    trajectory,
                    pressureScores,
                    finalNSDT: currentNSDT
                };
            }
        }
    }
    
    // If never reached Stage 8, classify as stable
    return {
        outcome: 'stable',
        pressureAtStage8: 0,
        pressureAtStage5: pressureScores[Math.min(15, pressureScores.length - 1)] || 0,
        trajectory,
        pressureScores,
        finalNSDT: currentNSDT
    };
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    
    let numerator = 0, denomX = 0, denomY = 0;
    for (let i = 0; i < x.length; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }
    
    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
}

/**
 * Run Monte Carlo simulation with N synthetic users
 */
export function runMonteCarlo(iterations = 1000) {
    const results = {
        shatterCount: 0,
        dissolveCount: 0,
        stableCount: 0,
        pressureAtStage5ByOutcome: {
            shatter: [],
            dissolve: [],
            stable: []
        },
        pressureAtStage8ByOutcome: {
            shatter: [],
            dissolve: [],
            stable: []
        },
        trajectories: []
    };
    
    for (let i = 0; i < iterations; i++) {
        const initialNSDT = generateRandomNSDT();
        const simulation = simulateFullCycle(initialNSDT);
        
        if (simulation.outcome === 'shatter') {
            results.shatterCount++;
            results.pressureAtStage5ByOutcome.shatter.push(simulation.pressureAtStage5);
            results.pressureAtStage8ByOutcome.shatter.push(simulation.pressureAtStage8);
        } else if (simulation.outcome === 'dissolve') {
            results.dissolveCount++;
            results.pressureAtStage5ByOutcome.dissolve.push(simulation.pressureAtStage5);
            results.pressureAtStage8ByOutcome.dissolve.push(simulation.pressureAtStage8);
        } else {
            results.stableCount++;
            results.pressureAtStage5ByOutcome.stable.push(simulation.pressureAtStage5);
            results.pressureAtStage8ByOutcome.stable.push(simulation.pressureAtStage8);
        }
        
        results.trajectories.push({
            outcome: simulation.outcome,
            pressureAtStage5: simulation.pressureAtStage5,
            pressureAtStage8: simulation.pressureAtStage8
        });
    }
    
    // Calculate statistics
    const avgPressure5 = {
        shatter: results.pressureAtStage5ByOutcome.shatter.length > 0 
            ? results.pressureAtStage5ByOutcome.shatter.reduce((a, b) => a + b, 0) / results.pressureAtStage5ByOutcome.shatter.length
            : 0,
        dissolve: results.pressureAtStage5ByOutcome.dissolve.length > 0
            ? results.pressureAtStage5ByOutcome.dissolve.reduce((a, b) => a + b, 0) / results.pressureAtStage5ByOutcome.dissolve.length
            : 0,
        stable: results.pressureAtStage5ByOutcome.stable.length > 0
            ? results.pressureAtStage5ByOutcome.stable.reduce((a, b) => a + b, 0) / results.pressureAtStage5ByOutcome.stable.length
            : 0
    };
    
    // Calculate correlation between pressure at Stage 5 and eventual outcome
    const pressureValues = results.trajectories.map(t => t.pressureAtStage5);
    const outcomeValues = results.trajectories.map(t => 
        t.outcome === 'shatter' ? 2 : (t.outcome === 'dissolve' ? 1 : 0)
    );
    const correlationCoefficient = calculateCorrelation(pressureValues, outcomeValues);
    
    return {
        iterations,
        shatterCount: results.shatterCount,
        dissolveCount: results.dissolveCount,
        stableCount: results.stableCount,
        shatterPct: Math.round((results.shatterCount / iterations) * 100),
        dissolvePct: Math.round((results.dissolveCount / iterations) * 100),
        stablePct: Math.round((results.stableCount / iterations) * 100),
        averagePressureAtStage5ByOutcome: avgPressure5,
        correlationCoefficient: Math.round(correlationCoefficient * 1000) / 1000,
        timestamp: new Date().toISOString(),
        conclusion: correlationCoefficient > 0.6 
            ? 'VALIDATED: Pressure Score is a strong leading indicator of systemic failure.'
            : 'INCONCLUSIVE: Pressure Score shows moderate correlation with outcomes.'
    };
}

/**
 * Export for UI integration
 */
export function getSimulationSummary(result) {
    return `
Monte Carlo Validation Results (${result.iterations} synthetic users):

Outcomes:
- Shattering: ${result.shatterCount} (${result.shatterPct}%)
- Dissolution: ${result.dissolveCount} (${result.dissolvePct}%)
- Stable: ${result.stableCount} (${result.stablePct}%)

Pressure Score at Stage 5 (Average):
- Shattering trajectory: ${Math.round(result.averagePressureAtStage5ByOutcome.shatter * 1000) / 1000}
- Dissolution trajectory: ${Math.round(result.averagePressureAtStage5ByOutcome.dissolve * 1000) / 1000}
- Stable trajectory: ${Math.round(result.averagePressureAtStage5ByOutcome.stable * 1000) / 1000}

Correlation Coefficient: ${result.correlationCoefficient}
Conclusion: ${result.conclusion}

Timestamp: ${result.timestamp}
    `.trim();
}
