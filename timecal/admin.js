'use strict';

/* ===== 共通ユーティリティ ===== */
function pad(n) { return String(n).padStart(2, '0'); }
function fmtYM(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }

async function api(params) {
  if (!CONFIG.GAS_URL) {
    return demoData();
  }
  const qs = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
    .join('&');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  try {
    const res = await fetch(CONFIG.GAS_URL + '?' + qs, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('タイムアウト');
    throw new Error('通信エラー');
  } finally {
    clearTimeout(timer);
  }
}

function toast(msg, type = 'info', ms = 4000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.classList.add('hidden'), 300);
  }, ms);
}

function getBrand(code) {
  return CONFIG.BRANDS.find(b => b.code === code);
}
function getBrandColor(code) {
  if (code === 'UNSET') return '#E5E7EB';
  const b = getBrand(code);
  return b ? (b.isStripe ? b.color1 : b.color) : '#9CA3AF';
}
function getBrandName(code) {
  if (code === 'UNSET') return '種別なし';
  const b = getBrand(code);
  return b ? b.name : code;
}

/* ===== 認証 ===== */
function auth() {
  const token = new URLSearchParams(location.search).get('token');
  const isAdminToken = token === CONFIG.ADMIN_TOKEN;
  const isAdminUser  = token && CONFIG.USERS[token]?.isAdmin;
  if (!isAdminToken && !isAdminUser) {
    document.body.innerHTML = `
      <div class="error-page">
        <div class="error-card">
          <h2>アクセスできません</h2>
          <p>管理者用URLからアクセスしてください。</p>
        </div>
      </div>`;
    return false;
  }
  return true;
}

/* ===== 月選択初期化 ===== */
function initMonthSel() {
  const sel = document.getElementById('monthSel');
  const now = new Date();
  for (let i = -3; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = fmtYM(d);
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = `${d.getFullYear()}年${d.getMonth()+1}月`;
    if (i === 0) opt.selected = true;
    sel.appendChild(opt);
  }
}

/* ===== データ取得・描画 ===== */
async function load() {
  const token   = new URLSearchParams(location.search).get('token');
  const yearMonth = document.getElementById('monthSel').value;

  document.getElementById('adminLoading').classList.remove('hidden');
  document.getElementById('adminContent').classList.add('hidden');

  try {
    const data = await api({ action: 'getAdminSummary', userToken: token, yearMonth });

    if (data.error) { toast('エラー: ' + data.error, 'error'); return; }

    renderProgress(data);
    renderBrandSummary(data);
    renderPrediction(data);
    renderCharts(data);

    document.getElementById('lastUpdated').textContent =
      '最終更新: ' + new Date().toLocaleTimeString('ja-JP');
    document.getElementById('adminLoading').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
  } catch (e) {
    toast(e.message, 'error');
    document.getElementById('adminLoading').classList.add('hidden');
  }
}

/* ===== 確定状況 ===== */
function renderProgress(data) {
  const el = document.getElementById('progressBody');

  const lateCount = data.users.filter(u => u.confirmedDays < data.workdaysPassed).length;
  const doneCount = data.users.filter(u => u.confirmedDays >= data.workdaysTotal).length;

  let html = `
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="padding:4px 12px;border-radius:12px;background:#D1FAE5;color:#065F46;font-size:12px;font-weight:700;">全日確定 ${doneCount}名</span>
      <span style="padding:4px 12px;border-radius:12px;background:#FEE2E2;color:#991B1B;font-size:12px;font-weight:700;">遅延 ${lateCount}名</span>
      <span style="padding:4px 12px;border-radius:12px;background:#EFF6FF;color:#1D4ED8;font-size:12px;font-weight:700;">営業日 ${data.workdaysTotal}日 / 経過 ${data.workdaysPassed}日</span>
    </div>
    <table class="progress-table">
      <thead>
        <tr>
          <th>担当者</th>
          <th>確定日数</th>
          <th style="min-width:120px;">進捗</th>
          <th>状態</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.users.forEach(u => {
    const pct   = data.workdaysTotal > 0 ? Math.round(u.confirmedDays / data.workdaysTotal * 100) : 0;
    const isDone = u.confirmedDays >= data.workdaysTotal;
    const isLate = !isDone && u.confirmedDays < data.workdaysPassed;
    const rowCls = isDone ? 'row-done' : (isLate ? 'row-late' : '');
    const badgeCls = isDone ? 'done' : (isLate ? 'late' : 'ok');
    const badgeText = isDone ? '✓ 完了' : (isLate ? '⚠ 遅延' : '進行中');
    const barColor  = isDone ? '#059669' : (isLate ? '#DC2626' : '#3B82F6');

    html += `
      <tr class="${rowCls}">
        <td style="font-weight:600;">${u.name}</td>
        <td style="text-align:center;">${u.confirmedDays} / ${data.workdaysTotal}</td>
        <td>
          <div class="prog-bar-wrap">
            <div class="prog-bar-bg">
              <div class="prog-bar-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <span class="prog-pct">${pct}%</span>
          </div>
        </td>
        <td><span class="status-badge ${badgeCls}">${badgeText}</span></td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  el.innerHTML = html;
}

