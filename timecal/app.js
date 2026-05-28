'use strict';

/* ===== 状態 ===== */
const state = {
  token: null,
  userName: null,
  isAdmin: false,
  weekStart: null,       // 月曜日 (Date)
  entries: {},           // "YYYY-MM-DD_H" → brandCode
  confirmed: new Set(),  // 確定済み日付 "YYYY-MM-DD"
  selectedBrand: null,
  busy: false,
};

/* ===== 日付ユーティリティ ===== */
function monday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function fmtYM(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
}
function pad(n) { return String(n).padStart(2, '0'); }

/* ===== JSONP API ===== */
function api(params) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.GAS_URL) {
      // GAS未設定時はデモ応答
      resolve({ demo: true, entries: [], confirmedDays: [], summary: [] });
      return;
    }
    const cbName = '_gc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    let timer;

    window[cbName] = function(data) {
      clearTimeout(timer);
      delete window[cbName];
      script.remove();
      resolve(data);
    };

    const qs = Object.entries({ ...params, callback: cbName })
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
      .join('&');

    const script = document.createElement('script');
    script.src = CONFIG.GAS_URL + '?' + qs;
    script.onerror = () => {
      clearTimeout(timer);
      delete window[cbName];
      script.remove();
      reject(new Error('通信エラー'));
    };
    timer = setTimeout(() => {
      delete window[cbName];
      script.remove();
      reject(new Error('タイムアウト'));
    }, 35000);
    document.head.appendChild(script);
  });
}

/* ===== トースト ===== */
function toast(msg, type = 'info', ms = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.classList.add('hidden'), 300);
  }, ms);
}

/* ===== オーバーレイ ===== */
function setLoading(on, msg = '読み込み中...') {
  const el = document.getElementById('overlay');
  document.getElementById('overlayMsg').textContent = msg;
  el.classList.toggle('hidden', !on);
}

/* ===== 認証 ===== */
function auth() {
  const token = new URLSearchParams(location.search).get('token');
  const user = token && CONFIG.USERS[token];
  if (!user) {
    document.body.innerHTML = `
      <div class="error-page">
        <div class="error-card">
          <h2>アクセスできません</h2>
          <p>有効な個人URLからアクセスしてください。<br>URLが正しいかご確認ください。</p>
        </div>
      </div>`;
    return false;
  }
  state.token    = token;
  state.userName = user.name;
  state.isAdmin  = user.isAdmin;

  document.getElementById('userChip').textContent = user.name;
  if (user.isAdmin) {
    document.getElementById('adminLink').style.display = '';
    // adminLinkのhrefにtokenを付与
    document.getElementById('adminLink').href = `admin.html?token=${CONFIG.ADMIN_TOKEN}`;
  }
  return true;
}

/* ===== ブランドパレット ===== */
function initPalette() {
  const palette = document.getElementById('brandPalette');
  // NA（対象外）は入力パレットにも表示（上書き用）
  CONFIG.BRANDS.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'brand-btn';
    btn.dataset.code = b.code;
    btn.textContent = b.name;
    if (b.isStripe) {
      btn.classList.add('brand-btn-vccd');
    } else {
      btn.style.background = b.color;
      btn.style.color = b.textColor;
    }
    btn.addEventListener('click', () => {
      state.selectedBrand = state.selectedBrand === b.code ? null : b.code;
      document.querySelectorAll('.brand-btn').forEach(el =>
        el.classList.toggle('active', el.dataset.code === state.selectedBrand)
      );
    });
    palette.appendChild(btn);
  });
}

