# 月次分析レポート 引き継ぎ追記（2026年9月度）：件数・AOVの主指標変更とAOV低下の原因

> 作成：AOV深掘りチャット／2026-10-09／本ファイルは `monthly_report_handoff_2026_09.md` への追記用（元ファイルの該当箇所は本メモで訂正扱い）
> データソース：NE出荷（`spic-core.public.ne_order_items` shop_id=17・ship_date・cancel_date IS NULL）／Shopify受注（`spic-core.public.shopify_orders`・test=0）／NE受注ヘッダー（`ne_orders`）

---

## 1. 決定事項（ユーザー確定）

**件数・AOVは「Shopify受注基準の有償注文（`test=0 AND subtotal_price>0`・created_at基準・キャンセル除外なし）」を主指標とする。** KGI⑦と同定義。
NE出荷基準の出荷件数・AOVは参考値（9/3受注以降のみ送料のみ注文が載るため、前月比較には使わない）。売上金額（KGI①②④）はこれまで通りNE出荷基準。

## 2. 9月AOV低下の原因（結論）

NE出荷AOV ¥12,341→¥11,797（▲4.4%）は**見かけ上の低下**。

| 項目 | 内容 |
|---|---|
| 直接原因 | NE出荷に「送料のみ（`_delivery_fee` ¥200＝税込¥220）」注文864件が混入し、件数の分母が増えた。864件すべてShopifyの`cys_entry`系タグ（CYSトライアル）。受注日9/3〜9/17 |
| 切り分け | 送料のみトライアル注文はShopifyに7月1,477件・8月792件・9月913件と**従来から存在**。NE（受注ヘッダー・明細とも）には7〜8月は0件、9/3受注から100%載る。9/2以前は0%→9/3は19件中13件→9/4以降は全件の段差状 |
| 原因（確認済み） | データチームが**9/3から、受注金額0円・送料のみの受注もNEへ取り込む仕様に変更**したため。過去分は**来週以降に遡及取込される予定**（取込後はNE出荷の件数・AOV・出荷売上の過去月値が変動する）。なお9月のShopify送料のみ注文913件のうちNE未掲載の48件は、9/1〜9/3の取込開始前の受注（24＋18＋6件）で全件説明がつく |
| 実質AOV | NE出荷の有償注文（¥1,000以上）AOV：3月¥12,304／4月¥12,266／5月¥12,567／6月¥12,454／7月¥12,434／8月¥12,341／**9月¥12,400（+0.5%）**。ブランド別・金額帯別の構成も不変 |
| Shopify受注基準 | 有償注文 8月17,910件・AOV¥12,325 → 9月17,052件（▲4.8%）・AOV¥12,376（+¥51）。前年同月（2025-09）は20,017件・AOV¥11,748（件数▲14.8%・AOV+5.3%） |

### 売上差の分解（訂正）

| 基準 | 差額 | 件数要因 | 単価要因 |
|---|---:|---:|---:|
| Shopify受注（有償）売上：¥220.75M→¥211.04M | ▲¥9.71M（▲4.4%） | ▲¥10.58M | +¥0.87M |
| NE出荷売上（有償注文基準・参考）：▲¥13.96M | ▲¥13.96M | ▲¥15.12M（有償注文▲1,225件・▲6.9%） | +¥0.99M（＋送料のみ注文+¥0.17M） |

→ **ハンドオフの「売上減の約7割はAOV要因」は誤り。主因は有償注文件数の減少。** VCの有償注文（NE出荷）は9,410→8,537件（▲9.3%）・出荷売上▲¥9.98M（有償注文売上減の約7割）。

注意：Shopify受注のキャンセル件数は8月134件・9月66件（キャンセル除外なし定義のため、9月は後続キャンセル反映でわずかに下振れ余地あり）。

## 3. 反映状況

