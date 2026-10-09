# handoff_tab2_lypoc_2026_09（Lypo-C一体版 ブランドCRMレポート／Chat1 → Chat2・Chat3 引き継ぎ）

作成：2026-10-08（Chat1＝tab2のBQ実行＋定義確定）／基準日：**2026-09-30**（全章共通）
データソース：**Shopify受注（shopify_orders）× SKUブランドマスター（sandbox_nishimori.shopify_sku_brand_master）**
数値の実体：`handoff_tab2_data_lypoc_2026_09.json`（同梱。HTML生成時はBQ再実行不要）

## 1. 確定した集計定義（西守さん回答反映）
| 項目 | 確定内容 |
|---|---|
| 対象 | VC＋C+D＋C+D+K の和集合（SKUマスター`brand IN ('VC','C+D','C+D+K')`）。アイテム間の移動は全章で無視（継続・購入回数に通算） |
| コホートM0（tab2） | **純粋新規のみ**（生涯初の有償注文日＝3アイテムいずれかの初回有償購入日）。アイテム新規は既存扱い＝コホートに含めない |
| 定期ACTIVE・7-2 | **顧客単位**（3アイテムのいずれかACTIVEなら1。重複排除）→ chat2で実装 |
| OGS2025期 | **OGS特例を適用して表示**（`1004496`＋`OGS2025_11`の明細はprice=0扱い→OGS顧客はトライアル購入者へ）。2025-07〜09も表示し除外しない |
| 判定窓 | 31／62／93日（表示30／60／90日）。120／180／365は不変（pitfalls ㊴） |
| 税抜 | ÷1.08（3アイテムとも） |
| 章番号 | **ご指定の番号をそのまま使用**（tab1：1,2,3,3-1,3-2,4,4-2,7-2／tab2：5,5-3,5-3-2,5-3-3,5-4）。brand_report_split.pyがJS章コメントで境界検出するため、振り直しはしない |
| 5章の周期別・5-1・5-2 | 今回は対象外（ご指定なし） |

## 2. 共通CTE（全クエリ共通。10-9章のOGS特例準拠。取得上限は基準日）
```sql
WITH paid AS (
  SELECT so.customer_id, so.name AS order_name, DATE(so.created_at) AS d, so.discount_codes, so.line_items
  FROM `spic-core.public.shopify_orders` so
  WHERE so.test=0 AND so.cancelled_at IS NULL AND so.customer_id IS NOT NULL
    AND (so.total_price - so.current_total_tax) > 0
    AND (so.discount_codes IS NULL OR so.discount_codes NOT LIKE '%CYS0810%')
    AND DATE(so.created_at) <= '2026-09-30'),
line2 AS (
  SELECT p.customer_id, p.order_name, p.d, JSON_EXTRACT_SCALAR(item,'$.sku') AS sku,
    IF(JSON_EXTRACT_SCALAR(item,'$.sku')='1004496' AND p.discount_codes LIKE '%OGS2025_11%', 0,
       SAFE_CAST(JSON_EXTRACT_SCALAR(item,'$.price') AS FLOAT64)) AS pr,
    SAFE_CAST(JSON_EXTRACT_SCALAR(item,'$.quantity') AS FLOAT64) AS qty
  FROM paid p, UNNEST(JSON_EXTRACT_ARRAY(p.line_items)) item),
life AS (SELECT customer_id, MIN(d) AS life_first FROM paid GROUP BY 1),
bo AS (  -- 3アイテム合算の有償注文（注文単位）。is_teikiは5-3-3用
  SELECT l.customer_id, l.order_name, l.d, MAX(IF(bm.product_type='定期',1,0)) AS is_teiki
  FROM line2 l JOIN `spic-com-2025-apr-00.sandbox_nishimori.shopify_sku_brand_master` bm ON l.sku = CAST(bm.sku AS STRING)
  WHERE bm.brand IN ('VC','C+D','C+D+K') AND l.pr > 0
  GROUP BY 1,2,3)
```
- 5章（M+N）：`fb`（顧客別MIN(d)）→`cust`（cm＝初回月、is_pure＝life_first=first_date）→`act`（DISTINCT 顧客×月差0〜12、is_pureのみ）→ COUNTIF(m=k)。出力 p0〜p12。
- 5-3：`ranked`（ROW_NUMBER over d,order_name）→顧客別 MAX(rn)＝n、`life_first=first_date`のみ → COUNTIF(n>=2..8)。
- 5-3-3：`ranked`→最初の`is_teiki=1`注文をseq=1として以降を再採番、**純粋新規に限定しない**（旧VC版と同じ・都度買い先行者を含む）→ COUNT DISTINCT(s>=2..8)。母集団の定期＝3アイテムの定期SKU（複数箱・Mix含む。5-1のような除外なし）。
- 5-4：`bl`（3ブランド全明細、rev＝pr×qty）→`daily`（顧客×日、SUM(rev)/1.08、有償フラグ）→anchor＝有償初日→`pure`（life_first=anchor、2024-05〜）→窓別SUM（≤31/62/93/120/180/365日）→コホート別AVG・SUM。
- スキャン約1.5GB／本。再実行する場合はdryRunで確認。