/* ===== ブランド別集計バー ===== */
function renderBrandSummary(data) {
  const el = document.getElementById('brandBody');
  const entries = Object.entries(data.totalByBrand).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, h]) => s + h, 0);

  if (entries.length === 0) {
    el.innerHTML = '<p style="color:#9CA3AF;font-size:13px;">確定済みデータがありません</p>';
    return;
  }

  const bars = entries.map(([code, hours]) => {
    const pct   = total > 0 ? Math.round(hours / total * 100) : 0;
    const color = getBrandColor(code);
    const name  = getBrandName(code);
    return `
      <div class="brand-bar-row">
        <div class="brand-bar-name">${name}</div>
        <div class="brand-bar-track">
          <div class="brand-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <div class="brand-bar-value">${hours}h (${pct}%)</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `<div class="brand-bars">${bars}</div>
    <div style="margin-top:12px;font-size:12px;color:#6B7280;">チーム合計: ${total}h</div>`;
}

/* ===== 月末予測 ===== */
function renderPrediction(data) {
  const el = document.getElementById('predBody');
  const entries = Object.entries(data.predictedByBrand).sort((a, b) => b[1] - a[1]);
  const totalPred = entries.reduce((s, [, h]) => s + h, 0);
  const totalActual = Object.values(data.totalByBrand).reduce((s, h) => s + h, 0);
  const remaining = data.workdaysTotal - data.workdaysPassed;

  let html = `
    <div class="prediction-note">
      残り <strong>${remaining}</strong> 営業日。確定済み実績から日割りで外挿した予測値です。
    </div>
    <div>
  `;

  if (entries.length === 0) {
    html += '<p style="color:#9CA3AF;font-size:13px;">確定済みデータがありません</p>';
  } else {
    entries.forEach(([code, pred]) => {
      const actual = data.totalByBrand[code] || 0;
      html += `
        <div class="pred-row">
          <span class="pred-brand-name">${getBrandName(code)}</span>
          <span class="pred-actual">確定 ${actual}h</span>
          <span class="pred-arrow">→</span>
          <span class="pred-forecast">月末予測 ${pred}h</span>
        </div>
      `;
    });
    html += `
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid #E5E7EB;font-size:13px;color:#374151;font-weight:700;">
        チーム合計: 確定 ${totalActual}h → 予測 ${totalPred}h
      </div>
    `;
  }

  html += '</div>';
  el.innerHTML = html;
}

/* ===== 担当者別円グラフ ===== */
let chartInstances = [];

function renderCharts(data) {
  // 既存チャートを破棄
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];

  const grid = document.getElementById('chartsGrid');
  grid.innerHTML = '';

  data.users.forEach((user, idx) => {
    const canvasId = `chart_${idx}`;
    const card = document.createElement('div');
    card.className = 'user-chart-card';

    const totalConf = user.confirmedDays * 8; // 1日8時間（対象外3h除く）
    const knownH    = Object.values(user.brandHours).reduce((s, h) => s + h, 0);
    const unsetH    = Math.max(0, totalConf - knownH);

    const brandMap = { ...user.brandHours };
    if (unsetH > 0) brandMap['UNSET'] = unsetH;

    const labels = Object.keys(brandMap).map(getBrandName);
    const values = Object.values(brandMap);
    const colors = Object.keys(brandMap).map(getBrandColor);

    card.innerHTML = `
      <h4>${user.name}</h4>
      <p class="chart-sub">確定 ${user.confirmedDays} / ${data.workdaysTotal} 日</p>
      <div class="chart-canvas-wrap">
        <canvas id="${canvasId}" width="200" height="200"></canvas>
      </div>
    `;
    grid.appendChild(card);

    if (values.length === 0 || values.every(v => v === 0)) {
      card.insertAdjacentHTML('beforeend', '<p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:8px;">データなし</p>');
      return;
    }

    const chart = new Chart(document.getElementById(canvasId), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: false,
        animation: { duration: 400 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 10 }, boxWidth: 12, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed}h`,
            },
          },
        },
      },
    });
    chartInstances.push(chart);
  });
}

/* ===== デモデータ（GAS未設定時） ===== */
function demoData() {
  const now = new Date();
  const ym  = fmtYM(now);
  const users = Object.entries(CONFIG.USERS).map(([token, u]) => ({
    token, name: u.name,
    confirmedDays: Math.floor(Math.random() * 12) + 3,
    brandHours: {
      VCCD: Math.floor(Math.random() * 20),
      CCERA: Math.floor(Math.random() * 15),
      SB:   Math.floor(Math.random() * 10),
      MI:   Math.floor(Math.random() * 8),
      CBD:  Math.floor(Math.random() * 5),
      NONE: Math.floor(Math.random() * 8),
    },
  }));

  const totalByBrand = {};
  users.forEach(u => {
    Object.entries(u.brandHours).forEach(([b, h]) => {
      totalByBrand[b] = (totalByBrand[b] || 0) + h;
    });
  });

  const workdaysTotal   = 20;
  const workdaysPassed  = 12;
  const predictedByBrand = {};
  Object.entries(totalByBrand).forEach(([b, h]) => {
    predictedByBrand[b] = Math.round(h * workdaysTotal / workdaysPassed);
  });

  return { yearMonth: ym, workdaysTotal, workdaysPassed, users, totalByBrand, predictedByBrand };
}

/* ===== 初期化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  if (!auth()) return;
  initMonthSel();
  document.getElementById('loadBtn').addEventListener('click', load);
  document.getElementById('monthSel').addEventListener('change', load);
  load();
});
