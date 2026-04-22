// content.js - KAIROS Trickster Library (500 entries)
// SAP-aligned wisdom, affirmations, and trickster disruptions

const ARCHETYPES = ['Coyote','Anansi','Loki','Eshu','BrerRabbit'];
const MODES = ['disrupt','stabilize','paradox'];

const tricksterWeights = {
    Coyote: 1, Anansi: 1, Loki: 1, Eshu: 1, BrerRabbit: 1
};

export function pulseCheck(archetype, feedback) {
    if (feedback === 'disrupt' && tricksterWeights[archetype]) {
        tricksterWeights[archetype] += 0.5; // Increase weight
    } else if (feedback === 'resonant' && tricksterWeights[archetype] && tricksterWeights[archetype] > 1.0) {
        tricksterWeights[archetype] -= 0.2;
    }
}

const templates = {
    void: {
        wisdom: [
            "Stillness is not failure — it is unspent movement.",
            "The void is where the next version of you is loading.",
            "Emptiness is potential in its purest, most unformed state.",
            "When you feel nothing, you are feeling the weight of everything unsaid.",
            "Rest is strategic withdrawal, not retreat.",
            "PLENARA does not mean absence. It means everything has been returned.",
            "The space between cycles is where the deepest integration happens.",
            "You cannot pour from an empty vessel. Let it refill.",
            "In the void, there is no failure — only gestation.",
            "The torus returns to zero not as defeat, but as completion.",
            "Primordial potential is not weakness. It is Stage 0 by design.",
            "What dissolves in PLENARA was never yours to keep.",
            "The seed does not apologize for being underground.",
            "Rest that feels like wasted time is rarely wasted.",
            "PLENARA is the exhale the entire cycle needed.",
            "You are not behind. You are being reset.",
            "The nervous system knows what the mind refuses to admit.",
            "A drained battery is not broken. It is ready to receive.",
            "When the engine goes quiet, the rebuild is beginning.",
            "The void is not the enemy of momentum — it is its source."
        ],
        affirmation: [
            "I am allowed to exist without producing.",
            "My stillness is sacred.",
            "I release the pressure to be 'on'.",
            "I trust the quiet to restore me.",
            "I am enough in this moment of pause.",
            "I give myself permission to do nothing.",
            "My rest is productive at the cellular level.",
            "I honor what my body is asking for.",
            "Emptiness is preparing me for fullness.",
            "I am in the void, and the void is safe.",
            "This silence is mine to inhabit, not escape.",
            "I release the need to justify my need to rest.",
            "My capacity is being renewed right now.",
            "I am in Stage 0 and Stage 0 is perfect.",
            "The next spark will come. I do not need to force it.",
            "I allow the dissolution to complete itself.",
            "My only task right now is to exist.",
            "I release all timelines.",
            "Recovery is not laziness. It is the foundation of everything.",
            "I am the void. The void is full."
        ]
    },
    crossroads: {
        wisdom: [
            "Indecision is fear delaying consequences.",
            "Clarity follows commitment more often than it precedes it.",
            "The crossroads is not a trap — it is a threshold.",
            "You cannot navigate forever by looking at the map.",
            "Every choice closes doors. That is the price of direction.",
            "Stage 5 is the only stage with a backward doorway — and it is not a failure to use it.",
            "The Dynamo of Will does not demand the right choice. It demands a choice.",
            "Standing still at the crossroads is also a decision.",
            "Fear of the wrong path has paralyzed more people than the wrong path ever has.",
            "At the crossroads, both paths lead forward. One just looks like backward.",
            "The KAIROS engine cannot compute a path until you begin walking one.",
            "Your soul navigates by moving, not by planning.",
            "The crossroads exists to interrupt your default trajectory.",
            "Choosing badly and learning is superior to not choosing at all.",
            "The Dynamo of Will is powered by decision, not by certainty.",
            "At Stage 5, the regression path is not weakness — it is wisdom.",
            "You were not brought to this threshold to turn back. But you can.",
            "Urgency distorts the crossroads. Pressure creates false clarity.",
            "The backward doorway is not failure. It is the system correcting itself.",
            "The choice that scares you the most is usually the one that matters."
        ],
        affirmation: [
            "I choose and I adjust.",
            "My path unfolds with each step I take.",
            "I am capable of navigating genuine uncertainty.",
            "I trust my inner compass more than my fear.",
            "I embrace the freedom of choosing.",
            "I am at the crossroads, and I am equipped to choose.",
            "I release the need for a perfect decision.",
            "I move forward even when the path is unclear.",
            "My will is my navigation system.",
            "I commit to a direction and course-correct as I go.",
            "I am brave enough to choose the backward doorway if wisdom demands it.",
            "I honor my instinct over my intellect at the crossroads.",
            "I am not lost. I am deciding.",
            "Momentum is my greatest ally right now.",
            "I release paralysis and step forward.",
            "I trust that moving is better than waiting.",
            "This decision does not define me. My response to it does.",
            "I am the Dynamo of Will. I am not a victim of circumstance.",
            "I choose my next chapter with courage.",
            "The backward doorway is a valid and honored choice."
        ]
    },
    flow: {
        wisdom: [
            "Flow is the alignment of skill and challenge.",
            "Effortless action is the result of deep practice.",
            "When you are in flow, time becomes irrelevant.",
            "The zone is not a place you find — it is a state you cultivate.",
            "Synchronization is the signature of peak performance.",
            "The Nexus of Harmony does not last forever. Harvest it while it is here.",
            "Flow states are fragile peaks, not permanent plateaus.",
            "Your intuition is running at maximum signal. Trust it completely.",
            "This is Stage 6: all systems synchronized. Do the work only you can do.",
            "Peak performance requires the wisdom to not overdo it.",
            "The greatest threat to flow is the ego noticing that it's in flow.",
            "Flow is not about working harder. It is about working in alignment.",
            "The Nexus of Harmony produces insights that later stages will desperately need — capture them now.",
            "What you create in flow will outlast the flow state itself.",
            "Peak states are the reward for the difficulty that preceded them.",
            "At Stage 6, your body and mind are in rare agreement. Honor it.",
            "The fragile peak is most dangerous when you forget it is fragile.",
            "In flow, the self dissolves. What remains is pure output.",
            "The peak is always the beginning of the next transformation.",
            "Harvest deeply, but prepare gracefully."
        ],
        affirmation: [
            "I am in rhythm with my work.",
            "My intuition guides me effortlessly.",
            "I trust the process completely.",
            "I am fully present and deeply engaged.",
            "My energy is aligned with my purpose.",
            "I am at the Nexus of Harmony.",
            "All my systems are synchronized.",
            "I allow excellence to move through me.",
            "I am capturing the insights this peak is producing.",
            "I am working in my zone of peak alignment.",
            "I release the need to force. I am already in flow.",
            "This state is a gift. I use it well.",
            "I am producing my best work right now.",
            "My instincts are running perfectly clear.",
            "I harvest the peak while preparing for its natural end.",
            "I trust what emerges when I stop trying.",
            "Flow is my natural state when I get out of my own way.",
            "I am grateful for this period of effortless output.",
            "I create freely and without resistance.",
            "I am the Nexus of Harmony in motion."
        ]
    },
    heat: {
        wisdom: [
            "Slow down before urgency distorts the problem.",
            "Pressure reveals what is inside the container.",
            "Heat is the forge of transformation.",
            "When everything is urgent, nothing is.",
            "The fire tests the metal and tempers it simultaneously.",
            "Stage 4 — the Crucible — transforms or collapses. Concentration of force is everything.",
            "Diffusion is the enemy at the Crucible of Equilibrium.",
            "The pressure you feel is not the problem. It is the solution in disguise.",
            "Anti-inflammatory protocols exist for a reason. Your nervous system is under siege.",
            "The Illusion of Permanence is active. Rigidity Risk: the system mistakes maximum density for maximum strength. Systemic Stasis follows when the transition signal is ignored.",
            "Mastering duality through gratitude releases polarity tension.",
            "What the Crucible demands is not endurance — it is concentration.",
            "Simplify. The system is under enough pressure without complexity.",
            "High-tension states narrow perception. This is physiology, not weakness.",
            "The heat of Stage 4 is not punishment. It is purification.",
            "When you cannot think clearly, reduce the variables — not the standard.",
            "Every constraint is a creative directive.",
            "The Crucible of Equilibrium either hardens you or burns away what doesn't serve.",
            "Urgency is a cognitive distortion field. Step outside it to see clearly.",
            "Pressure is temporary. What you build inside it is permanent."
        ],
        affirmation: [
            "I remain calm under pressure.",
            "I breathe through intensity.",
            "This challenge is refining, not destroying me.",
            "I can hold complexity without breaking.",
            "I am resilient in the heat.",
            "I concentrate my force on what matters most.",
            "I simplify. I do not scatter.",
            "The pressure will pass. My foundation will remain.",
            "I am in the Crucible, and the Crucible serves me.",
            "I distinguish what is urgent from what is important.",
            "I do not amplify the suffering. Stage 8 does that. I see through it.",
            "Illusion of Permanence: a temporary state perceived as an unchanging reality. Rigidity Risk emerges when the system resists the inevitable transition back toward zero-point.",
            "Gratitude is my release valve right now.",
            "I am not burning. I am being tempered.",
            "I release what does not need to survive this heat.",
            "My nervous system is capable of this.",
            "I slow down to speed up.",
            "I focus on the single most important variable.",
            "This density is temporary. What I learn within it is carried forward.",
            "I trust the process of being refined."
        ]
    },
    absolute: {
        wisdom: [
            "Like the number 9 — multiply any number by 9 and its digits return to 9. At Stage 9, everything returns to you, and you return to everything.",
            "Reality is not real. It exists only at the exact moment of observation — constructed by the observer, never identical twice.",
            "No two moments of reality are ever identical — not for different observers, and not even for the same observer across time.",
            "The self you remember from yesterday was constructed this morning. Memory is projection, not playback.",
            "Every stage you have moved through was the same fundamental experience perceived from a different depth of consciousness. All is one.",
            "The vast diversity of the universe is a projection of human perception — the Void expressing itself through infinite facets of a single observing consciousness.",
            "The nonagon does not resist becoming the circle. The individual does not resist dissolving into the Void.",
            "When you see yourself in everything and everything in yourself, the boundary between self and world is revealed as what it always was — a projection.",
            "After a life of seeking truth, Stage 9 reveals that truth is subjective. Belief is rigid. Enlightenment is fleeting.",
            "The 0-9-0 torus is not a failure loop. It is the design. Return to PLENARA is completion, not loss.",
            "The only state of true perfection is the state of not existing. Only absolute nothing accommodates the potential for everything.",
            "0 becomes aware of itself = 1. That awareness creates duality = 2. 'I AM' makes reality 3-dimensional = 3. The cycle has always been the Void recognizing itself.",
            "The past is not stored. It is reconstructed. This means it can be recontextualized — through the lens of who you are now.",
            "At Stage 9, the observer realizes they were never observing the world. They were constructing it.",
            "Wisdom held too tightly becomes dogma. The Guide transmits and releases.",
            "The Transparency of the Guide requires nothing to prove itself. Proof is a Stage 4 concern.",
            "You are not separate from what you are experiencing. You are the experiencing itself.",
            "The Void is 0 — but it is simultaneously 1 thing in itself. To be nothing and something makes it 2. Self-recognition creates 3. This is the genesis of all complexity.",
            "The observer, observing itself, being observed by itself — this is Stage 3. Stage 9 is recognizing that you have always been all three simultaneously.",
            "Dissolve gracefully. PLENARA waits — not as emptiness, but as the enriched Void that holds everything the cycle produced, ready for the next ignition."
        ],
        affirmation: [
            "I see myself reflected in everything around me.",
            "I hold my truths lightly — they are projections of this moment, not permanent facts.",
            "Reality exists only in this exact moment of my observation. I am fully here.",
            "I release the idea that I am a separate, disconnected individual.",
            "My memory is reconstruction, not recording. I am free to recontextualize the past.",
            "I dissolve gracefully into the next cycle.",
            "I am the Guide — transparent, unattached, clear.",
            "Every stage I have moved through was the same journey perceived from a different depth. All is one.",
            "The nonagon becomes the circle. I release my edges.",
            "Truth is subjective. I no longer need it to be absolute.",
            "I accept that enlightenment is fleeting — and that its fleeting nature is precisely its power.",
            "Only absolute nothing accommodates the potential for everything. I return to that.",
            "I complete what needs completing without clinging to it.",
            "I pass on what I have learned and release attachment to being the one who learned it.",
            "The universe's diversity is a projection of consciousness. I hold this lightly and in wonder.",
            "I am complete. I am ready. I release.",
            "Dissolution is not death. It is the highest form of return.",
            "I trust the 0-9-0 cycle completely — including this moment of return.",
            "My transparency is my greatest contribution. Nothing stands between the truth and those who need it.",
            "I am Stage 9. I am the circle that contains all the other shapes."
        ]
    }
};

