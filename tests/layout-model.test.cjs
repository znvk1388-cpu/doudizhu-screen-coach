const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Draft, requiredRegions, normalizeRect, rules} = require('../docs/layout-model.js');
function complete(rule = 'CLASSIC_54') {
  const d = new Draft(2374, 1080); d.setRule(rule);
  requiredRegions(rule).forEach((key, index) => d.setRegion(key, {x:.02 + index*.08, y:.2, w:.05, h:.1}));
  return d;
}
for (const rule of rules) test(rule + ' exports Android protocol and every required seat', () => {
  const doc = complete(rule).document();
  assert.deepEqual(Object.keys(doc).sort(), ['format','layout','version']);
  assert.equal(doc.format, 'doudizhu-screen-layout');
  assert.equal(doc.version, 1);
  const expected = rule.startsWith('TEAM_') ? ['LEFT','OPPOSITE','RIGHT','SELF'] : ['LEFT','RIGHT','SELF'];
  assert.deepEqual(Object.keys(doc.layout.plays).sort(), expected);
  assert.deepEqual(Object.keys(doc.layout.counts).sort(), expected.filter(s => s !== 'SELF'));
  assert.equal(doc.layout.confirmed, false);
  assert.equal(Object.hasOwn(doc.layout, 'first'), false);
  assert.equal(doc.layout.referenceAspectRatio, 2374/1080);
  assert.deepEqual(doc.layout.hand, [.02,.2,.07,.3]);
});
test('redrawing then undo restores the edited region without removing another seat', () => {
  const d = complete(), previous = d.document();
  d.setRegion('hand', {x:.5,y:.5,w:.2,h:.2});
  d.undo(); assert.deepEqual(d.document(), previous);
});
test('export always uses current name and coordinates', () => {
  const d = complete(), old = d.document();
  d.name = '换过名称'; d.setRegion('hand', {x:.3,y:.5,w:.2,h:.2});
  assert.equal(d.document().layout.name, '换过名称');
  assert.deepEqual(d.document().layout.hand, [.3,.5,.5,.7]);
  assert.notDeepEqual(d.document(), old);
});
test('clear can be undone', () => {
  const d = complete(), old = d.document(); d.clear();
  assert.throws(() => d.document(), /必选区域/);
  d.undo(); assert.deepEqual(d.document(), old);
});
test('switching between three and four seats needs missing opponent regions and can be undone', () => {
  const d = complete(), old = d.document();
  d.setRule('TEAM_84'); assert.deepEqual(d.missing(), ['play:OPPOSITE','count:OPPOSITE']);
  d.undo(); assert.deepEqual(d.document(), old);
});
test('coordinates clamp to image bounds and reverse drags work', () => {
  assert.deepEqual(normalizeRect(100,100,-20,-20,100,100), {x:0,y:0,w:1,h:1});
  assert.equal(normalizeRect(0,0,.5,30,100,100), null);
  assert.equal(normalizeRect(NaN,0,10,10,100,100), null);
});
test('invalid regions, rules, teammate and name cannot be exported', () => {
  const d=complete('TEAM_84');
  assert.throws(() => d.setRegion('hand', {x:0,y:0,w:2,h:1}));
  assert.throws(() => d.setRule('UNSUPPORTED'));
  d.mate='SELF'; assert.throws(() => d.document());
  d.mate='OPPOSITE'; d.name='x'.repeat(65); assert.throws(() => d.document());
});
test('optional controls and bottom regions survive export', () => {
  const d=complete(); d.setRegion('bottom',{x:.3,y:.1,w:.1,h:.1});
  d.setRegion('controls',{x:.3,y:.4,w:.1,h:.1});
  assert.deepEqual(d.document().layout.bottom,[.3,.1,.4,.2]);
  assert.deepEqual(d.document().layout.controls,[.3,.4,.4,.5]);
});
test('undoing a region keeps the teammate selected afterwards', () => {
  const d=complete('TEAM_84');
  d.setRegion('hand',{x:.3,y:.5,w:.2,h:.2});
  d.mate='LEFT';d.undo();
  assert.equal(d.document().layout.mate,'LEFT');
});
test('remove one optional region preserves the rest and is undoable', () => {
  const d=complete();d.setRegion('controls',{x:.2,y:.4,w:.1,h:.1});
  const before=d.document();
  assert.equal(typeof d.removeRegion,'function','selected-region removal must be available');
  assert.equal(d.removeRegion('controls'),true);
  const after=d.document();assert.equal(Object.hasOwn(after.layout,'controls'),false);
  assert.deepEqual(after.layout.plays,before.layout.plays);
  d.undo();assert.deepEqual(d.document(),before);
});
test('removing a required region blocks export; removing nothing leaves history unchanged', () => {
  const d=complete();
  assert.equal(typeof d.removeRegion,'function');
  const history=d.history.length;
  assert.equal(d.removeRegion('bottom'),false);assert.equal(d.history.length,history);
  assert.equal(d.removeRegion('hand'),true);
  assert.deepEqual(d.missing(),['hand']);assert.throws(()=>d.document(),/必选区域/);
  d.undo();assert.deepEqual(d.missing(),[]);
});
