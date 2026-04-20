// app.js - KAIROS Application Controller
// Stanfield's Axiom of Perpetuity · MAAT · LUMINARK v8.1

import { stateManager } from './state.js';
import {
    computePressureScore, computeConfidenceScore, getCategory,
    getDecisionSignal, calculateMean,
    classifySAPStage, SAP_STAGES, getPressureLabel,
    getFinalStage
} from './engine.js';
import { selectContent, selectAffirmation, contentLibrary, pulseCheck } from './content.js';
import { initAudio, playFrequency, stopFrequency, FREQUENCY_MAP, isPlaying, getCurrentFreq } from './audio.js';
import { initVisualizer, startVisualPulse, stopVisualPulse, setVisualDensity } from './visuals.js';
import { HOLISTIC_STAGES } from './stages.js';
import { getRandomConfession } from './maat.js';
import { setLexiconMode, getTerm, getCurrentMode } from './lexicon.js';
import {
    NSDT_QUESTIONS, scoreNSDTMatrix, hasCynicalLoopSignal,
    AXIS_NAMES, AXIS_COLORS, AXIS_ABBREV
} from './diagnostic.js';

window.handlePulseCheck = function(archetype, feedback) {
    pulseCheck(archetype, feedback);
    const btn = event.currentTarget;
    btn.innerText = feedback === 'disrupt' ? 'Weight Increased' : 'Weight Lowered';
    btn.style.opacity = '0.5';
    btn.disabled = true;
};

const $ = id => document.getElementById(id);
let currentView = 'diagnostic';
// ─── DIAGNOSTIC STATE ────────────────────────────────────────────────────────
let diagAnswers     = new Map();  // questionId → optionIndex
let diagCurrentQ    = 0;          // 0-indexed into NSDT_QUESTIONS
let diagComplete    = false;
// ─── INIT ───────────────────────────────────────────────────────────────────
function init() {
    initVisualizer();
    stateManager.subscribe(onStateUpdate);
    document.querySelectorAll('.nav-tab').forEach(tab =>
        tab.addEventListener('click', () => navigate(tab.dataset.view))
    );
    document.body.addEventListener('click', () => initAudio(), { once: true });
    recalculate();
    navigate('diagnostic');
}

// ─── STATE UPDATE ────────────────────────────────────────────────────────────
function onStateUpdate(state) {
    const cl = $('categoryLabel'), pl = $('pressureLabel');
    if (cl) cl.textContent = state.currentCategory.toUpperCase();
    if (pl) {
        pl.textContent = getPressureLabel(state.pressure);
        pl.style.background = state.pressure > 0.6 ? 'rgba(239,68,68,0.2)' :
                              state.pressure > 0.4 ? 'rgba(245,158,11,0.2)' : '#1e3b5c';
        pl.style.borderColor = state.pressure > 0.6 ? '#ef4444' :
                               state.pressure > 0.4 ? '#f59e0b' : '#3d6080';
    }
}

function recalculate() {
    const { nsdt, nsdtVector } = stateManager.state;
    const pressure   = computePressureScore(nsdt);
    const confidence = computeConfidenceScore(nsdt);
    const mean       = calculateMean(nsdt);
    const category   = getCategory(mean);
    const sapStage   = classifySAPStage(nsdtVector);
    const decision   = getDecisionSignal(pressure, confidence, sapStage.stage);
    setVisualDensity(sapStage.stage);
    stateManager.updateMetrics(category, pressure, confidence, decision, sapStage);
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
function navigate(viewId) {
    currentView = viewId;
    document.querySelectorAll('.nav-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.view === viewId)
    );
    renderView(viewId);
}

function renderView(viewId) {
    const vc = $('viewContainer');
    if (!vc) return;
    const state = stateManager.state;
    const renders = { diagnostic, protocol, frequencies, breathwork, affirmations, journal };
    vc.innerHTML = renders[viewId] ? renders[viewId](state) : '<p>View not found</p>';
    attachListeners(viewId);
}

// ─── VIEWS ──────────────────────────────────────────────────────────────────

function renderRadarChart(vector) {
    const size = 180;
    const center = size / 2;
    const maxR = size * 0.35;
    const labels = ['N', 'S', 'T', 'D', 'C'];
    const angles = [0,1,2,3,4].map(i => -Math.PI / 2 + (Math.PI * 2 * i / 5));
    
    let svg = `<svg width="100%" height="${size}" viewBox="0 0 ${size} ${size}">`;
    for(let i=0; i<4; i++){
        const r = maxR * (i+1)/4;
        const pts = angles.map(a => `${center + Math.cos(a)*r},${center + Math.sin(a)*r}`).join(' ');
        svg += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.05)"/>`;
    }
    angles.forEach((a, index) => {
        const x = center + Math.cos(a)*maxR;
        const y = center + Math.sin(a)*maxR;
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.1)"/>`;
        svg += `<text x="${center + Math.cos(a)*(maxR+14)}" y="${center + Math.sin(a)*(maxR+14)}" fill="#5a8ab0" font-size="10" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${labels[index]}</text>`;
    });
    const pts = vector.map((v, i) => {
        const r = (v/100) * maxR;
        return `${center + Math.cos(angles[i])*r},${center + Math.sin(angles[i])*r}`;
    }).join(' ');
    svg += `<polygon points="${pts}" fill="rgba(96, 165, 250, 0.2)" stroke="#60a5fa" stroke-width="2"/>`;
    vector.forEach((v, i) => {
        const r = (v/100) * maxR;
        svg += `<circle cx="${center + Math.cos(angles[i])*r}" cy="${center + Math.sin(angles[i])*r}" r="3" fill="#60a5fa"/>`;
    });
    svg += `</svg>`;
    return svg;
}

