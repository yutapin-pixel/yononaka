# Lypo-C一体版 ブランドCRMレポート 作成計画（4チャット構成・Chat1成果物）

作成：2026-10-08／対象月：2026年9月度確定／基準日：2026-09-30
形式：既存の4チャット構成（BQ／HTML生成分離型）。**Chat1（本チャット）＝tab2のBQ＋定義確定＋handoff。HTMLは作らない。**

| Chat | 内容 | 入力 | 出力 |
|---|---|---|---|
| 1（完了） | tab2（5章一式）BQ＋定義確定 | VC 9月版・ナレッジ | `handoff_tab2_lypoc_2026_09.md`／`handoff_tab2_data_lypoc_2026_09.json`／本計画書 |
| 2 | tab1（1〜4-2・7-2）BQ→handoff | 上記3点・VC 9月版 | `handoff_tab1_lypoc_2026_09.md`（＋json） |
| 3 | tab2 HTML生成（BQなし） | VC 9月版をsplitしたpart_tab2・handoff_tab2・json | `part_tab2_lypoc_202609.html` |
| 4 | tab1 HTML生成＋統合 | part_tab1・handoff_tab1・part_tab2 | `lypoc_crm_brand_report_2026_09.html`（noindex必須） |

## A. 全章共通の確定定義（handoff_tab2の1章と同一）
3アイテム和集合／アイテム間移動は無視／新規は純粋新規のみ（アイテム新規は既存へ統合）／ブランド分割表示なし／OGS特例適用／31・62・93日判定／税抜÷1.08／章番号はご指定のまま／すべてのKPIにデータソースを明記。

## B. tab1 各章の設計（Chat2で実装・検証）
| 章 | 内容 | データソース | 設計メモ |
|---|---|---|---|
| 1 現在地サマリー | 9月確定KPIカード | NE出荷／Shopify受注／Shopify定期DB | 保有顧客数＝`(has_vc=1 AND ltv_vc>0) OR (has_cd…) OR (has_cdk…)`の重複排除（`sn_shopify_customer_master`。has_cdk／ltv_cdkの存在は要確認）。4-17章の「`has_*=1`は無償モニターを含む」注意あり |
| 2 総評 | handoff_tab2の所見を引用 | — | 数値は式で再計算 |
| 3 月次NE出荷売上×定期ACTIVE | 18ヶ月（2025-04〜） | NE出荷（shop_id=17）／Shopify定期DB | NE `TRIM(goods_tag) IN ('[Lypo-C]','[Lypo-C C+D]','[Lypo-C C+D+K]')`。SPORTS系は除外（VC版の扱いを踏襲）。Mix同梱SKUはNE上VC計上のため一体版では自然に含まれる（二重計上なし）。定期ACTIVEは**顧客単位の重複排除**（`sandbox_nishimori.subscription_history_view`、snapshot_ym別、3フラグのOR×`UPPER(status)='ACTIVE'`）。月初当日は`sn_*`未反映のためsandbox側を参照（定期DB落とし穴⑦） |
| 3-1 売上内訳 | 新規売上（純粋新規）× 既存売上の2段 | NE出荷×Shopify受注 | 4-14章のロジックを和集合へ。`item_new`と`unmatched`は既存へ合算。NE `shop_order_id`＝`shopify_orders.name`で突合、`-fk-N`除去、未突合は注記。**合計は3章と必ず一致**（assert） |
| 3-2 週次売上 | 施策影響の詳細化 | NE出荷 | 週次。施策注記は`reference_campaign_history.md`（CYS 7/22〜9/17等）を参照 |
| 4 新規獲得の質 | 純粋新規コホート×初回定期選択率（月次）＋トライアル購入者（参考） | Shopify受注 | 初回注文に3アイテムの定期SKUを含む率。集計開始月は定期便開始月から（4-3章）。トライアル購入者＝`3023-cp`／`3031-cp`／OGS特例で、起点時点に3アイテムの有償購入歴なし（4-18章）。別枠・参考・M0に加算しない |
| 4-2 週次新規獲得数 | 純粋新規／トライアル購入者（参考） | Shopify受注 | 月跨ぎ分割せず週単位。合計＝4章月次と突合 |
| 7-2 グロスフロー | 新規ACTIVE vs PAUSE+CANCELLED発生 | Shopify定期DB | **顧客単位×和集合ACTIVEのLAG**で、前月非ACTIVE→ACTIVEを新規（初出／復帰）、ACTIVE→非ACTIVEをPAUSE／CANCELLED（優先順位は既存7-B・落とし穴①②〔PAUSE経由解約の二重計上〕に従う）。アイテム間乗り換えはイベントにならない（ブランドタグ切替の行は不要）。**ネット＝ストック差**をassertし、残差を明示。ブランド比較は不要（ブランド分割しない方針） |

**Chat2で最初に確認すること：** ①`subscription_history_view`のブランドフラグ列名と顧客単位和集合の実装可否 ②C+D+Kの商品・NEタグの範囲（SPORTS C+D等の除外是非。VC版の除外ルールを踏襲し、差異があれば西守さんに確認） ③保有顧客数の定義。

## C. 冒頭プロンプト（コピー用）
**Chat2：** 「Lypo-C一体版ブランドCRMレポートのChat2（tab1のBQ→handoff）。`plan_lypoc_unified_crm_report_2026_09.md`・`handoff_tab2_lypoc_2026_09.md`・`handoff_tab2_data_lypoc_2026_09.json`・`vc_crm_brand_report_2026_09.html`を添付。B章の設計どおりtab1各章のBQを実行し、全章assert検証のうえ`handoff_tab1_lypoc_2026_09.md`（データ一式型・数値省略不可）を作成。HTMLは作らない。」
**Chat3：** 「Chat3（tab2のHTML生成・BQなし）。VC 9月版を`brand_report_split.py vc 2026_09`で分割したpart_tab2とhandoff_tab2一式を添付。handoff_tab2の5章仕様に従いpart_tab2_lypoc_202609.htmlを作成。」
**Chat4：** 「Chat4（tab1のHTML生成＋統合）。part_tab1・part_tab2_lypoc・handoff_tab1／tab2を添付。assertで章間整合を確認後、`brand_report_merge.py`で統合し、タイトル手修正・noindex・canvas数・switchReportTab1箇所を検証。」

## D. 懸念・注意
- mergeスクリプトのタイトルは`brand.upper()`由来のため、出力後に「Lypo-C（VC＋C+D＋C+D+K）CRMブランドレポート 2026-09」へ手修正。ファイル名は`lypoc_crm_brand_report_2026_09.html`。
- 一体版は既存VC版と数値が連続しない（M0・継続率が変わる）。ナレッジ（values.md）には新章（例：8-26）として別建てで記録し、既存VC／C+D版の確定値を上書きしない。
- 完成後のナレッジ登録（workflow／values／queries／MEMORY.md索引・履歴1行）は最終チャット（Chat4）で実施し、`check_memory_md.py`がOKになってから提示する。
