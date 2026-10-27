/* afk-rates.js － 自訂倍率外掛（單機自己玩用）
 *
 * 只要改下面三個數字，存檔後重新整理遊戲就生效：
 *   exp  經驗倍率（1 = 原版，5 = 五倍）
 *   drop 掉寶倍率（乘在所有物品掉落機率上）
 *   gold 金幣倍率（怪物掉的金幣）
 *
 * 離線掛機的收益是用你線上實際擊殺的數字推算，所以也會跟著這三個倍率走。
 */
(function () {
  'use strict';

  var RATE = {
    exp: 500,
    drop: 150,
    gold: 400
  };

  function num(v, d) { v = Number(v); return (isFinite(v) && v > 0) ? v : d; }
  RATE.exp = num(RATE.exp, 1);
  RATE.drop = num(RATE.drop, 1);
  RATE.gold = num(RATE.gold, 1);

  // 經驗：核心用 mob.exp * (1 + partyExpBonusPct()/100)，把倍率折進這個百分比。
  if (typeof window.partyExpBonusPct === 'function') {
    var _exp = window.partyExpBonusPct;
    window.partyExpBonusPct = function () {
      var b = Number(_exp.apply(this, arguments)) || 0;
      return ((1 + b / 100) * RATE.exp - 1) * 100;
    };
  }

  // 掉寶：核心的掉落機率都乘上 partyRewardMult()，這裡再乘一次掉寶倍率。
  if (typeof window.partyRewardMult === 'function') {
    var _drop = window.partyRewardMult;
    window.partyRewardMult = function () {
      var m = Number(_drop.apply(this, arguments));
      if (!isFinite(m) || m < 1) m = 1;
      return m * RATE.drop;
    };
  }

  // 金幣：放大每隻怪的金幣範圍。
  if (typeof window.monsterGoldRange === 'function') {
    var _gold = window.monsterGoldRange;
    window.monsterGoldRange = function () {
      var r = _gold.apply(this, arguments);
      if (!r || typeof r !== 'object') return r;
      return {
        min: Math.max(1, Math.round(r.min * RATE.gold)),
        max: Math.max(1, Math.round(r.max * RATE.gold))
      };
    };
  }
})();
