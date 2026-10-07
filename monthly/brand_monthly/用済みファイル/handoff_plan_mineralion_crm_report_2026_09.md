---
name: MINERALion CRMブランドレポート 2026年9月版 計画書作成チャットへの引き継ぎ
description: C+Cera版9月更新（4チャット構成）の完了を受け、MINERALion版を同形式で作るための「計画書作成チャット（準備チャット）」の冒頭プロンプト・アップロード一覧・読むファイル順・持ち越し未決事項・MINERALion固有の確定論点・計画書の完了条件をまとめた引き継ぎ。
type: handoff
created: 2026-10-02
---

# 0. この引き継ぎの位置づけ

- **目的：** `plan_mineralion_crm_report_2026_09_4chat.md`（MINERALion版の実行計画書）を作ること。**本番の4チャット（BQ→handoff→HTML）はまだ始めない。**
- **理由：** C+Ceraでは計画書で確定方針を先に決めたことで、チャット3・4が迷わず進んだ。一方、有償注文条件・`source_name`訂正などはチャット1・2で初めて見つかった。MINERALionは母集団（トライアル品・無償同梱）の定義が複雑なため、**BQで実データを見て判断してから**計画書を確定する。
- **前提：** このチャットは**BigQuery接続あり**（Google Cloud BigQuery MCPコネクタ）。読み取りのみ（SELECT）・`dryRun`でスキャン量確認・実行プロジェクト`spic-com-2025-apr-00`。

# 1. 事前作業（西守さん）

新チャットを始める前に、**前チャットでダウンロードしたナレッジ7ファイルをプロジェクトへ上書き登録**する（未登録だと新チャットが古いMEMORY.mdを見て㉛〜㉞・4-15章・8-18章を参照できない）。

- `MEMORY.md`／`reference_memory_history_archive.md`
- `reference_brand_crm_report_3chat_workflow.md`（4チャット構成の節）
- `reference_brand_crm_report_workflow.md`（4-15章新設）
- `reference_brand_crm_report_values.md`（8-18章新設）
- `reference_brand_crm_report_pitfalls.md`（㉛〜㉞新設・㉚追記）
- `reference_customer_analysis_queries.md`（10-6新設）

# 2. 新チャットにアップロードするファイル

| ファイル | 用途 |
|---|---|
| `mineralion_crm_brand_report_2026_08.html` | 前月版。**形式（旧形式かタブ分割済みか）の確認**と前月掲載値の再現チェック |
| `plan_ccera_crm_report_2026_09_4chat.md` | 計画書の雛形（章構成・確定方針の表・完了条件の型） |
| `handoff_tab1_ccera_2026_09.md`／`handoff_tab2_ccera_2026_09.md` | handoff（データ一式型）の構造の参考。数値は使わない |
| `skinbeauty_crm_brand_report_2026_09.html` | 基準形式（2タブ・canvas27）の確認 |
| （任意）`ccera_crm_brand_report_2026_09.html` | 「参考にしたい完成形」。SKINBEAUTY版との差分が見える |

# 3. 新チャットの冒頭プロンプト（コピー用）

```
優秀なマーケター、データ分析のプロとして振る舞ってください。
BigQueryへの接続はGoogle Cloud BigQuery MCPコネクタを使ってください。

MINERALionのCRMブランドレポート2026年9月版の「実行計画書」
（plan_mineralion_crm_report_2026_09_4chat.md）を作成します。
HTMLは作りません。本番の4チャット（BQ→handoff→HTML）は始めません。
C+Cera版（plan_ccera_crm_report_2026_09_4chat.md）を雛形にします。

【アップロード】
mineralion_crm_brand_report_2026_08.html、plan_ccera_crm_report_2026_09_4chat.md、
handoff_tab1_ccera_2026_09.md、handoff_tab2_ccera_2026_09.md、
skinbeauty_crm_brand_report_2026_09.html

【最初に読む】
MEMORY.md → reference_brand_crm_report_3chat_workflow.md（4チャット構成の節）、
reference_brand_crm_report_workflow.md（3・3-1・4-14・4-15・8章）、
reference_brand_crm_report_pitfalls.md（㉓・㉖・㉘・㉚〜㉞）、
reference_brand_crm_report_values.md（8-3・8-17・8-18・9章）、
reference_customer_analysis_queries.md（10章・10-6）、
reference_definition_changelog.md（v10：ltv_mineralion・トライアル定義）、
reference_campaign_history.md（MINERALion施策①②・2606）、
reference_subscription_history.md

【やること】
1. 8月版の形式を確認する（旧形式かタブ分割済みか／canvas数／章構成）。
   旧形式なら「初回移行＋9月更新」、タブ分割済みなら通常の月次更新として計画する
2. 引き継ぎ書「5. MINERALion固有の確定論点」をBQ（SELECTのみ）で実データ確認し、
   確定方針の表を作る（判断が要るものは選択肢と推奨を示して西守さんに確認）
3. 8月版の掲載値を同一クエリ・同一基準日（2026-08-31）で再計算し、再現性を確認する
   （再現できない章は計画書の「訂正が必要な章」に記録）
4. 引き継ぎ書「4. 持ち越し未決事項」を決める
5. C+Cera計画書の構成（0〜9章）で plan_mineralion_crm_report_2026_09_4chat.md を作成し、
   ダウンロード提示する

【やらないこと】HTML生成／本番チャット（handoff作成）の実行。
計画書の完了条件（本書6章）を満たしたらmdを提示して止まる。
```