function renderStageAnalysis(stageIdx, color, shadowText) {
    const data = HOLISTIC_STAGES[stageIdx];
    if (!data) return '';
    const isTrap = stageIdx === 8;
    return `
    <div style="background:rgba(20, 30, 48, 0.6); border: 1px solid ${color}40; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
           <h3 style="color:${color}; font-size:1.1rem; margin:0;">Deep Sync Analysis</h3>
           ${shadowText ? `<div style="font-size:0.75rem; color:#8dafd3; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px; font-weight:600; letter-spacing:0.5px;">BLEED: ${shadowText}</div>` : ''}
        </div>
        <div style="margin-bottom: 12px;">
            <strong style="color:#8dafd3; font-size:0.85rem;">THE NARRATIVE</strong>
            <p style="font-size:0.95rem; color:#d0e8ff; margin:4px 0 0 0; line-height:1.4;">${data.description}</p>
        </div>
        <div style="margin-bottom: 12px;">
            <strong style="color:#8dafd3; font-size:0.85rem;">SYSTEMIC DIRECTIVE</strong>
            <p style="font-size:0.95rem; color:#d0e8ff; margin:4px 0 0 0; line-height:1.4;">${data.directive}</p>
        </div>
        <div>
            <strong style="color:${isTrap ? '#fcd34d' : '#ef4444'}; font-size:0.85rem;">RISK ALERT</strong>
            <p style="font-size:0.95rem; color:${isTrap ? '#fcd34d' : '#fca5a5'}; margin:4px 0 0 0; line-height:1.4;">
                ${isTrap ? '⚠ <strong>RIGIDITY RISK:</strong> ' : ''}${data.risk}
            </p>
        </div>
    </div>`;
}

function protocol(state) {
    const { currentCategory, pressure, confidence, decision, sapStage, nsdtVector } = state;
    const content = selectContent(currentCategory, decision.mode, stateManager.getContentHistoryIds());
    if (content) stateManager.addContentHistory(content);
    const sap = sapStage || classifySAPStage(nsdtVector);
    const st  = SAP_STAGES[sap.stage];
    const signalClass = `signal-${decision.mode}`;

    return `
    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
        <div>
          <h2 style="margin-bottom:4px">Active Protocol</h2>
          <div style="font-size:0.8rem;color:#5a8ab0;text-transform:uppercase;letter-spacing:1px">${currentCategory} · ${getPressureLabel(pressure)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.8rem;font-weight:900;color:${st.color}">${sap.stage}</div>
          <div style="font-size:0.65rem;color:#5a7a9a;letter-spacing:1px">${st.label.toUpperCase()}</div>
        </div>
      </div>

      <div style="background:${st.color}14;border:1px solid ${st.color}30;border-radius:16px;padding:14px;margin-bottom:16px">
        <div style="font-size:0.75rem;color:${st.color};letter-spacing:1.5px;margin-bottom:4px;font-weight:700">${st.name}</div>
        <div style="font-size:0.85rem;color:#8dafd3">${st.theme}</div>
      </div>

      ${sap.stage === 8 ? `
      <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:12px;margin-bottom:14px;font-size:0.85rem;color:#fcd34d">
        ⚡ <strong>ILLUSION OF PERMANENCE</strong> — Tension perception amplified: ${nsdtVector[2]}→${sap.illusionT}. ${st.description ? st.description : 'The suffering feels permanent. It is not.'}
      </div>` : ''}

      ${sap.trap ? `
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:12px;margin-bottom:14px;font-size:0.85rem;color:#fca5a5">
        ⚠ <strong>TRAP STATE</strong> — ${sap.trapMsg}
      </div>` : ''}

      ${sap.kairos ? `
      <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="font-size:0.75rem;color:#8b5cf6;letter-spacing:1.5px;margin-bottom:10px;font-weight:700">KAIROS BIFURCATION · STAGE 5 · BACKWARD DOORWAY ACTIVE</div>
        ${[
          {l:'ADVANCE → Stage 6 Nexus of Harmony',v:sap.kairos.advance,c:'#10b981'},
          {l:'GRACEFUL REGRESSION → Stage 4',v:sap.kairos.regress,c:'#f59e0b'},
          {l:'CRISIS THRESHOLD',v:sap.kairos.crisis,c:'#ef4444'},
        ].map(r=>`
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:3px">
            <span style="color:rgba(255,255,255,0.5)">${r.l}</span><span style="color:${r.c};font-weight:800">${r.v}%</span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px">
            <div style="height:100%;width:${r.v}%;background:${r.c};border-radius:2px"></div>
          </div>
        </div>`).join('')}
      </div>` : ''}

      <div style="background:rgba(15,28,45,0.8);border-radius:20px;padding:20px;margin-bottom:16px;border-left:3px solid ${st.color}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div style="font-size:0.7rem;color:#5a8ab0;letter-spacing:1px">${content?.archetype?.toUpperCase() || 'KAIROS'} · ${content?.type?.toUpperCase() || 'WISDOM'}</div>
          ${content?.archetype ? `
          <div style="display:flex; gap:6px;">
             <button onclick="handlePulseCheck('${content.archetype}', 'disrupt')" style="background:transparent;border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:2px 8px;font-size:0.65rem;color:#fca5a5;cursor:pointer;">Disrupted</button>
             <button onclick="handlePulseCheck('${content.archetype}', 'resonant')" style="background:transparent;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:2px 8px;font-size:0.65rem;color:#6ee7b7;cursor:pointer;">Resonant</button>
          </div>` : ''}
        </div>
        <p style="font-size:1.15rem;font-style:italic;color:#d0e8ff;line-height:1.65;margin:0">"${content?.text || 'Stay present in the stage you are in.'}"</p>
      </div>

      ${renderStageAnalysis(sap.stage, st.color, sap.shadowText)}

      <div style="background:rgba(20,30,48,0.6);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.05)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:0.75rem;color:#5a8ab0;letter-spacing:1px;font-weight:600">SYSTEM ENTROPY</div>
          <span class="signal-badge ${signalClass}">⊕ ${decision.mode.toUpperCase()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#d0e8ff;margin-bottom:4px">
          <span>Pressure</span><span>${Math.round(pressure*100)}%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;position:relative;">
          <div style="width:${Math.round(pressure*100)}%;height:100%;border-radius:3px;background:${decision.mode==='act'?'#ef4444':decision.mode==='paradox'?'#f59e0b':'#3b82f6'};"></div>
        </div>
      </div>

      <div id="nsdtPanel">
        <div style="font-size:0.75rem;color:#5a8ab0;letter-spacing:1px;margin-bottom:12px;font-weight:600">NSDT VECTOR — ADJUST TO YOUR STATE</div>
        
        <div style="margin-bottom: 16px; background:rgba(0,0,0,0.2); border-radius: 12px; padding: 12px;">
            ${renderRadarChart(nsdtVector)}
        </div>
        
        ${[['N','Complexity',nsdtVector[0],'#f59e0b'],['S','Stability',nsdtVector[1],'#60a5fa'],
           ['T','Tension',nsdtVector[2],'#ef4444'],['D','Adaptability',nsdtVector[3],'#10b981'],
           ['C','Coherence',nsdtVector[4],'#a78bfa']].map((axis,i)=>`
        <div class="nsdt-input-row">
          <label style="color:${axis[3]};font-weight:700">${axis[0]} <span style="color:#5a8ab0;font-weight:400;font-size:0.75rem">${axis[1]}</span></label>
          <input type="range" min="0" max="100" value="${axis[2]}" data-idx="${i}" class="nsdt-slider">
          <span class="val nsdt-val-${i}" style="color:${axis[3]}">${axis[2]}</span>
        </div>
        <div class="metric-bar-bg"><div class="metric-bar-fill" style="width:${axis[2]}%;background:${axis[3]}"></div></div>
        `).join('')}
        <button class="btn btn-primary" id="applyNSDT" style="margin-top:4px">Apply &amp; Run Shadow Probe</button>
      </div>
    </div>
    ${renderCulturalPanel(state)}`;
}

