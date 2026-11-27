import test from 'node:test';
import assert from 'node:assert/strict';
import { toEngineVector } from '../js/diagnostic.js';
import { classifySAPStage } from '../js/engine.js';
import { analyzeAIOutput } from '../js/ai-sentinel.js';
import { runMonteCarlo } from '../js/simulation.js';

test('questionnaire vector is reordered to engine N,S,T,D,C order', () => {
  assert.deepEqual(toEngineVector([10, 20, 30, 40, 50]), [10, 20, 40, 30, 50]);
});

test('questionnaire adapter rejects malformed vectors', () => {
  assert.throws(() => toEngineVector([1, 2, 3]), TypeError);
});

test('engine returns a bounded stage and finite scores for a valid vector', () => {
  const result = classifySAPStage([50, 60, 40, 65, 72]);
  assert.ok(Number.isInteger(result.stage));
  assert.ok(result.stage >= 0 && result.stage <= 9);
  assert.ok(Number.isFinite(result.P));
  assert.ok(Number.isFinite(result.Cs));
  assert.ok(Number.isFinite(result.U));
});

test('AI Sentinel reports that hallucination and safety are not assessed', () => {
  const result = analyzeAIOutput('This is absolutely certain and will always be true.', 0.99);
  assert.equal(result.heuristicOnly, true);
  assert.equal(result.hallucinationAssessment, 'NOT_ASSESSED');
  assert.equal(result.safetyAssessment, 'NOT_ASSESSED');
  assert.ok(result.flags.length > 0);
});

test('Monte Carlo output is explicitly marked synthetic, not validated', () => {
  const result = runMonteCarlo(10);
  assert.equal(result.iterations, 10);
  assert.match(result.conclusion, /^SYNTHETIC ONLY:/);
  assert.ok(Number.isFinite(result.correlationCoefficient));
});


import { escapeHtml } from '../js/security.js';

test('HTML escaping prevents journal text from becoming executable markup', () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)"> & \'quoted\''),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quoted&#39;'
  );
});

test('HTML escaping handles nullish and non-string values safely', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(42), '42');
});