| ファイル | 状況 |
|---|---|
| `part_06_tab7_目標進捗_2026_09.html`（タブ⑦） | **修正済み（4箇所）**：KGI①の差分注記、KGI⑦の注記（NE AOVとの関係）、KGI⑦着地予測（YoY追記）、集計定義（主指標の統一） |
| `part_07_tab6_まとめ提言_2026_09.html`（タブ⑥） | **修正済み（12箇所）**：要因①、発見①、スコアカード、提言⑤、10月確認指標、総合考察、データソース |
| `part_05_tab1_基礎データ_2026_09.html`（タブ①） | **修正済み**：今月カード、考察、12ヶ月表（有償注文件数・AOV列を追加）、注記、総合注目ポイント、10月確認指標。※下記4章は修正内容の記録（残作業なし） |

## 4. part_05（タブ①）の修正内容（実施済み・記録）

1. AOVカード／直近12ヶ月サマリーの「AOV ¥11,797（前月¥12,341／▲4.4%）」を、**Shopify受注基準・有償注文のAOV ¥12,376（前月¥12,325／+¥51）**に差し替える。NE出荷基準の値は注記に降格し、「¥11,797は9/3受注からNEに載り始めたCYS送料のみ注文864件の混入による見かけの低下（除外後¥12,400）」と明記する。
2. 件数は「出荷件数17,483件」ではなく、**有償注文17,052件（Shopify受注・前月17,910件・▲4.8%）**を主表示にする。出荷件数は参考値（送料のみ注文864件を含む）と注記。
3. 「売上減の約7割はAOV要因」「前月差▲¥13.9Mの約75%がVC」のうち、前者を「**主因は有償注文件数の減少（Shopify受注▲4.8%・AOVは+¥51）**」に訂正（VC約75%は維持）。
4. 「タブ⑥ まとめ」コメントの「②売上減の主因はVCとAOV低下」を「VCの有償注文件数の減少」に、「④10月確認指標：…／AOV／…」を「有償注文件数・AOV（Shopify受注）」に更新。
5. 未解決欄の「3. AOV低下の内訳（VC複数箱・ギフト…）は未分解」を**解消済み**に変更し、新規に「9/3のNE掲載変更はデータチームの取込仕様変更（確認済み）。過去分の遡及取込（来週以降）後に再抽出」を追記。
6. 12ヶ月推移表のAOV・件数列（NE出荷）は、7月（SB FIRST KIT 317件）・9月（送料のみ864件）の混入を脚注で示すか、Shopify受注・有償基準に置換する。

## 5. 確認済み事項と今後の注意（2026-10-09更新）

1. **9/3の掲載変更理由は確認済み**：データチームが、0円受注・送料のみのレコードもNEへ取り込む仕様に変更（9/3〜）。
2. **過去分の遡及取込（来週以降予定）**：0円・送料のみ負担の受注も過去月分をNEへ取り込む予定。取込後は、**NE出荷の件数が増えAOVが下がる方向に過去月値が変動**する（7月1,477件・8月792件分など。出荷売上への影響は1件¥200程度で軽微）。**Shopify受注基準の主指標（有償注文件数・AOV）は影響を受けない**ため、主指標への統一は遡及取込後も有効。
3. **遡及取込後の再抽出**：10月度の12ヶ月表のNE出荷列（件数・出荷売上・受注売上）は再抽出し、前月レポート掲載値との差分を注記する（月次レポートの既存ルール：ドリフト注記）。
4. **データチームへの確認事項（任意）**：遡及分の`ship_date`・`order_date`の付与方法（Shopify受注日／出荷日のどちらか）、1注文の商品明細（0円行）も取り込むか、取込完了日。0円商品明細が追加される場合は`goods_id`・`sales=0`行の扱いを確認する。
5. 元ハンドオフ「未解決」の「AOV低下の内訳」（タブ①4-3・タブ⑥4-6）は本メモで解消。
6. 出荷件数の2件差（ハンドオフ17,483件／再抽出17,481件）は後続キャンセル反映の可能性。

## 6. 再現クエリ

