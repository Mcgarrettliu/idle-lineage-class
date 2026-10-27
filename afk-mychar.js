/* afk-mychar.js － 角色數值修改面板（單機自己玩用）
 *
 * 進入遊戲後，畫面左下角會出現一顆「改」按鈕。
 * 點開後可以直接輸入等級、金幣、六圍、額外配點，按「套用」就生效並自動存檔。
 * 不用再改任何程式檔。
 */
(function () {
  'use strict';

  var FIELDS = [
    { key: 'lv',    label: '等級',     min: 1, max: 100 },
    { key: 'gold',  label: '金幣',     min: 0, max: 2000000000 },
    { key: 'str',   label: '力量',     min: 1, max: 999 },
    { key: 'dex',   label: '敏捷',     min: 1, max: 999 },
    { key: 'con',   label: '體質',     min: 1, max: 999 },
    { key: 'int',   label: '智力',     min: 1, max: 999 },
    { key: 'wis',   label: '精神',     min: 1, max: 999 },
    { key: 'cha',   label: '魅力',     min: 1, max: 999 },
    { key: 'bonus', label: '額外配點', min: 0, max: 999 }
  ];

  function P() { return (typeof player !== 'undefined' && player) ? player : null; }

  function readValue(p, key) {
    if (key === 'lv' || key === 'gold' || key === 'bonus') return Number(p[key]) || 0;
    return Number(p.base && p.base[key]) || 0;
  }

  function clampInt(v, f) {
    v = Math.floor(Number(v));
    if (!isFinite(v)) return null;
    return Math.min(f.max, Math.max(f.min, v));
  }

  function ready() {
    var gs = document.getElementById('game-screen');
    return !!(P() && P().base && gs && !gs.classList.contains('hidden'));
  }

  var btn, panel, msg, inputs = {};

  function build() {
    var css = document.createElement('style');
    css.textContent =
      '#afk-mc-btn{position:fixed;left:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483000;' +
      'width:40px;height:40px;border-radius:50%;border:1px solid #d4a017;background:#1e293b;color:#fde68a;' +
      'font:700 15px/1 sans-serif;opacity:.85;display:none}' +
      '#afk-mc-panel{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.72);display:none;' +
      'align-items:center;justify-content:center;padding:16px}' +
      '#afk-mc-box{width:100%;max-width:340px;max-height:92%;overflow:auto;background:#1e293b;color:#e2e8f0;' +
      'border:1px solid #475569;border-radius:12px;padding:14px;font:14px/1.4 sans-serif}' +
      '#afk-mc-box h3{margin:0 0 10px;font-size:17px;color:#fde68a}' +
      '#afk-mc-box label{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0}' +
      '#afk-mc-box input{width:130px;background:#0f172a;color:#fff;border:1px solid #475569;border-radius:6px;' +
      'padding:6px 8px;font-size:16px;text-align:right}' +
      '#afk-mc-row{display:flex;gap:8px;margin-top:12px}' +
      '#afk-mc-row button{flex:1;padding:10px;border-radius:8px;border:1px solid #64748b;background:#334155;' +
      'color:#fff;font-size:15px;font-weight:700}' +
      '#afk-mc-apply{background:#a16207!important;border-color:#d4a017!important}' +
      '#afk-mc-msg{min-height:18px;margin-top:8px;font-size:13px;color:#86efac}';
    document.head.appendChild(css);

    btn = document.createElement('button');
    btn.id = 'afk-mc-btn'; btn.type = 'button'; btn.textContent = '改';
    btn.title = '修改角色數值';
    document.body.appendChild(btn);

    panel = document.createElement('div');
    panel.id = 'afk-mc-panel';
    var html = '<div id="afk-mc-box"><h3>修改角色數值</h3>';
    FIELDS.forEach(function (f) {
      html += '<label>' + f.label + '<input type="number" inputmode="numeric" id="afk-mc-' + f.key + '"></label>';
    });
    html += '<div id="afk-mc-msg"></div><div id="afk-mc-row">' +
            '<button type="button" id="afk-mc-close">關閉</button>' +
            '<button type="button" id="afk-mc-apply">套用</button></div></div>';
    panel.innerHTML = html;
    document.body.appendChild(panel);
    msg = panel.querySelector('#afk-mc-msg');
    FIELDS.forEach(function (f) { inputs[f.key] = panel.querySelector('#afk-mc-' + f.key); });

    btn.addEventListener('click', open);
    panel.querySelector('#afk-mc-close').addEventListener('click', close);
    panel.querySelector('#afk-mc-apply').addEventListener('click', apply);
    panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
  }

  function open() {
    var p = P(); if (!p || !p.base) return;
    FIELDS.forEach(function (f) { inputs[f.key].value = readValue(p, f.key); });
    msg.textContent = '';
    panel.style.display = 'flex';
  }
  function close() { panel.style.display = 'none'; }

  function apply() {
    var p = P(); if (!p || !p.base) return;
    var vals = {};
    for (var i = 0; i < FIELDS.length; i++) {
      var f = FIELDS[i], v = clampInt(inputs[f.key].value, f);
      if (v === null) { msg.style.color = '#fca5a5'; msg.textContent = f.label + '請輸入數字'; return; }
      vals[f.key] = v;
    }
    var lvChanged = vals.lv !== p.lv;
    FIELDS.forEach(function (f) {
      if (f.key === 'lv' || f.key === 'gold' || f.key === 'bonus') p[f.key] = vals[f.key];
      else p.base[f.key] = vals[f.key];
    });
    if (lvChanged) p.exp = 0;
    try { if (typeof calcStats === 'function') calcStats(); } catch (e) {}
    try { p.hp = p.mhp; p.mp = p.mmp; if (typeof calcStats === 'function') calcStats(); } catch (e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
    msg.style.color = '#86efac';
    msg.textContent = '已套用並存檔';
    setTimeout(close, 700);
  }

  function tick() {
    if (!btn) return;
    btn.style.display = ready() ? 'block' : 'none';
    if (!ready() && panel) panel.style.display = 'none';
  }

  function start() {
    build();
    setInterval(tick, 800);
    tick();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