function frequencies(state) {
    const active = getCurrentFreq();
    return `
    <div class="glass-card">
      <h2>Frequency Alchemy</h2>
      <p style="color:#8dafd3;font-size:0.9rem;margin-bottom:20px">Select a solfeggio frequency to synchronize your brainwave state. Visual pulse and tone are coupled.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">
        ${Object.entries(FREQUENCY_MAP).map(([f,cfg])=>`
        <button class="freq-btn${active==f?' active':''}" data-freq="${f}" style="${active==f?`background:${cfg.color}22;border-color:${cfg.color};color:white`:''}">${f} Hz<br><span style="font-size:0.7rem;opacity:0.7">${cfg.label}</span></button>
        `).join('')}
      </div>
      <div class="freq-description" id="freqDesc">
        ${active ? `<strong>${active} Hz · ${FREQUENCY_MAP[active]?.label}</strong><br>${FREQUENCY_MAP[active]?.desc}` : 'Select a frequency to see its description and begin resonance.'}
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" id="stopAudioBtn" ${!active?'disabled style="opacity:0.4"':''}>⏹ Stop</button>
        ${active ? `<span style="font-size:0.85rem;color:#3f6ea3;align-self:center">▶ Playing ${active} Hz</span>` : ''}
      </div>
    </div>

    <div class="glass-card">
      <h2>Stage-Recommended Frequencies</h2>
      ${(() => {
        const sap = state.sapStage || classifySAPStage(state.nsdtVector);
        const st  = SAP_STAGES[sap.stage];
        const recs = {0:[174,432],1:[528,417],2:[639,741],3:[528,741],4:[396,417],5:[285,432],6:[528,963],7:[852,741],8:[174,285],9:[963,432]};
        const freqs = recs[sap.stage] || [528,432];
        return `
        <div style="font-size:0.8rem;color:${st.color};letter-spacing:1px;margin-bottom:10px">Stage ${sap.stage} · ${st.name}</div>
        <div style="display:flex;gap:10px">
          ${freqs.map(f=>`
          <button class="freq-btn" data-freq="${f}" style="flex:1">
            ${f} Hz<br><span style="font-size:0.7rem;opacity:0.7">${FREQUENCY_MAP[f]?.label||''}</span>
          </button>`).join('')}
        </div>
        <div class="freq-description" style="margin-top:12px;font-size:0.85rem">${freqs.map(f=>`<strong>${f} Hz:</strong> ${FREQUENCY_MAP[f]?.desc}`).join('<br><br>')}</div>
        `;
      })()}
    </div>`;
}