```sql
-- (A) 主指標：Shopify受注 有償注文の件数・売上・AOV（KGI⑦と同定義）
SELECT FORMAT_DATE('%Y-%m', DATE(created_at)) ym,
  COUNT(*) orders,
  ROUND(SUM(total_price-current_total_tax)) revenue,
  ROUND(AVG(total_price-current_total_tax),2) aov
FROM `spic-core.public.shopify_orders`
WHERE test=0 AND subtotal_price>0
  AND DATE(created_at) BETWEEN '2026-06-01' AND '2026-09-30'
GROUP BY 1 ORDER BY 1;

-- (B) 参考：NE出荷 有償注文（¥1,000以上）と送料のみ注文の分離
WITH o AS (
  SELECT receive_order_id, MIN(ship_date) sd, SUM(sales) rev
  FROM `spic-core.public.ne_order_items`
  WHERE shop_id=17 AND cancel_date IS NULL
    AND ship_date BETWEEN '2026-03-01' AND '2026-09-30'
  GROUP BY 1)
SELECT FORMAT_DATE('%Y-%m', sd) ym,
  COUNT(*) all_orders, ROUND(SUM(rev)/COUNT(*)) aov_all,
  COUNTIF(rev>=1000) paid_orders,
  ROUND(SUM(IF(rev>=1000,rev,0))/COUNTIF(rev>=1000)) aov_paid,
  COUNTIF(rev<1000) low_orders
FROM o GROUP BY 1 ORDER BY 1;

-- (C) Shopify送料のみ注文（商品小計0円・¥220前後・出荷済み）がNEに載っているか
WITH z AS (
  SELECT name, FORMAT_DATE('%Y-%m', DATE(created_at)) cm
  FROM `spic-core.public.shopify_orders`
  WHERE test=0 AND subtotal_price<=0 AND total_price BETWEEN 200 AND 250
    AND fulfillment_status='fulfilled'
    AND DATE(created_at) BETWEEN '2026-07-01' AND '2026-09-30')
SELECT z.cm, COUNT(*) shopify_trial,
  COUNTIF(i.shop_order_id IS NOT NULL) in_ne_items
FROM z LEFT JOIN (SELECT DISTINCT shop_order_id FROM `spic-core.public.ne_order_items`) i
  ON i.shop_order_id=z.name
GROUP BY 1 ORDER BY 1;

-- (D) 送料のみ注文の識別（価格閾値に依存しない・遡及取込後も有効）
WITH o AS (
  SELECT receive_order_id, MIN(ship_date) sd, SUM(sales) rev,
    LOGICAL_AND(goods_id LIKE '\\_%') AS fee_only
  FROM `spic-core.public.ne_order_items`
  WHERE shop_id=17 AND cancel_date IS NULL
  GROUP BY 1)
SELECT FORMAT_DATE('%Y-%m', sd) ym, COUNT(*) all_orders,
  COUNTIF(fee_only) fee_only_orders,
  ROUND(SUM(IF(NOT fee_only,rev,0))/COUNTIF(NOT fee_only)) aov_excl_fee_only
FROM o GROUP BY 1 ORDER BY 1;
```

## 7. ナレッジ反映（手動・候補）

`reference_customer_analysis_workflow.md`（タブ①・タブ⑦の章）／`reference_customer_analysis_queries.md` に追記：

- 件数・AOVの主指標は「Shopify受注基準の有償注文（`test=0 AND subtotal_price>0`・キャンセル除外なし）」。NE出荷基準の件数・AOVは参考値。
- NE（shop_id=17）は、データチームの取込仕様変更により**2026-09-03受注以降のみ**、0円・送料のみ受注（`_delivery_fee`¥200・商品明細なし）を載せる。それ以前（7〜8月）の同種注文（Shopifyでは月800〜1,500件）はNEに存在しない。**過去分は来週以降に遡及取込予定**で、取込後はNE出荷の件数・AOVの過去月値が変動する。
- 送料のみ注文の識別は、価格閾値（¥1,000未満）ではなく**「全明細の`goods_id`が`_`始まり（`_delivery_fee`）」**を使う（9月864件のみを抽出し、7月のSB FIRST KIT 317件〔商品明細あり〕を誤って含まない。遡及取込後も有効）。NE出荷の件数・AOVを月間比較する際は、送料のみ注文を除外した有償注文基準で併記すること。
- 7月にも¥1,000未満の注文317件（SB FIRST KIT・単日出荷）があり、NE出荷AOVを下押ししている。