/* ===== カレンダー描画 ===== */
function buildCalendar() {
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  const dates = Array.from({ length: 5 }, (_, i) => addDays(state.weekStart, i));
  const dayNames = ['月', '火', '水', '木', '金'];

  // 週ラベル
  document.getElementById('weekLabel').textContent =
    `${dates[0].getMonth()+1}月${dates[0].getDate()}日（月）〜 ` +
    `${dates[4].getMonth()+1}月${dates[4].getDate()}日（金）`;

  // 1列目ヘッダー（空）
  const th0 = el('div', 'cal-th th-time');
  grid.appendChild(th0);

  // 曜日ヘッダー
  dates.forEach((d, i) => {
    const dateStr = fmtDate(d);
    const isConf = state.confirmed.has(dateStr);
    const th = el('div', 'cal-th');
    th.innerHTML = `
      <div class="day-name">${dayNames[i]}</div>
      <div class="day-date">${d.getMonth()+1}/${d.getDate()}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'confirm-day-btn' + (isConf ? ' is-confirmed' : '');
    btn.textContent = isConf ? '確定済み ✓' : '確定';
    btn.disabled = isConf;
    if (!isConf) {
      btn.addEventListener('click', () => doConfirm(dateStr, btn, d));
    }
    th.appendChild(btn);
    grid.appendChild(th);
  });

  // 時間行
  CONFIG.HOURS.forEach(h => {
    // 時間ラベル
    grid.appendChild(Object.assign(el('div', 'time-label'), { textContent: `${h}:00` }));

    dates.forEach(d => {
      const dateStr = fmtDate(d);
      const key = `${dateStr}_${h}`;
      const isFixed = CONFIG.FIXED_NA_HOURS.includes(h);
      const isConfDay = state.confirmed.has(dateStr);

      let brand = state.entries[key];
      if (brand === undefined) {
        brand = (isFixed || CONFIG.DEFAULT_NA_HOURS.includes(h))
          ? CONFIG.BRAND_NA : CONFIG.BRAND_UNSET;
        state.entries[key] = brand;
      }

      const cell = el('div', 'entry-cell');
      cell.dataset.brand = brand;
      cell.dataset.key   = key;
      cell.dataset.date  = dateStr;
      cell.dataset.hour  = h;

      if (isFixed)   cell.classList.add('cell-fixed');
      if (isConfDay) cell.classList.add('cell-locked');

      const label = brandLabel(brand);
      if (label) cell.textContent = label;

      if (!isFixed && !isConfDay) {
        cell.addEventListener('click', () => onCellClick(cell));
      }
      grid.appendChild(cell);
    });
  });
}

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function brandLabel(code) {
  if (code === CONFIG.BRAND_UNSET) return '';
  const b = CONFIG.BRANDS.find(x => x.code === code);
  return b ? b.name : '';
}

/* ===== セルクリック ===== */
async function onCellClick(cell) {
  if (!state.selectedBrand) {
    toast('先にブランドを選択してください', 'error', 2000);
    return;
  }
  if (state.busy) return;

  const key  = cell.dataset.key;
  const date = cell.dataset.date;
  const hour = parseInt(cell.dataset.hour);
  const prev = state.entries[key];

  // 同じブランドをクリック → 元のデフォルト値に戻す
  const next = (prev === state.selectedBrand)
    ? (CONFIG.DEFAULT_NA_HOURS.includes(hour) ? CONFIG.BRAND_NA : CONFIG.BRAND_UNSET)
    : state.selectedBrand;

  // 即時反映
  applyCell(cell, next);
  state.entries[key] = next;

  // API保存
  state.busy = true;
  try {
    const res = await api({ action: 'saveEntry', userToken: state.token, date, hour, brand: next });
    if (res.error) {
      toast(res.message || 'エラー', 'error');
      applyCell(cell, prev);
      state.entries[key] = prev;
    }
  } catch (e) {
    toast(e.message, 'error');
    applyCell(cell, prev);
    state.entries[key] = prev;
  } finally {
    state.busy = false;
  }
}

function applyCell(cell, brand) {
  cell.dataset.brand = brand;
  cell.textContent = brandLabel(brand);
}

/* ===== 確定処理 ===== */
async function doConfirm(dateStr, btn, d) {
  // その日に未入力（UNSET）の枠があるか確認
  const unsetHours = CONFIG.HOURS.filter(h => {
    if (CONFIG.FIXED_NA_HOURS.includes(h)) return false;
    const key = `${dateStr}_${h}`;
    return state.entries[key] === CONFIG.BRAND_UNSET;
  });

  let confirmMsg = `${d.getMonth()+1}月${d.getDate()}日を確定しますか？\n確定後は変更できません。`;
  if (unsetHours.length > 0) {
    confirmMsg += `\n\n※ ${unsetHours.length}枠が「種別なし」のままです。よろしいですか？`;
  }
  if (!confirm(confirmMsg)) return;

  setLoading(true, '確定中...');
  try {
    const res = await api({ action: 'confirmDay', userToken: state.token, date: dateStr });
    if (res.error) {
      toast(res.message || '確定に失敗しました', 'error');
    } else {
      state.confirmed.add(dateStr);
      toast(`${d.getMonth()+1}/${d.getDate()} を確定しました`, 'success');
      buildCalendar();
      loadSummary();
    }
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ===== データ取得 ===== */
async function loadWeek() {
  setLoading(true);
  try {
    const start = fmtDate(state.weekStart);
    const end   = fmtDate(addDays(state.weekStart, 4));
    const res   = await api({ action: 'getEntries', userToken: state.token, startDate: start, endDate: end });

    if (res.error) { toast(res.error, 'error'); return; }

    // 確定状態
    state.confirmed.clear();
    (res.confirmedDays || []).forEach(d => state.confirmed.add(d));

    // デフォルト値セット
    for (let i = 0; i < 5; i++) {
      const d = fmtDate(addDays(state.weekStart, i));
      CONFIG.HOURS.forEach(h => {
        const key = `${d}_${h}`;
        state.entries[key] = (CONFIG.FIXED_NA_HOURS.includes(h) || CONFIG.DEFAULT_NA_HOURS.includes(h))
          ? CONFIG.BRAND_NA : CONFIG.BRAND_UNSET;
      });
    }

    // サーバーデータで上書き
    (res.entries || []).forEach(e => { state.entries[`${e.date}_${e.hour}`] = e.brand; });

    buildCalendar();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ===== 月次サマリー ===== */
async function loadSummary() {
  const ym  = fmtYM(new Date());
  document.getElementById('summaryYM').textContent = ym.replace('-', '年') + '月';
  const chips = document.getElementById('summaryChips');
  chips.innerHTML = '<span class="summary-loading">集計中...</span>';

  try {
    const res = await api({ action: 'getMonthSummary', userToken: state.token, yearMonth: ym });
    chips.innerHTML = '';

    if (!res.summary || res.summary.length === 0 || res.demo) {
      chips.innerHTML = '<span class="summary-empty">確定済みデータがまだありません</span>';
      return;
    }

    res.summary.forEach(item => {
      const b = CONFIG.BRANDS.find(x => x.code === item.brand);
      if (!b) return;
      const chip = el('div', 'summary-chip');

      const swatch = el('div', 'chip-swatch' + (b.isStripe ? ' swatch-vccd' : ''));
      if (!b.isStripe) swatch.style.background = b.color;
      chip.appendChild(swatch);

      chip.insertAdjacentHTML('beforeend', `
        <span class="chip-name">${b.name}</span>
        <span class="chip-hours">${item.hours}</span>
        <span class="chip-unit">h</span>
      `);
      chips.appendChild(chip);
    });
  } catch (e) {
    chips.innerHTML = '<span class="summary-empty">集計の取得に失敗しました</span>';
  }
}

/* ===== 週移動 ===== */
function changeWeek(delta) {
  state.weekStart = addDays(state.weekStart, delta * 7);
  loadWeek();
}

/* ===== 初期化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  if (!auth()) return;

  state.weekStart = monday(new Date());

  initPalette();
  loadWeek();
  loadSummary();

  document.getElementById('prevWeekBtn').addEventListener('click', () => changeWeek(-1));
  document.getElementById('nextWeekBtn').addEventListener('click', () => changeWeek(1));
  document.getElementById('refreshBtn').addEventListener('click', () => { loadWeek(); loadSummary(); });
  document.getElementById('refreshSummaryBtn').addEventListener('click', loadSummary);
});