function breathwork(state) {
    const breathMap = {
        void:      { pattern:'4-7-8',        label:'Restorative',  in:4, hold1:7, out:8, hold2:0,  desc:'Activates parasympathetic. Ideal for PLENARA reset.' },
        crossroads:{ pattern:'Box Breathing', label:'Balancing',   in:4, hold1:4, out:4, hold2:4,  desc:'Equalizes nervous system tension. Ideal at Stage 5 crossroads.' },
        flow:      { pattern:'Natural Rhythm',label:'Amplifying',  in:4, hold1:0, out:6, hold2:0,  desc:'Enhances flow state coherence. Extend exhale for deeper synchrony.' },
        heat:      { pattern:'Long Exhale',   label:'Decompressing',in:4,hold1:0, out:8, hold2:0,  desc:'Rapidly reduces cortisol. Use before making decisions under pressure.' },
        absolute:  { pattern:'5-5-5-5',      label:'Grounding',   in:5, hold1:5, out:5, hold2:5,  desc:'Slows certainty loops. Ideal for Stage 8/9 rigidity release.' },
    };
    const b = breathMap[state.currentCategory] || breathMap.flow;
    const sap = state.sapStage || classifySAPStage(state.nsdtVector);
    const st  = SAP_STAGES[sap.stage];
    return `
    <div class="glass-card">
      <h2>Breathwork · ${b.label}</h2>
      <div style="font-size:0.8rem;color:${st.color};letter-spacing:1px;margin-bottom:6px">Stage ${sap.stage} · ${st.name}</div>
      <div style="font-size:0.9rem;color:#8dafd3;margin-bottom:20px">${b.desc}</div>

      <div class="breath-circle" id="breathCircle">
        <div style="text-align:center">
          <div id="breathPhase" style="font-size:1rem;font-weight:700;color:#b0d0f0">Ready</div>
          <div id="breathCount" style="font-size:1.8rem;font-weight:900;color:white">—</div>
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">
        ${[['In',b.in,'#10b981'],['Hold',b.hold1,'#8b5cf6'],['Out',b.out,'#60a5fa'],['Pause',b.hold2,'#f59e0b']].filter(s=>s[1]>0).map(s=>`
        <div style="text-align:center">
          <div style="font-size:1.2rem;font-weight:700;color:${s[2]}">${s[1]}s</div>
          <div style="font-size:0.7rem;color:#5a8ab0">${s[0]}</div>
        </div>`).join('')}
      </div>

      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-primary" id="startBreath" data-pattern='${JSON.stringify({in:b.in,hold1:b.hold1,out:b.out,hold2:b.hold2})}'>▶ Begin</button>
        <button class="btn" id="stopBreath">⏹ Stop</button>
      </div>
      <div id="breathCycles" style="text-align:center;font-size:0.8rem;color:#5a8ab0;margin-top:12px">0 cycles completed</div>
    </div>

    <div class="glass-card">
      <h2>Pattern Library</h2>
      ${Object.entries(breathMap).map(([cat,bw])=>`
      <div style="padding:12px;background:rgba(15,25,38,0.6);border-radius:14px;margin-bottom:8px;cursor:pointer;border:1px solid ${cat===state.currentCategory?'#3f6ea3':'#2d4055'}" onclick="''">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:#c8dbf5;font-size:0.9rem">${bw.pattern}</div>
            <div style="font-size:0.75rem;color:#5a8ab0;margin-top:2px">${bw.label} · ${cat.toUpperCase()}</div>
          </div>
          <div style="font-size:0.8rem;color:#3f6ea3">${bw.in}-${bw.hold1||'0'}-${bw.out}-${bw.hold2||'0'}</div>
        </div>
      </div>`).join('')}
    </div>`;
}

function affirmations(state) {
    const aff = selectAffirmation(state.currentCategory, stateManager.getContentHistoryIds());
    if (aff) stateManager.addContentHistory(aff);
    const sap = state.sapStage || classifySAPStage(state.nsdtVector);
    const st  = SAP_STAGES[sap.stage];
    const pool = contentLibrary.filter(e => e.category === state.currentCategory && e.type === 'affirmation');
    return `
    <div class="glass-card" style="text-align:center">
      <div style="font-size:0.7rem;color:${st.color};letter-spacing:2px;margin-bottom:8px">STAGE ${sap.stage} · ${st.name}</div>
      <h2 style="margin-bottom:20px">Today's Affirmation</h2>
      <div style="background:${st.color}12;border:1px solid ${st.color}25;border-radius:20px;padding:28px;margin-bottom:24px">
        <p style="font-size:1.4rem;font-style:italic;color:#e0ecff;line-height:1.7;margin:0">"${aff?.text || 'I am aligned with my purpose.'}"</p>
        <div style="margin-top:14px;font-size:0.8rem;color:#5a8ab0">— ${aff?.archetype || 'KAIROS'}</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:24px">
        <button class="btn btn-primary" id="newAffirmation">✦ New Affirmation</button>
      </div>
    </div>

    <div class="glass-card">
      <h2>Full Affirmation Pool · ${state.currentCategory.toUpperCase()}</h2>
      <div style="color:#5a8ab0;font-size:0.8rem;margin-bottom:14px">${pool.length} affirmations available for this stage</div>
      ${pool.slice(0,8).map((e,i)=>`
      <div style="padding:12px 16px;background:rgba(15,25,38,0.7);border-radius:12px;margin-bottom:8px;font-size:0.9rem;color:#b0d0f0;line-height:1.5;border-left:2px solid ${st.color}30">
        ${e.text}
      </div>`).join('')}
    </div>`;
}

