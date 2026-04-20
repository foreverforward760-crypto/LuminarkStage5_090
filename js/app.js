// app.js - KAIROS Application Controller
// Stanfield's Axiom of Perpetuity · MAAT · LUMINARK v8.1

import { stateManager } from './state.js';
import {
    computePressureScore, computeConfidenceScore, getCategory,
    getDecisionSignal, calculateMean,
    classifySAPStage, SAP_STAGES, getPressureLabel
} from './engine.js';
import { selectContent, selectAffirmation, contentLibrary } from './content.js';
import { initAudio, playFrequency, stopFrequency, FREQUENCY_MAP, isPlaying, getCurrentFreq } from './audio.js';
import { initVisualizer, startVisualPulse, stopVisualPulse } from './visuals.js';

const $ = id => document.getElementById(id);
let currentView = 'protocol';
let breathTimer = null;

// ─── INIT ───────────────────────────────────────────────────────────────────
function init() {
    initVisualizer();
    stateManager.subscribe(onStateUpdate);
    document.querySelectorAll('.nav-tab').forEach(tab =>
        tab.addEventListener('click', () => navigate(tab.dataset.view))
    );
    document.body.addEventListener('click', () => initAudio(), { once: true });
    recalculate();
    navigate('protocol');
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
    const renders = { protocol, frequencies, breathwork, affirmations, journal };
    vc.innerHTML = renders[viewId] ? renders[viewId](state) : '<p>View not found</p>';
    attachListeners(viewId);
}

// ─── VIEWS ──────────────────────────────────────────────────────────────────

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
        ⚡ <strong>ILLUSION OF PERMANENCE</strong> — Tension perception amplified: ${nsdtVector[3]}→${sap.illusionT}. ${st.description ? st.description : 'The suffering feels permanent. It is not.'}
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
        <div style="font-size:0.7rem;color:#5a8ab0;letter-spacing:1px;margin-bottom:8px">${content?.archetype?.toUpperCase() || 'KAIROS'} · ${content?.type?.toUpperCase() || 'WISDOM'}</div>
        <p style="font-size:1.15rem;font-style:italic;color:#d0e8ff;line-height:1.65;margin:0">"${content?.text || 'Stay present in the stage you are in.'}"</p>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
        <span class="signal-badge ${signalClass}">⊕ ${decision.mode.toUpperCase()}</span>
        <span style="font-size:0.8rem;color:#5a8ab0">Pressure: ${(pressure*100).toFixed(0)}% · Confidence: ${(confidence*100).toFixed(0)}%</span>
      </div>

      <div id="nsdtPanel">
        <div style="font-size:0.75rem;color:#5a8ab0;letter-spacing:1px;margin-bottom:12px;font-weight:600">NSDT VECTOR — ADJUST TO YOUR STATE</div>
        ${[['N','Complexity',nsdtVector[0],'#f59e0b'],['S','Stability',nsdtVector[1],'#60a5fa'],
           ['D','Adaptability',nsdtVector[2],'#10b981'],['T','Tension',nsdtVector[3],'#ef4444'],
           ['C','Coherence',nsdtVector[4],'#a78bfa']].map((axis,i)=>`
        <div class="nsdt-input-row">
          <label style="color:${axis[3]};font-weight:700">${axis[0]} <span style="color:#5a8ab0;font-weight:400;font-size:0.75rem">${axis[1]}</span></label>
          <input type="range" min="0" max="100" value="${axis[2]}" data-idx="${i}" class="nsdt-slider">
          <span class="val nsdt-val-${i}" style="color:${axis[3]}">${axis[2]}</span>
        </div>
        <div class="metric-bar-bg"><div class="metric-bar-fill" style="width:${axis[2]}%;background:${axis[3]}"></div></div>
        `).join('')}
        <button class="btn btn-primary" id="applyNSDT" style="margin-top:4px">Apply NSDT Vector</button>
      </div>
    </div>`;
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
            renderView('protocol');
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

// ─── START ──────────────────────────────────────────────────────────────────
init();