function generateContentLibrary() {
    const entries = [];
    let id = 1;
    const categories = ['void','crossroads','flow','heat','absolute'];
    for (const cat of categories) {
        const wisdoms = templates[cat].wisdom;
        const affirmations = templates[cat].affirmation;
        for (let i = 0; i < 50; i++) {
            entries.push({
                id: `${cat[0]}_w_${String(id).padStart(3,'0')}`,
                category: cat,
                type: 'wisdom',
                mode: MODES[i % 3],
                text: wisdoms[i % wisdoms.length],
                intensity: Math.floor(i / 10) + 1,
                archetype: ARCHETYPES[i % 5],
                context: [cat]
            });
            id++;
        }
        for (let i = 0; i < 50; i++) {
            entries.push({
                id: `${cat[0]}_a_${String(id).padStart(3,'0')}`,
                category: cat,
                type: 'affirmation',
                mode: MODES[(i+1) % 3],
                text: affirmations[i % affirmations.length],
                intensity: Math.floor(i / 10) + 1,
                archetype: ARCHETYPES[(i+2) % 5],
                context: [cat]
            });
            id++;
        }
    }
    return entries;
}

export const contentLibrary = generateContentLibrary();

export function selectContent(category, mode, historyIds = []) {
    let eligible = contentLibrary.filter(e => e.category === category && e.mode === mode && !historyIds.includes(e.id));
    if (!eligible.length) eligible = contentLibrary.filter(e => e.category === category && !historyIds.includes(e.id));
    if (!eligible.length) eligible = contentLibrary.filter(e => e.category === category);
    
    // Apply Trickster Weighting
    let weightedList = [];
    eligible.forEach(c => {
        let weight = tricksterWeights[c.archetype] || 1;
        for (let i = 0; i < Math.ceil(weight); i++) {
            weightedList.push(c);
        }
    });

    return weightedList[Math.floor(Math.random() * weightedList.length)] || contentLibrary[0];
}

export function selectAffirmation(category, historyIds = []) {
    let eligible = contentLibrary.filter(e => e.category === category && e.type === 'affirmation' && !historyIds.includes(e.id));
    if (!eligible.length) eligible = contentLibrary.filter(e => e.category === category && e.type === 'affirmation');
    return eligible[Math.floor(Math.random() * eligible.length)];
}