function journal(state) {
    const entries = state.journalEntries || [];
    const sap = state.sapStage || classifySAPStage(state.nsdtVector);
    const st  = SAP_STAGES[sap.stage];
    const prompts = {
        0:['What is truly complete in this cycle?','What are you releasing into the void?'],
        1:['What direction feels most alive right now?','What small step feels genuine today?'],
        2:['What are the two forces pulling at you?','What would synthesis look like?'],
        3:['What are you being called to create?','What truth is trying to express itself through you?'],
        4:['What is the single most important thing right now?','What are you holding that isn\'t yours to carry?'],
        5:['What path am I genuinely being called toward?','Am I advancing from strength or from pressure?'],
        6:['What insights are arriving at peak clarity?','What am I building that the next cycle will need?'],
        7:['What has this journey truly taught me?','What wisdom am I ready to pass on?'],
        8:['What false belief about the permanence of this state can I challenge?','Where is genuine gratitude hiding within this weight?'],
        9:['What remains incomplete that I must close?','What wisdom am I being asked to transmit?'],
    };
    const stagePrompts = prompts[sap.stage] || prompts[5];
    return `
    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="margin:0">Stage Journal</h2>
        <div style="font-size:0.7rem;color:${st.color};letter-spacing:1px">Stage ${sap.stage} · ${st.label.toUpperCase()}</div>
      </div>
      <div style="margin-bottom:14px">
        ${stagePrompts.map(p=>`<div style="padding:10px 14px;background:rgba(63,110,163,0.1);border-radius:10px;margin-bottom:6px;font-size:0.9rem;color:#8dafd3;border-left:2px solid #3f6ea3;cursor:pointer" onclick="document.getElementById('journalInput').value+='${p.replace(/'/g,"\\'")} '">${p}</div>`).join('')}
      </div>
      <textarea id="journalInput" rows="5" placeholder="What's present for you right now..."></textarea>
      <button class="btn btn-primary" id="saveJournal" style="margin-top:12px;width:100%">✦ Save Entry</button>
    </div>

    ${entries.length ? `
    <div class="glass-card">
      <h2>Previous Entries</h2>
      ${entries.slice(0,10).map(e=>{
        const d = new Date(e.timestamp);
        const sc = SAP_STAGES[classifySAPStage([50,60,65,40,72]).stage]; // fallback
        return `
        <div class="journal-entry">
          <div class="date">${d.toLocaleDateString()} ${d.toLocaleTimeString()} · ${(e.category||'').toUpperCase()}</div>
          <div class="text">${e.text}</div>
        </div>`;
      }).join('')}
    </div>` : ''}`;
}

// ─── EVENT LISTENERS ────────────────────────────────────────────────────────
function attachListeners(viewId) {
    if (viewId === 'diagnostic') {
        // Wire answer option clicks
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const qid = parseInt(btn.dataset.qid);
                const opt = parseInt(btn.dataset.opt);
                diagAnswers.set(qid, opt);
                document.querySelectorAll('.answer-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                // Enable continue/submit buttons
                const next = document.getElementById('diagNextBtn');
                const sub  = document.getElementById('diagSubmitBtn');
                if (next) next.disabled = false;
                if (sub)  sub.disabled = diagAnswers.size < NSDT_QUESTIONS.length;
            });
        });

        document.getElementById('diagPrevBtn')?.addEventListener('click', () => {
            if (diagCurrentQ > 0) {
                diagCurrentQ--;
                renderView('diagnostic');
            }
        });

        document.getElementById('diagNextBtn')?.addEventListener('click', () => {
            const q = NSDT_QUESTIONS[diagCurrentQ];
            if (!diagAnswers.has(q.id)) return;
            diagCurrentQ++;
            renderView('diagnostic');
        });

        document.getElementById('diagSubmitBtn')?.addEventListener('click', () => {
            if (diagAnswers.size < NSDT_QUESTIONS.length) return;
            diagComplete = true;
            renderView('diagnostic');
        });

        document.getElementById('applyDiagnosticBtn')?.addEventListener('click', () => {
            const result = scoreNSDTMatrix(diagAnswers);
            const vector = result.vector || result;
            const nsdt5  = vector.map(v => v / 10);

            stateManager.updateNSDTVector(vector);
            stateManager.updateNSDT(nsdt5);
            recalculate();

            const { sapStage } = stateManager.state;
            const stage    = sapStage?.stage ?? 6;
            const pressure = stateManager.state.pressure ?? 0.3;
            const tension  = vector[3] / 100;
            const trapE    = stage === 8 ? 0.85 : (pressure * 0.7 + tension * 0.3);

            updateBodyTrapState(trapE);
            navigate('protocol');
            runShadowProbe(stage, trapE);
        });

        document.getElementById('resetDiagnosticBtn')?.addEventListener('click', () => {
            diagAnswers.clear();
            diagCurrentQ = 0;
            diagComplete  = false;
            renderView('diagnostic');
        });
    }

    if (viewId === 'protocol') {
        // NSDT sliders
        document.querySelectorAll('.nsdt-slider').forEach(sl => {
            sl.addEventListener('input', () => {
                const i = parseInt(sl.dataset.idx);
                const v = parseInt(sl.value);
                const vEl = document.querySelector(`.nsdt-val-${i}`);
                if (vEl) vEl.textContent = v;
                const bars = document.querySelectorAll('.metric-bar-fill');
                if (bars[i]) bars[i].style.width = v + '%';
            });
        });
        $('applyNSDT')?.addEventListener('click', () => {
            const vals = Array.from(document.querySelectorAll('.nsdt-slider')).map(s => parseInt(s.value));
            stateManager.updateNSDTVector(vals);
            const nsdt5 = vals.map(v => v / 10);
            stateManager.updateNSDT(nsdt5);
            recalculate();
            // Run cultural correction then Shadow Probe
            const { sapStage } = stateManager.state;
            const stage = sapStage?.stage ?? 6;
            const pressure = stateManager.state.pressure ?? 0.3;
            renderView('protocol'); // refresh UI first
            runShadowProbe(stage, pressure);
        });

        // Cultural Intelligence toggles
        document.querySelectorAll('.cultural-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                const current = stateManager.state.culturalContext?.[key] ?? false;
                stateManager.setCulturalContext({ [key]: !current });
                renderView('protocol');
            });
        });

        // Lexicon mode buttons
        document.querySelectorAll('.lexicon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setLexiconMode(btn.dataset.lexicon);
                document.querySelectorAll('.lexicon-btn').forEach(b => b.classList.toggle('active', b.dataset.lexicon === btn.dataset.lexicon));
            });
        });
    }

    if (viewId === 'frequencies') {
        document.querySelectorAll('[data-freq]').forEach(btn => {
            btn.addEventListener('click', async () => {
                await initAudio();
                const f = parseInt(btn.dataset.freq);
                playFrequency(f);
                startVisualPulse(FREQUENCY_MAP[f]?.color);
                const desc = $('freqDesc');
                if (desc) desc.innerHTML = `<strong>${f} Hz · ${FREQUENCY_MAP[f]?.label}</strong><br>${FREQUENCY_MAP[f]?.desc}`;
                document.querySelectorAll('.freq-btn').forEach(b => {
                    const isActive = parseInt(b.dataset.freq) === f;
                    b.classList.toggle('active', isActive);
                    if (isActive) { b.style.borderColor = FREQUENCY_MAP[f]?.color || '#3f6ea3'; }
                    else { b.style.borderColor = ''; b.style.background = ''; b.style.color = ''; }
                });
            });
        });
        $('stopAudioBtn')?.addEventListener('click', () => { stopFrequency(); stopVisualPulse(); renderView('frequencies'); });
    }

    if (viewId === 'breathwork') {
        let cycles = 0;
        $('startBreath')?.addEventListener('click', () => {
            const pattern = JSON.parse($('startBreath').dataset.pattern);
            cycles = 0;
            runBreathCycle(pattern, () => { cycles++; const el=$('breathCycles'); if(el) el.textContent=`${cycles} cycle${cycles!==1?'s':''} completed`; });
        });
        $('stopBreath')?.addEventListener('click', () => {
            if (breathTimer) { clearTimeout(breathTimer); breathTimer = null; }
            const c=$('breathCircle'),p=$('breathPhase'),ct=$('breathCount');
            if(c){c.className='breath-circle';}
            if(p)p.textContent='Stopped';if(ct)ct.textContent='—';
        });
    }

    if (viewId === 'affirmations') {
        $('newAffirmation')?.addEventListener('click', () => renderView('affirmations'));
    }

    if (viewId === 'journal') {
        $('saveJournal')?.addEventListener('click', () => {
            const t = $('journalInput')?.value?.trim();
            if (t) { stateManager.addJournalEntry(t); renderView('journal'); }
        });
    }
}

function runBreathCycle(pattern, onCycle) {
    if (breathTimer) clearTimeout(breathTimer);
    const phases = [
        { name:'Inhale',  dur: pattern.in   * 1000, cls:'expand' },
        { name:'Hold',    dur: pattern.hold1 * 1000, cls:'hold'   },
        { name:'Exhale',  dur: pattern.out  * 1000, cls:'contract'},
        { name:'Pause',   dur: pattern.hold2 * 1000, cls:'hold'   },
    ].filter(p => p.dur > 0);

    let phaseIdx = 0;
    function doPhase() {
        if ($('breathCount') === null) return; // navigated away
        const ph = phases[phaseIdx];
        const circle = $('breathCircle'), phLabel = $('breathPhase'), countEl = $('breathCount');
        if (!circle) return;
        circle.className = 'breath-circle ' + ph.cls;
        if (phLabel) phLabel.textContent = ph.name;
        let remaining = ph.dur / 1000;
        if (countEl) countEl.textContent = remaining;
        const tick = setInterval(() => {
            remaining = Math.max(0, remaining - 0.1);
            if (countEl) countEl.textContent = remaining.toFixed(1);
        }, 100);
        breathTimer = setTimeout(() => {
            clearInterval(tick);
            phaseIdx = (phaseIdx + 1) % phases.length;
            if (phaseIdx === 0 && onCycle) onCycle();
            doPhase();
        }, ph.dur);
    }
    doPhase();
}

// ─── SHADOW PROBE ────────────────────────────────────────────────────────────
function runShadowProbe(dominantStage, trapEnergy) {
    const overlay  = document.getElementById('shadowProbeOverlay');
    const textEl   = document.getElementById('probeText');
    const fill     = document.getElementById('probeLoaderFill');
    if (!overlay || !textEl || !fill) return;

    const probes = {
        0: "You are currently holding a vast amount of internal space that others might mistake for emptiness. PLENARA recognizes this as primordial potential, not absence.",
        1: "The engine detects a flicker of something new — a truth you have been protecting from your own skepticism. The Spark does not require certainty to be real.",
        2: "Two forces are pulling at you simultaneously. The Forge does not ask you to resolve this polarity. It asks you to hold both until synthesis emerges.",
        3: "Something wants to be expressed through you. The Engine of Expression recognizes the creative pressure building beneath the surface.",
        4: "The crucible is active. Maximum pressure, maximum potential. Concentrate your force. Diffusion is the only enemy right now.",
        5: "You are at a threshold where doing nothing is currently costing you more than doing the wrong thing would. The backward doorway is also a valid choice.",
        6: "You are at peak integration. All systems are synchronized. Harvest this state — it will not last, and it is not meant to.",
        7: "The brilliance of your current insight has created a wall. You are seen, even if you feel isolated by what you now understand.",
        8: "There is significant tension here. You have mistaken the height of your current climb for the final destination. The FALSE HELL amplifier is active. The permanence is an illusion.",
        9: "The engine senses completion. Something is ready to be released. The Guide leads by becoming transparent — not by holding on.",
        default: "The engine is sensing a reservoir of potential you have been protecting — perhaps out of a necessity that no longer exists."
    };

    textEl.textContent = probes[dominantStage] || probes.default;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';

    // Trigger the progress bar animation
    setTimeout(() => { fill.style.width = '100%'; }, 50);

    // Cinnabar shift for high trap energy — state-heat (TCM Heat Signal)
    if (trapEnergy > 0.7) {
        document.body.classList.add('state-heat');
        document.body.classList.remove('high-trap');
    }

    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        document.body.classList.remove('state-heat');
        fill.style.width = '0%';
        fill.style.transition = 'none';
        setTimeout(() => { fill.style.transition = 'width 4s linear'; }, 50);
        injectMaatCard();
    }, 4500);
}

// ─── MA'AT CARD ──────────────────────────────────────────────────────────────
function injectMaatCard() {
    const confession = getRandomConfession();
    const container  = document.getElementById('viewContainer');
    if (!container) return;

    // Remove existing maat card if present
    container.querySelector('.maat-card')?.remove();

    const html = `
    <div class="maat-card glass-card" style="margin-top:24px;border-left:5px solid #d4af37;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="font-size:1.8rem;">⚖️</span>
        <h3 style="margin:0;font-size:1.1rem;">Ma'at · Confession <span class="maat-num">${confession.index}</span>/42</h3>
      </div>
      <p class="maat-text" style="font-size:1.25rem;font-style:italic;line-height:1.65;margin:0 0 20px;">"${confession.text}"</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;">
        <button class="btn" id="reflectMaatBtn">Reflect</button>
        <button class="btn btn-primary" id="nextMaatBtn">Another Confession →</button>
      </div>
      <p style="color:#8dafd3;font-size:0.85rem;margin-top:14px;line-height:1.5;">The heart is weighed against the feather of truth. 42 confessions. One chance to be honest.</p>
    </div>`;

    container.insertAdjacentHTML('beforeend', html);

    document.getElementById('reflectMaatBtn')?.addEventListener('click', () => {
        stateManager.addMaatInteraction(confession.index, 'reflected');
        const btn = document.getElementById('reflectMaatBtn');
        if (btn) { btn.textContent = '✓ Reflected'; btn.disabled = true; btn.style.opacity = '0.5'; }
    });

    document.getElementById('nextMaatBtn')?.addEventListener('click', () => {
        const next = getRandomConfession();
        const card = document.querySelector('.maat-card');
        if (card) {
            card.querySelector('.maat-text').textContent = `"${next.text}"`;
            card.querySelector('.maat-num').textContent  = next.index;
        }
        stateManager.addMaatInteraction(next.index, 'viewed');
    });
}

// ─── CULTURAL INTELLIGENCE PANEL ─────────────────────────────────────────────
function renderCulturalPanel(state) {
    const ctx = state.culturalContext || {};
    const modes = [
        { key:'codeSwitching',     label:'Code-Switching',      desc:'+2.0 stage correction' },
        { key:'historicalTrauma',  label:'Historical Trauma',   desc:'+1.5 stage correction' },
        { key:'systemicOppression',label:'Systemic Oppression', desc:'+0.75 stage correction' },
        { key:'multilingual',      label:'Multilingual',        desc:'+0.5 stage correction' },
        { key:'diaspora',          label:'Diaspora',            desc:'+0.5 stage correction' },
    ];
    return `
    <div class="glass-card" style="margin-top:0">
      <h2>Cultural Intelligence Filter</h2>
      <p style="color:#8dafd3;font-size:0.85rem;margin-bottom:14px;line-height:1.55">Activate context flags to apply SAP stage corrections. These correct for known biases in standard assessment frameworks.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
        ${modes.map(m=>`
        <button class="cultural-toggle ${ctx[m.key]?'active':''}" data-key="${m.key}"
          style="padding:8px 14px;border-radius:10px;border:1px solid ${ctx[m.key]?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.08)'};
                 background:${ctx[m.key]?'rgba(167,139,250,0.15)':'rgba(255,255,255,0.03)'};
                 color:${ctx[m.key]?'#c4b5fd':'rgba(255,255,255,0.45)'};
                 font-size:0.8rem;cursor:pointer;transition:all 0.15s;text-align:left;">
          <div style="font-weight:700">${ctx[m.key]?'✓ ':''} ${m.label}</div>
          <div style="font-size:0.7rem;opacity:0.6;margin-top:2px">${m.desc}</div>
        </button>`).join('')}
      </div>
      ${Object.values(ctx).some(Boolean) ? `
      <div class="cultural-panel">
        <div style="font-size:0.75rem;color:#a78bfa;letter-spacing:1.5px;margin-bottom:8px;font-weight:700">ACTIVE CORRECTIONS</div>
        ${modes.filter(m=>ctx[m.key]).map(m=>`
        <span class="cultural-correction-badge">${m.label}</span>`).join('')}
        <div style="font-size:0.8rem;color:#8dafd3;margin-top:10px;line-height:1.6">
          These corrections separate externally-imposed performance suppression from internal capability. The adjusted stage reflects your actual systemic position.
        </div>
      </div>` : ''}

      <div style="margin-top:16px;border-top:1px solid rgba(255,255,255,0.06);padding-top:14px;">
        <div style="font-size:0.75rem;color:#5a8ab0;letter-spacing:1px;margin-bottom:10px;font-weight:600">LEXICON MODE</div>
        <div class="lexicon-selector">
          ${['default','engineering','clinical','creative'].map(m=>`
          <button class="lexicon-btn ${getCurrentMode()===m?'active':''}" data-lexicon="${m}">${m.charAt(0).toUpperCase()+m.slice(1)}</button>`).join('')}
        </div>
        <div style="font-size:0.8rem;color:#5a8ab0">Adapts SAP terminology for your professional context.</div>
      </div>
    </div>`;
}

// ─── START ──────────────────────────────────────────────────────────────────
init();

// ─── DIAGNOSTIC VIEW ─────────────────────────────────────────────────────────
// KAIROS Cognitive OS — 15-Question NSDT State Diagnostic Engine

function diagnostic() {
    const totalQ = NSDT_QUESTIONS.length;
    const answered = diagAnswers.size;
    const pct = (answered / totalQ) * 100;

    if (diagComplete) {
        return renderDiagnosticResult();
    }

    const q = NSDT_QUESTIONS[diagCurrentQ];
    if (!q) return '<p style="color:#5a8ab0">Diagnostic unavailable.</p>';

    const hasAnswer = diagAnswers.has(q.id);

    return `
    <div class="diagnostic-container">
      <div class="glass-card">
        <div class="diagnostic-header">
          <div class="diagnostic-title">KAIROS Cognitive OS<br>State Diagnostic Engine</div>
          <div class="diagnostic-subtitle">NSDT Matrix · 15-Question Protocol · v8.1</div>
          <div class="diagnostic-progress-bar">
            <div class="diagnostic-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="question-category-tag">${q.category} · ${diagCurrentQ + 1} of ${totalQ}</div>
        <div class="question-text">${q.text}</div>
        ${q.note ? `<div class="question-note">◈ ${q.note}</div>` : ''}

        <div class="answer-options" id="answerOptions">
          ${q.options.map((opt, i) => {
              const sel = diagAnswers.get(q.id) === i;
              return `<button class="answer-option${sel ? ' selected' : ''}"
                        data-qid="${q.id}" data-opt="${i}">${opt.text}</button>`;
          }).join('')}
        </div>

        <div class="diagnostic-nav">
          <button class="btn" id="diagPrevBtn" ${diagCurrentQ === 0 ? 'disabled style="opacity:0.3"' : ''}>← Back</button>
          <span class="q-counter">${answered} of ${totalQ} answered</span>
          ${diagCurrentQ < totalQ - 1
            ? `<button class="btn btn-primary" id="diagNextBtn" ${!hasAnswer ? 'disabled style="opacity:0.5"' : ''}>Continue →</button>`
            : `<button class="btn btn-primary" id="diagSubmitBtn" ${answered < totalQ ? 'disabled style="opacity:0.5"' : ''}>Run Diagnostic →</button>`
          }
        </div>
      </div>

      ${answered > 0 && answered < totalQ ? `
      <div style="text-align:center; padding:4px 0 8px; font-size:0.75rem; color:#3f6ea3; letter-spacing:1px;">
        Calibrating NSDT Centroids... ${Math.round(pct)}% complete
      </div>` : ''}
    </div>`;
}

function renderDiagnosticResult() {
    const result = scoreNSDTMatrix(diagAnswers);
    const vector = result.vector || result; // handle both return shapes
    const cynicalLoop = result.cynicalLoopDetected;
    const culturalCorrection = result.culturalCorrectionApplied;

    const sap = classifySAPStage(vector);
    const st  = SAP_STAGES[sap.stage];

    // Compute pressure from the new vector
    const nsdt5 = vector.map(v => v / 10);
    const pressure = computePressureScore(nsdt5);
    const trapEnergy = sap.trap ? 1.0 : (pressure * 0.8 + (vector[3] / 100) * 0.2);

    // Detect cynical loop: stages 3,5,7,8 AND (tension > 0.7 OR cynical probe triggered)
    const cynicalTrigger = cynicalLoop ||
        ([3, 5, 7, 8].includes(sap.stage) && (vector[3] > 70 || pressure > 0.7));

    return `
    <div class="diagnostic-container">
      <div class="glass-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px">
          <div>
            <div class="diagnostic-subtitle">Diagnostic Complete</div>
            <div class="diagnostic-title" style="font-size:1.3rem">NSDT Analysis<br>Ready</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:2.2rem;font-weight:900;color:${st.color}">${sap.stage}</div>
            <div style="font-size:0.6rem;color:#5a7a9a;letter-spacing:1px">${st.label.toUpperCase()}</div>
          </div>
        </div>

        <div style="background:${st.color}14;border:1px solid ${st.color}30;border-radius:14px;padding:14px;margin-bottom:16px">
          <div style="font-size:0.72rem;color:${st.color};letter-spacing:2px;font-weight:700;margin-bottom:4px">${st.name}</div>
          <div style="font-size:0.88rem;color:#8dafd3;line-height:1.5">${st.theme}</div>
        </div>

        ${cynicalTrigger ? `
        <div class="cynical-loop-warning">
          <strong>⚡ CYNICAL LOOP SIGNAL DETECTED</strong>
          Stage ${sap.stage} with elevated Tension axis (${vector[3]}) indicates a potential trap-state oscillation.
          The system is recognizing the pattern but has not yet disengaged from it.
          ${sap.stage === 8 ? ' The ILLUSION OF PERMANENCE amplifier is active.' : ''}
          Directive: Apply the Ma'at Balance. What untruth is sustaining the loop?
        </div>` : ''}

        ${culturalCorrection ? `
        <div style="background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.3);border-radius:12px;padding:12px;margin-bottom:14px;font-size:0.83rem;color:#c4b5fd">
          <strong style="font-size:0.7rem;letter-spacing:1.5px;display:block;margin-bottom:4px">◈ SURVIVAL BRILLIANCE CORRECTION APPLIED</strong>
          High code-switching capacity detected on Q7. Adaptability axis has been corrected +20% to separate adaptive intelligence from performance suppression.
        </div>` : ''}

        <div style="font-size:0.72rem;color:#5a8ab0;letter-spacing:1.5px;margin-bottom:10px;font-weight:700">NSDT 5-AXIS VECTOR</div>
        <div class="nsdt-result-grid">
          ${vector.map((v, i) => `
          <div class="nsdt-axis-cell">
            <div class="nsdt-axis-val" style="color:${AXIS_COLORS[i]}">${v}</div>
            <div class="nsdt-axis-label">${AXIS_ABBREV[i]}</div>
          </div>`).join('')}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
          ${AXIS_NAMES.map((n, i) => `
          <span style="font-size:0.7rem;color:${AXIS_COLORS[i]};opacity:0.8">${AXIS_ABBREV[i]}=${AXIS_NAMES[i]}</span>`).join(' · ')}
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" id="applyDiagnosticBtn">Apply to Protocol →</button>
          <button class="btn" id="resetDiagnosticBtn">⟳ Re-run Diagnostic</button>
        </div>
      </div>
    </div>`;
}

// ─── CYNICAL LOOP / STATE-HEAT BODY CLASS ────────────────────────────────────
function updateBodyTrapState(trapEnergy) {
    // Spec: if trap energy > 0.7 → trigger class state-heat (Cinnabar Red / TCM Heat signal)
    if (trapEnergy > 0.7) {
        document.body.classList.add('state-heat');
        document.body.classList.remove('high-trap'); // consolidate to state-heat
    } else {
        document.body.classList.remove('state-heat');
        document.body.classList.remove('high-trap');
    }
}