# 4. C+Cera版から持ち越す未決事項（計画書の確定方針にする）

| # | 論点 | 現状・推奨 |
|---|---|---|
| 1 | **有償注文条件（`total_price − current_total_tax > 0`）の統一** | C+Ceraは全章統一で承認済み（pitfalls㉛）。MINERALionにも付ける場合、既存掲載値が数人動く。**推奨：統一する**（章間M0ずれを防ぐ）。付ける前に「純額¥0で有償SKUを含む注文」の有無をBQで確認し、件数を計画書に記録 |
| 2 | **7-3・9-3の純粋新規定義切替** | MINERALionは未対応（pitfalls㉖・㉚）。`SPLIT`の「含む」判定へ切替し、過去月も出し直し、旧定義値（8月版）との差を訂正注記の材料にする。確定方針#6（C+Cera）と同じ扱いでよいか確認 |
| 3 | **旧`source_name`判定値の訂正** | C+Cera 8月版は4章・4-3・9-2・9-5・9-6が旧判定のままだった（㉞）。MINERALion 8月版にも残っている可能性があるため、**8月版掲載の全章を`product_type`判定で再計算して確認** |
| 4 | **他ブランド値の標準値とのずれ** | VC（2026年初回購入者7,508人 vs 標準7,450人・9月アイテム新規660 vs 651）は原因未特定（有償条件を足したのに増加）。MINERALion版の横断表（4-3・9-5・9-6・9-3・7章）は**C+Cera版で取得済みの同一クエリ値（`handoff_tab1_ccera_2026_09.md`・values.md 8-18章）を転記するか、再取得するか**を決める。推奨：5ブランド横断値はC+Cera版の2026-10-02取得値を使い、MINERALion自身の行のみ新規取得（出典・取得日を注記） |
| 5 | **`sn_subscription_history_raw.customer_id`の形式** | 同日中にハッシュ→平文へ変化（㉚）。計画書に「当日の形式をREGEXPで確認して結合方式を決める」手順を入れる |
| 6 | **ブランド固有ラベル・施策の再検証** | C+Ceraでは施策定義（CTW/CTC）を再検証できなかった。MINERALionの施策①②・2606は`reference_campaign_history.md`の定義を計画書で確認し、**再検証するか否か**を決める |

# 5. MINERALion固有の確定論点（BQで実データ確認 → 計画書の確定方針へ）

ナレッジ（values.md 8-3・changelog v10・campaign_history）で既知の事実：定期便開始は**2026-03-05**（西守さん提供・確定）／**`has_mineralion=1`にはトライアル品（SKU 3016）のみの受取者が含まれる**ため実購入者は`ltv_mineralion>0`で絞る（8月版時点：実購入者468人＝純粋新規、既存クロス2,168人）／施策①＝4包無償同梱（SKU 3021・item_price=¥0）／施策②＝4包¥220試供品／2606＝4包トライアル。以下は**未確認のため、BQで確認して確定する**。

