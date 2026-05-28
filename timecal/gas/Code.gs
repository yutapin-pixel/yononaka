// ============================================================
//  工数管理システム – Google Apps Script バックエンド
//  BigQuery Advanced Service が必要です（下記セットアップ参照）
// ============================================================

// ★ ここを実際の値に変更してください
const BQ_PROJECT  = 'spic-com-2025-apr-00';  // GCPプロジェクトID
const BQ_DATASET  = 'sandbox_nishimori';      // BigQueryデータセット名
const BQ_LOCATION = 'asia-northeast1';        // データセット作成時のロケーション

// 有効なユーザートークン → 名前のマッピング
const USER_MAP = {
  'k7x9m2p4q1w3': '宮下 怜',
  'p4r8n1q6w3e5': '坂井 裕美',
  'q6w3y5j1s7r9': '伊藤 美彩',
  'j1s7t4m9v2y8': '宮城 香帆',
  'm9v2u6b5h4t3': '横山 うみ',
  'b5h4c8k7x9u2': '中村 琴菜',
};
const ADMIN_TOKEN = 'adm_wx8k3m2p9q1r4';
const VALID_TOKENS = Object.keys(USER_MAP);

// ============================================================
//  エントリーポイント
// ============================================================
function doGet(e) {
  const callback = e.parameter.callback;
  let result;

  try {
    const token  = e.parameter.userToken || '';
    const action = e.parameter.action    || '';

    if (action === 'initTables') {
      result = initTables();
    } else {
      const isUser  = VALID_TOKENS.includes(token);
      const isAdmin = token === ADMIN_TOKEN || (isUser && USER_MAP[token] === '宮下 怜');

      if (!isUser && token !== ADMIN_TOKEN) {
        result = { error: 'Invalid token' };
      } else {
        switch (action) {
          case 'getEntries':      result = getEntries(e.parameter);      break;
          case 'saveEntry':       result = saveEntry(e.parameter);        break;
          case 'confirmDay':      result = confirmDay(e.parameter);       break;
          case 'cancelConfirm':  result = cancelConfirm(e.parameter);   break;
          case 'getMonthSummary': result = getMonthSummary(e.parameter);  break;
          case 'getAdminSummary':
            if (!isAdmin && token !== ADMIN_TOKEN) {
              result = { error: 'Unauthorized' };
            } else {
              result = getAdminSummary(e.parameter);
            }
            break;
          default:
            result = { error: 'Unknown action: ' + action };
        }
      }
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  const json = JSON.stringify(result);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  BigQuery ヘルパー
// ============================================================
function bqQuery(sql) {
  const req = { query: sql, useLegacySql: false, timeoutMs: 30000, location: BQ_LOCATION };
  let res = BigQuery.Jobs.query(req, BQ_PROJECT);

  if (!res.jobComplete) {
    const jobId = res.jobReference.jobId;
    let tries = 0;
    do {
      Utilities.sleep(1000);
      res = BigQuery.Jobs.getQueryResults(BQ_PROJECT, jobId, { timeoutMs: 30000 });
      tries++;
    } while (!res.jobComplete && tries < 30);
  }

  if (res.errors && res.errors.length) {
    throw new Error(JSON.stringify(res.errors));
  }
  return res;
}

function rowsToObjects(res) {
  if (!res.rows || !res.schema) return [];
  const fields = res.schema.fields.map(f => f.name);
  return res.rows.map(row =>
    Object.fromEntries(fields.map((f, i) => [f, row.f[i].v]))
  );
}

function safe(str) {
  // SQL インジェクション対策：英数字・ハイフン・アンダースコアのみ許可
  return String(str).replace(/[^a-zA-Z0-9\-_]/g, '');
}

// ============================================================
//  テーブル初期化（初回のみ実行）
// ============================================================
function initTables() {
  bqQuery(`
    CREATE TABLE IF NOT EXISTS \`${BQ_PROJECT}.${BQ_DATASET}.time_entries\` (
      entry_id     STRING    NOT NULL,
      user_token   STRING    NOT NULL,
      entry_date   DATE      NOT NULL,
      entry_hour   INT64     NOT NULL,
      brand        STRING    NOT NULL,
      updated_at   TIMESTAMP NOT NULL
    )
  `);
  bqQuery(`
    CREATE TABLE IF NOT EXISTS \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\` (
      user_token     STRING    NOT NULL,
      confirmed_date DATE      NOT NULL,
      confirmed_at   TIMESTAMP NOT NULL
    )
  `);
  return { success: true, message: 'Tables initialized' };
}

// ============================================================
//  エントリー取得（週単位）
// ============================================================
function getEntries(p) {
  const token = safe(p.userToken);
  const start = safe(p.startDate);  // YYYY-MM-DD
  const end   = safe(p.endDate);

  const entriesRes = bqQuery(`
    SELECT
      FORMAT_DATE('%Y-%m-%d', entry_date) AS entry_date,
      entry_hour,
      brand
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY user_token, entry_date, entry_hour
          ORDER BY updated_at DESC
        ) AS rn
      FROM \`${BQ_PROJECT}.${BQ_DATASET}.time_entries\`
      WHERE user_token = '${token}'
        AND entry_date BETWEEN '${start}' AND '${end}'
    )
    WHERE rn = 1
    ORDER BY entry_date, entry_hour
  `);

  const confirmedRes = bqQuery(`
    SELECT FORMAT_DATE('%Y-%m-%d', confirmed_date) AS confirmed_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
    WHERE user_token = '${token}'
      AND confirmed_date BETWEEN '${start}' AND '${end}'
  `);

  const entries = rowsToObjects(entriesRes).map(r => ({
    date:  r.entry_date,
    hour:  parseInt(r.entry_hour),
    brand: r.brand,
  }));
  const confirmedDays = rowsToObjects(confirmedRes).map(r => r.confirmed_date);

  return { entries, confirmedDays };
}

// ============================================================
//  エントリー保存（INSERT、最新レコード優先設計）
// ============================================================
function saveEntry(p) {
  const token = safe(p.userToken);
  const date  = safe(p.date);
  const hour  = parseInt(p.hour);
  const brand = String(p.brand).replace(/[^a-zA-Z0-9+_]/g, '');

  // 確定済みチェック
  const chk = bqQuery(`
    SELECT COUNT(*) AS cnt
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
    WHERE user_token = '${token}' AND confirmed_date = '${date}'
  `);
  if (parseInt(chk.rows[0].f[0].v) > 0) {
    return { error: 'confirmed', message: 'この日付は確定済みです' };
  }

  bqQuery(`
    INSERT INTO \`${BQ_PROJECT}.${BQ_DATASET}.time_entries\`
      (entry_id, user_token, entry_date, entry_hour, brand, updated_at)
    VALUES (
      GENERATE_UUID(), '${token}', '${date}', ${hour}, '${brand}', CURRENT_TIMESTAMP()
    )
  `);
  return { success: true };
}

// ============================================================
//  日付確定
// ============================================================
function confirmDay(p) {
  const token = safe(p.userToken);
  const date  = safe(p.date);

  const chk = bqQuery(`
    SELECT COUNT(*) AS cnt
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
    WHERE user_token = '${token}' AND confirmed_date = '${date}'
  `);
  if (parseInt(chk.rows[0].f[0].v) > 0) {
    return { error: 'already_confirmed', message: '既に確定済みです' };
  }

  bqQuery(`
    INSERT INTO \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
      (user_token, confirmed_date, confirmed_at)
    VALUES ('${token}', '${date}', CURRENT_TIMESTAMP())
  `);
  return { success: true };
}

// ============================================================
//  確定解除
// ============================================================
function cancelConfirm(p) {
  const token = safe(p.userToken);
  const date  = safe(p.date);

  bqQuery(`
    DELETE FROM \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
    WHERE user_token = '${token}' AND confirmed_date = '${date}'
  `);
  return { success: true };
}

// ============================================================
//  月次サマリー（入力者用）
// ============================================================
function getMonthSummary(p) {
  const token = safe(p.userToken);
  const ym    = safe(p.yearMonth);  // YYYY-MM

  const res = bqQuery(`
    SELECT te.brand, COUNT(*) AS hours
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY user_token, entry_date, entry_hour
          ORDER BY updated_at DESC
        ) AS rn
      FROM \`${BQ_PROJECT}.${BQ_DATASET}.time_entries\`
      WHERE user_token = '${token}'
        AND FORMAT_DATE('%Y-%m', entry_date) = '${ym}'
        AND brand NOT IN ('NA', 'UNSET')
    ) te
    INNER JOIN \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\` cd
      ON te.user_token = cd.user_token
     AND te.entry_date = cd.confirmed_date
    WHERE te.rn = 1
    GROUP BY te.brand
    ORDER BY hours DESC
  `);

  const summary = rowsToObjects(res).map(r => ({
    brand: r.brand,
    hours: parseInt(r.hours),
  }));
  return { summary };
}

// ============================================================
//  管理者サマリー
// ============================================================
function workdaysInMonth(year, month) {
  let cnt = 0;
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) cnt++;
  }
  return cnt;
}

function workdaysPassed(year, month) {
  const today = new Date();
  const lastDay = (today.getFullYear() === year && today.getMonth() + 1 === month)
    ? today.getDate()
    : new Date(year, month, 0).getDate();
  let cnt = 0;
  for (let d = 1; d <= lastDay; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) cnt++;
  }
  return cnt;
}