## 3. 検証結果（Chat1で実施済み）
- 5章M0＝5-3のM0＝5-4のn：**29コホート全月一致**（2406, 2345, … 2026-09=850）。
- 5-3-3のM0は別母集団（初回定期注文月）のため5章M0とは一致しない（正常）。
- JSONでは観測期間外のM+Nセルをnull化済み（5章）。5-3／5-3-3は「到達0以降は—」ルールをHTML側で適用。
- 5-4の確定セル判定「コホート月末＋N日 ≦ 2026-09-30」は`ch5_4_final_flags`に格納済み（窓順：31,62,93,120,180,365）。未確定セルはグレー表示し値を代用しない。
- **未実施（Chat3で実施）**：VC版9月版との差分の妥当性確認（例：VC単独の純粋新規M0 2026-06＝759人、一体版＝1,044人。差はC+D／C+D+K起点の純粋新規）。

## 4. 所見（総評・tab1総論章へ反映する素材。数値はJSONから再計算して使うこと）
- 継続率：M+1は2025-10 41.0%／2026-01 38.7%／2026-03 39.8%／2026-06 36.7%／2026-08 33.1%。M+6は2025-10 26.0%／2026-01 28.1%／2026-03 26.6%。
- F2累計到達：2025-10 63.2%／2026-01 63.1%／2026-03 61.5%。F3/F2（段階別）：2025-10 79.8%／2026-01 77.5%／2026-03 74.4%。
- 直近コホート（2026-06以降）は観測期間が短く、F2到達・M+Nは未成熟。**8月・9月コホートのF2比較は同条件日数で行うこと**（31／62／93日版の5-1は今回対象外）。
- 2025-07〜09はOGS特例適用後の値（M0 2,611／1,856／1,345）。旧版の「OGS汚染のため除外」注記は削除し、「OGS顧客はトライアル購入者に分類、転換者は転換月のアイテム新規＝本版では既存扱い（コホート外）」と注記する。
- 5-3-3の2025-08（m0 2,637）・2025-09（1,720）はOGS転換者の初回定期注文が集中した月の可能性（要注記・未検証）。

## 5. Chat3（tab2 HTML）仕様
- 入力：基準ブランド版（vc_crm_brand_report_2026_09.html）を`brand_report_split.py vc 2026_09`で分割した`part_tab2`＋本handoff＋JSON。BQは実行しない。
- 章：5（M+1〜M+12ヒートマップ。2024-05〜2026-09の29行・切替ヒートマップは不要＝純粋新規のみ）／5-3／5-3-2（5-3から派生）／5-3-3／5-4（アイテム新規/純粋新規の切替UIは削除し単一表示）。5-1・5-2・周期別は削除。
- 見出し・本文の「VC」を「Lypo-C（VC＋C+D＋C+D+K）」へ置換。ブランド色は`--accent`をtab1側と揃える（mergeはtab1のCSSを採用）。
- 注記必須：アイテム間移動は無視（継続・購入回数に通算）／M0＝純粋新規のみ／OGS特例／31・62・93日判定／基準日2026-09-30／データソース：Shopify受注×SKUブランドマスター。
- JS章コメントは`// ===== 5. ...`形式、`<meta name="robots" content="noindex, nofollow">`必須、canvasとJSの整合をnode実行で確認。