| # | 論点 | 確認内容・決める事 |
|---|---|---|
| 1 | **アイテム新規・純粋新規の母集団** | `item_price>0`で¥0の無償同梱（3021等）は外れるが、**¥220トライアル（施策②・2606）をアイテム新規に数えるか**を決める。5章M0・3-1章の新規比率・4章の初回定期選択率に直結。C+Cera計画書の確定方針#0〜#7に相当する表を作る。月別に「¥220のみ初回」の人数を実測して影響度を示す |
| 2 | **5-1章（初回購入商品別F2）の対象SKU** | MINERALionの本品SKU（都度・定期）を`shopify_sku_brand_master`で特定し、C+Ceraの105-set/106-set＋106-preに相当する表①②③を定義。**トライアル品（3016・¥220品）を5-1に含めるか、別表にするか／対象外か**を決める。無視するSKUの一覧も確定 |
| 3 | **8章（施策効果比較）** | 「MINERALion施策（①②・2606） vs 他ブランド」へ書き換え。`reference_campaign_history.md`の識別方法（SKU・クーポン・タグ）と観測窓を確認。施策①の参加者19,764人・F2 3.8%（180日・確定）、②2,958人・10.9%、2606は2,266人・6.84%（14日）の値は転記か再計算かを決める |
| 4 | **ブランド固有条件** | NE出荷の`goods_tag`・`shop_id`（`reference_ne_goods_id_master.md`で確認。C+Ceraのshop_id=17は流用しない）、税率（食品÷1.08の想定を確認）、除外SKUの有無・CYS0810の該当有無、無償SKU（3016・3021等）が`item_price>0`で自動除外されるか（C+Ceraは`3014-set`・`1001055`が自動除外だった） |
| 5 | **ブランド色・ラベル** | MINERALion `#1E3A8A`。tab2・tab1のCSS（`--accent`・ブランド別変数）を揃える（mergeはCSSをtab1側から取る）。C+Ceraのアクセント`#DB2777`は他ブランドとして残す |
| 6 | **tab2の★施策ラベル** | 2026-0X月のコホートに付ける施策ラベル（例：2606→「★2606トライアル」）と、定期便開始前の月（〜2026-02）の扱い（C+Ceraの「★事前予約」に相当するイレギュラー月の有無） |
| 7 | **「定期便開始前後」の解釈** | 8月版で検証済みの仮説（開始前平均M+1 25.2%→開始後28.8%）を、5章M+Nの注記・考察に引き続き使うか |

# 6. 計画書の完了条件（C+Cera計画書7章を踏襲＋追加）

- [ ] 8月版の形式を確認し、計画書0章に記載（旧形式なら「初回移行＋9月更新」、タブ分割済みなら通常更新）
- [ ] 8月版掲載値を同一クエリ・基準日2026-08-31で再計算し、**再現できた章／できなかった章／`source_name`判定が残っていた章**を一覧化（訂正が必要な章＝計画書の「訂正注記の材料」）
- [ ] 本書4章（持ち越し6件）・5章（固有論点7件）の**確定方針の表**がある（判断が分かれたものは西守さんの承認済みと明記）
- [ ] 章マッピング表（SKINBEAUTY 9月版→MINERALion版・新設章／書き換え章／8月版にある章）
- [ ] 5-1のSKU定義表（対象・無視）
- [ ] 4チャット（または3チャット）の構成・各チャットの入力・出力・完了条件・冒頭プロンプト（C+Cera計画書2・7・9章の型）
- [ ] 完了後のナレッジ更新対象（C+Cera計画書8章の型）
- [ ] 計画書に使ったBQ確認結果（件数・SQLの要点）を付録として添付
- [ ] `plan_mineralion_crm_report_2026_09_4chat.md`をダウンロード提示（HTMLは作らない）

# 7. 注意事項（計画書作成チャットで守ること）

1. **MINERALionの分析は必ず`has_mineralion=1 AND ltv_mineralion>0`**（トライアル受取者を除く。values.md 8-3）。
2. `source_name`による定期/都度判定は禁止（`product_type='定期'`・㉘）。
3. SKINBEAUTY・C+Ceraの条件（SKU 3009、`goods_tag`、shop_id=17、税率）を**無条件コピーしない**。毎回MINERALion用を確認する。
4. 基準日は2026-09-30を想定（8月版再現用に2026-08-31を同時算出）。
5. 計画書・ナレッジ・handoffはダウンロード可能な形で提示。HTML生成物はナレッジに登録しない。
6. 前チャット（C+Cera）で見つかった落とし穴㉛〜㉞をチェックリストとして計画書に組み込む。

# 8. 参考：C+Cera版の実績（難易度の目安）

- 4チャット：チャット1・2＝BQ→handoff（tab2約99KB・tab1約63KB）、チャット3＝tab2 HTML、チャット4＝tab1 HTML＋統合。
- チャット4では、handoffの配列を保持するデータモジュールに`assert`で章間整合（3-1合計＝3章・4-2週次合計＝4章コホート合計等）を入れてからHTML化し、統合後にcanvas・`switchReportTab`・noindex・JS実行・固有語句の全文検索を検証した。
- 統合スクリプトのタイトルは`{BRAND}.upper()`のため、手で修正が必要（例：`CCERA`→`C+Cera`、`MINERALION`→`MINERALion`）。