function getAdminSummary(p) {
  const ym = safe(p.yearMonth);
  const [year, month] = ym.split('-').map(Number);

  const tokenList = VALID_TOKENS.map(t => `'${t}'`).join(',');
  const wdTotal   = workdaysInMonth(year, month);
  const wdPassed  = workdaysPassed(year, month);

  // 確定済み日数
  const confRes = bqQuery(`
    SELECT user_token, COUNT(*) AS days
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\`
    WHERE FORMAT_DATE('%Y-%m', confirmed_date) = '${ym}'
      AND user_token IN (${tokenList})
    GROUP BY user_token
  `);
  const confMap = {};
  rowsToObjects(confRes).forEach(r => { confMap[r.user_token] = parseInt(r.days); });

  // ブランド別時間（確定済みのみ、UNSET除く）
  const brandRes = bqQuery(`
    SELECT te.user_token, te.brand, COUNT(*) AS hours
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY user_token, entry_date, entry_hour
          ORDER BY updated_at DESC
        ) AS rn
      FROM \`${BQ_PROJECT}.${BQ_DATASET}.time_entries\`
      WHERE FORMAT_DATE('%Y-%m', entry_date) = '${ym}'
        AND user_token IN (${tokenList})
        AND brand NOT IN ('NA', 'UNSET')
    ) te
    INNER JOIN \`${BQ_PROJECT}.${BQ_DATASET}.confirmed_days\` cd
      ON te.user_token = cd.user_token
     AND te.entry_date = cd.confirmed_date
    WHERE te.rn = 1
    GROUP BY te.user_token, te.brand
  `);
  const brandMap = {};
  rowsToObjects(brandRes).forEach(r => {
    if (!brandMap[r.user_token]) brandMap[r.user_token] = {};
    brandMap[r.user_token][r.brand] = parseInt(r.hours);
  });

  // ユーザーごとに集計・予測を構築
  const users = VALID_TOKENS.map(token => {
    const confirmed  = confMap[token] || 0;
    const brands     = brandMap[token] || {};
    const totalHours = Object.values(brands).reduce((s, h) => s + h, 0);
    const predHours  = {};
    if (confirmed > 0) {
      Object.entries(brands).forEach(([b, h]) => {
        predHours[b] = Math.round(h * wdTotal / confirmed);
      });
    }
    return { token, name: USER_MAP[token], confirmedDays: confirmed, brandHours: brands, totalHours, predictedHours: predHours };
  });

  // チーム全体集計
  const totalByBrand = {};
  const predictedByBrand = {};
  users.forEach(u => {
    Object.entries(u.brandHours).forEach(([b, h]) => { totalByBrand[b] = (totalByBrand[b] || 0) + h; });
    Object.entries(u.predictedHours).forEach(([b, h]) => { predictedByBrand[b] = (predictedByBrand[b] || 0) + h; });
  });

  return { yearMonth: ym, workdaysTotal: wdTotal, workdaysPassed: wdPassed, users, totalByBrand, predictedByBrand };
}
