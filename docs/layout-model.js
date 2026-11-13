/* Uses the Android 0.6.16 LayoutTemplateDocument protocol; no external dependency. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LayoutModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var RULES = ['CLASSIC_54', 'CLASSIC_CHAIN_54', 'TEAM_84', 'TEAM_108'];
  function seats(rule) {
    if (RULES.indexOf(rule) < 0) throw new Error('请选择受支持的玩法。');
    return /^TEAM_/.test(rule) ? ['SELF', 'LEFT', 'OPPOSITE', 'RIGHT'] : ['SELF', 'LEFT', 'RIGHT'];
  }
  function requiredRegions(rule) {
    var s = seats(rule);
    return ['hand'].concat(s.map(function (seat) { return 'play:' + seat; }),
      s.filter(function (seat) { return seat !== 'SELF'; }).map(function (seat) { return 'count:' + seat; }));
  }
  function round(value) { return +value.toFixed(6); }
  function normalizeRect(px, py, qx, qy, width, height) {
    if (![px, py, qx, qy, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
    var x1 = Math.max(0, Math.min(width, Math.min(px, qx)));
    var y1 = Math.max(0, Math.min(height, Math.min(py, qy)));
    var x2 = Math.max(0, Math.min(width, Math.max(px, qx)));
    var y2 = Math.max(0, Math.min(height, Math.max(py, qy)));
    if ((x2 - x1) / width <= .005 || (y2 - y1) / height <= .005) return null;
    return {x: round(x1 / width), y: round(y1 / height),
      w: round((x2 - x1) / width), h: round((y2 - y1) / height)};
  }
  function clone(rects) { return JSON.parse(JSON.stringify(rects)); }
  function Draft(width, height) {
    this.width = width; this.height = height;
    this.name = '我的牌桌'; this.rule = RULES[0]; this.mate = 'OPPOSITE';
    this.chainSameLengthHighWins = false;
    this.rects = {}; this.history = [];
  }
  Draft.prototype.snapshot = function () {
    this.history.push({rects: clone(this.rects), rule: this.rule});
  };
  Draft.prototype.setRegion = function (key, rect) {
    if (requiredRegions(this.rule).concat(['controls', 'bottom']).indexOf(key) < 0) throw new Error('区域不属于当前玩法。');
    if (!rect || ![rect.x, rect.y, rect.w, rect.h].every(Number.isFinite) ||
        rect.x < 0 || rect.y < 0 || rect.w <= 0 || rect.h <= 0 ||
        rect.x + rect.w > 1.000001 || rect.y + rect.h > 1.000001) throw new Error('坐标须在画面内，右下角应大于左上角。');
    this.snapshot(); this.rects[key] = Object.assign({}, rect);
  };
  Draft.prototype.setRule = function (rule) {
    var allowed = requiredRegions(rule).concat(['controls', 'bottom']);
    if (rule === this.rule) return;
    this.snapshot(); this.rule = rule;
    Object.keys(this.rects).forEach(function (key) { if (allowed.indexOf(key) < 0) delete this.rects[key]; }, this);
  };
  Draft.prototype.removeRegion = function (key) {
    if (!Object.prototype.hasOwnProperty.call(this.rects, key)) return false;
    this.snapshot(); delete this.rects[key]; return true;
  };
  Draft.prototype.clear = function () {
    if (!Object.keys(this.rects).length) return;
    this.snapshot(); this.rects = {};
  };
  Draft.prototype.undo = function () {
    var previous = this.history.pop();
    if (!previous) return false;
    this.rects = previous.rects; this.rule = previous.rule;
    return true;
  };
  Draft.prototype.missing = function () {
    return requiredRegions(this.rule).filter(function (key) { return !this.rects[key]; }, this);
  };
  Draft.prototype.document = function () {
    var name = this.name.trim();
    if (!name || name.length > 64 || /[\u0000-\u001f\u007f-\u009f]/.test(name)) throw new Error('名称须为 1–64 字，不能含控制字符。');
    if (!Number.isFinite(this.width) || !Number.isFinite(this.height) || this.width <= 0 || this.height <= 0) throw new Error('请先载入牌桌截图。');
    if (this.missing().length) throw new Error('请先框完全部必选区域。');
    var s = seats(this.rule);
    if (/^TEAM_/.test(this.rule) && (s.indexOf(this.mate) < 0 || this.mate === 'SELF')) throw new Error('请选择其他座位作为队友。');
    var self = this;
    function region(key) {
      var r = self.rects[key];
      return [r.x, r.y, round(Math.min(1, r.x + r.w)), round(Math.min(1, r.y + r.h))];
    }
    var layout = {name: name, hand: region('hand'), plays: {}, counts: {},
      referenceAspectRatio: this.width / this.height, rule: this.rule, mate: this.mate,
      confirmed: false, chainSameLengthHighWins: this.chainSameLengthHighWins,
      handRows: 0, playRows: 0, englishJokers: false};
    s.forEach(function (seat) {
      layout.plays[seat] = region('play:' + seat);
      if (seat !== 'SELF') layout.counts[seat] = region('count:' + seat);
    });
    ['controls', 'bottom'].forEach(function (key) { if (self.rects[key]) layout[key] = region(key); });
    return {format: 'doudizhu-screen-layout', version: 1, layout: layout};
  };
  return {Draft: Draft, seats: seats, requiredRegions: requiredRegions, normalizeRect: normalizeRect, rules: RULES};
});
