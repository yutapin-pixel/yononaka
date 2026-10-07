---
name: C+Cera CRMブランドレポート 2026年9月版 4チャット実行計画
description: C+Cera版ブランドCRMレポートを、SKINBEAUTY 2026年9月版（2タブ・canvas27）の形式で初回移行しつつ2026年9月実績へ更新するための実行計画。確定方針（Q&A 5件＋初回指示）、4チャット構成、章マッピング、handoff仕様、各チャット冒頭プロンプトを収録。
type: plan
created: 2026-10-02
---

# 0. 位置づけ

- 対象：`ccera_crm_brand_report_2026_09.html`（noindex・2タブ構成）
- ベース：`skinbeauty_crm_brand_report_2026_09.html`（2タブ・canvas 27・基準日2026-09-30）
- 前月参考：`ccera_crm_brand_report_2026_08.html`（**旧形式**・canvas 17・タブ切替なし）
- **今回は「SKINBEAUTY形式への初回移行」＋「9月更新」を同時に行う。** C+Cera 8月版に無い章（3-1／5-1〜5-4／7-1）は前月掲載値が存在しないため、**8月分も同一クエリで再計算**する。
- 標準の3チャット構成（`reference_brand_crm_report_3chat_workflow.md`）ではなく、**4チャット構成**とする（SKINBEAUTY版更新でトークン使用量が膨大になったため、BQ処理とHTML生成を分離する）。

# 1. 確定方針

| # | 論点 | 確定内容 |
|---|---|---|
| 0 | 基本方針 | 構造・項目・2タブ構成はすべてSKINBEAUTY 9月版を踏襲。SKINBEAUTYにしかない章（3-1 月次売上内訳＝新規〈純粋新規／アイテム新規〉×既存 など）もC+Ceraで作成する |
| 1 | 7章 横断比較グラフ | **停止率**で統一（SKINBEAUTY準拠。解約率ではない） |
| 2 | チャット分割 | 4チャット（下記2章）。チャット1・2はhandoffのみ、チャット3・4でHTML化 |
| 3 | ブランド固有章（8章・7-4・9-4・9-7） | **SKINBEAUTY 9月版の章をC+Cera用に書き換える。** C+Cera 8月版の固有章（CTW／CTC施策・スイッチ元・近接ブランドとの相互流出入）は参考扱い。SKINBEAUTY固有の表現（「オンライン体験会」「SKINBEAUTY定期ACTIVE顧客は…」等）はC+Cera用に置換し、取り残しがないことを完了条件で確認する |
| 4 | 5-1章 SKU | 下記3章 |
| 5 | handoffの中身 | **データ一式型**：全章の確定数値（表・チャート配列）をhandoffに格納。HTML化チャット（3・4）ではBQを再実行しない |
| 6 | 7-3・9-3章の純粋新規定義 | `SPLIT`の「含む」判定（pitfalls㉖・㉚）へ切替。**過去月も同定義で出し直し**、8月版掲載値から変わる箇所には訂正注記を入れる |
| 7 | その他の共通ルール | 基準日＝**2026-09-30**／全章同一基準日／LTV確定判定は「コホート月末日＋期間日数 ≦ 基準日」（未確定セルは「—」）／`source_name`による定期・都度判定は禁止（`shopify_sku_brand_master.product_type='定期'`）／前月比は**同一クエリで再計算した8月値**との差で書く |

# 2. 4チャット構成

| チャット | 作るもの | 入力 | 出力 | HTML |
|---|---|---|---|---|
| **1** | tab2（5章一式）のBQ実行 → handoff | SKINBEAUTY 9月版（章構成の確認用）・ナレッジ | `handoff_tab2_ccera_2026_09.md` | **作らない** |
| **2** | tab1（1〜4-3章＋6章以降）のBQ実行 → handoff | チャット1のhandoff・SKINBEAUTY 9月版 | `handoff_tab1_ccera_2026_09.md` | **作らない** |
| **3** | tab2 HTML生成 | SKINBEAUTY 9月版をsplitした`part_tab2`・handoff_tab2 | `part_tab2_ccera_2026_09.html` | tab2のみ（BQなし） |
| **4** | tab1 HTML生成＋統合 | SKINBEAUTY 9月版をsplitした`part_tab1`・handoff_tab1・handoff_tab2・`part_tab2_ccera_2026_09.html` | `ccera_crm_brand_report_2026_09.html` | tab1＋統合（BQなし） |

**順序の理由：** tab1の総論章（2・6・10・11・12）はtab2で判明した事実を引用するため、tab2を先行（標準3チャットと同じ依存方向）。tab2で見つかった事実がtab1側の解釈に影響する場合は、チャット2からチャット1へ戻す（5チャット目の追加を許容）。

# 3. 5-1章（初回購入商品別 F2転換率）のC+Cera定義

SKINBEAUTYの「SKU 120（7 PURE DROPS KIT／7包）」「SKU 121（ファースト グロウエッセンス／28包）」に相当するC+CeraのSKUは下記。

| 表 | 対象（初回購入） | SKU |
|---|---|---|
| ① 合算：アイテム新規 vs 純粋新規 | 下記2SKUのいずれかを初回購入 | `105-set`（7包・都度・¥3,700）＋`106-set`（28包・都度・¥13,460）＋**`106-pre`（先行予約特典付き28包・都度・¥13,460）** |
| ② 105-setのみ | 7包 | `105-set` |
| ③ 106-setのみ | 28包 | `106-set`＋`106-pre`（合算） |

- **`106-pre`は`106-set`と同列に合算する**（購入可能月が決まっているため購入月で識別できる）。2026-01〜02の行には「★事前予約含む」を付し、ヒートマップ凡例にも事前予約期間を入れる（SKINBEAUTY 5-1と同形式）。
- **無視するSKU：** `106-set-2`、`106-set-3`、`106-pre-2`、`106-pre-3`、`106-teiki`系（`106-teiki`／`-2`／`-3`／`-4`）。
- 「初回注文が定期SKUのみ」の顧客は対象外／対象SKUと定期SKUの同時購入は含める／対象SKU同士（105-set＋106-set）の同時購入は合算表のみ（SKU別内訳表からは除外）／F2は都度・定期いずれの2回目注文でも可／観測未到達セルは「—」（SKINBEAUTY 5-1の注記に準拠）。
- 5-1以外のコホート章（5・5-2・5-3・5-3-2・5-3-3・5-4）はSKINBEAUTY準拠のまま、ブランドを`C+Cera`に差し替える。

# 4. 章マッピング（SKINBEAUTY 9月版 → C+Cera）

| 章 | tab | C+Cera版での扱い |
|---|---|---|
| 1 現在地サマリー／2 総評 | 1 | C+Cera 9月実績で全面書き下ろし |
| 3 月次成長トレンド（NE出荷×定期ACTIVE） | 1 | 8月版にあり。直下の実額表を追加（SKINBEAUTY 9月版の形式） |
| **3-1 月次売上内訳（純粋新規／アイテム新規／既存）** | 1 | **新設**（8月版に無し）。判定は4-14章ロジック |
| 3-2 週次売上推移 | 1 | 8月版にあり |
| 4 新規獲得の質／4-2／4-3 | 1 | 8月版にあり。SKINBEAUTY 9月版の形式へ |
| 6 LTV成長カーブ | 1 | 8月版にあり |
| 7 定期便健全性（**停止率**） | 1 | 停止率に統一 |
| **7-1 定期コース別ACTIVE構成** | 1 | **新設**（8月版に無し） |
| 7-2 グロスフロー／7-3 解約・休止の継続回数分布／7-4 併用 | 1 | 7-3は**修正済み純粋新規定義**。7-4は「C+Cera定期ACTIVE顧客は他に何を定期購入しているか」へ書き換え。7-2は二重計上防止注記を維持 |
| 8 施策効果比較 | 1 | 「SKINBEAUTYオンライン体験会 vs 他ブランド」→「C+Cera施策 vs 他ブランド」へ書き換え（C+Cera 8月版のCTW／CTC施策を参考にする） |
| 9 都度 vs 定期／9-2 | 1 | 8月版にあり |
| 9-3 純粋新規の難易度 | 1 | **修正済み定義へ切替・過去月出し直し・訂正注記** |
| 9-4 | 1 | 「クロスセル元」→「スイッチ元」の視点でC+Cera用に書き換え |
| 9-5／9-6 | 1 | 8月版にあり |
| 9-7 | 1 | 「VC/C+D離脱者の受け皿としてのC+Cera」へ書き換え |
| 10 ポジショニング／11 課題／12 次月指標 | 1 | tab2のhandoffを**統合**して書き下ろし（転記しない） |
| 13 データソース・集計方法 | 1 | C+Cera用に更新 |
| 5／5-1／5-2／5-3／5-3-2／5-3-3／5-4 | **2** | **新設**（8月版は5章ヒートマップ1本のみ）。5-1は上記3章の定義 |

# 5. C+Cera固有の注意点（ナレッジより）

1. **`goods_tag`は全角プラス `[Lypo-C C＋Cera]`**（C+Dは半角。混同するとゼロ件）。
2. **税率：C+Ceraは食品（8%）。** SKINBEAUTY（化粧品）の10%をそのまま流用しない（NE出荷売上は税抜）。
3. SKINBEAUTY版の除外条件（SKU 3009・CYS0810 等）は**C+Cera版に同じものが該当するか必ず確認**してから流用する（無条件コピー禁止）。NE出荷の`shop_id`（SKINBEAUTYは17）もC+Cera用を`reference_ne_goods_id_master.md`等で確認する。
4. 定期ACTIVE集計は`subscription_history_view`のフラグ集計（`COUNTIF(has_ccera=1)`等）。VC+C+Dの混在契約があるため`GROUP BY brand`は使わない。`sn_subscription_history_raw.customer_id`は**SHA256ハッシュ**のため、マスター側を再ハッシュして結合（pitfalls㉚）。
5. `shopify_customer_master`の`first_paid_order_dt`は使わない。純粋新規・新規カウントは`shopify_orders`から`MIN(created_at)`で算出（workflow 4-2章）。アイテム新規は`customer_id × brand`の初回購入日CTE。
6. 8月版（旧形式）の掲載値は同一クエリで再現できない可能性がある。**必ず前月値を同一クエリ・同一基準日で再計算**して前月比を書く（SKINBEAUTY版で差異が複数見つかった）。
7. BQ実行プロジェクトは`spic-com-2025-apr-00`、実行前に`dryRun`でスキャン量確認。本番は`spic-core.public`（読み取り専用）。
8. ブランドカラー：C+Cera `#DB2777`。
9. 生成HTMLには`<meta name="robots" content="noindex, nofollow">`を**必ず**付与。
10. KPIには**データソースを必ず明示**（NE出荷／Shopify受注／Shopify定期DB 等）。

# 6. handoff仕様（データ一式型）

両handoff共通の構成：

1. **ヘッダ：** 基準日（2026-09-30）、データ反映状況（`MAX(snapshot_ym)`、`MAX(first_paid_order_dt)`等の確認結果）、使用テーブル、除外条件、前月値の再現チェック結果
2. **主要トピックス（総論用）：** 新規発見・前月からの変化・tab1／tab2へ反映すべき示唆
3. **章別データ：** 章番号ごとに、表（コホート行×列、確定は数値、未確定は「—」）とチャート用配列（ラベル順を明記）を**そのままHTMLに入れられる形**で。月ラベルは文字列で出力する（無引用の`2025-10`はJSで引き算される）
4. **考察文の材料：** 章ごとの数値根拠付きの要点（文章は後続チャットで書く）
5. **検証結果：** 3-1の3区分合計＝3章月次売上、定期ACTIVE件数の一致、tab2の母数（コホート人数）とtab1の母数の一致 等
6. **未解決・要確認事項**

分量が大きい場合は`handoff_tab2_ccera_2026_09.md`を複数ファイル（`_part1`、`_part2`…）に分割してよい。**数値の省略は不可。**

# 7. 各チャットの完了条件

**チャット1（tab2 handoff）**
- [ ] 5・5-1（①②③）・5-2・5-3・5-3-2・5-3-3・5-4の全章を**同一基準日2026-09-30**で取得
- [ ] 前月（8月）確定セルを同一クエリで再計算し機械比較（`reference_customer_analysis_queries.md`10-5）
- [ ] 5-1の対象SKU・除外SKUが本書3章のとおり
- [ ] `handoff_tab2_ccera_2026_09.md`をダウンロード提示（HTMLは作らない）

**チャット2（tab1 handoff）**
- [ ] 3-1／7-1／7-2／7-3／9-3等の新設・定義変更章を含め、tab1全章を取得
- [ ] 4章の母数がhandoff_tab2と一致
- [ ] 7-3・9-3は修正済み定義で過去月も出し直し、8月版との差分を訂正注記の材料として記録
- [ ] `handoff_tab1_ccera_2026_09.md`をダウンロード提示（HTMLは作らない）

**チャット3（tab2 HTML）**
- [ ] `brand_report_split.py`でSKINBEAUTY 9月版を分解し`part_tab2`を取得、C+Cera用に置換
- [ ] canvas数＝SKINBEAUTY tab2と同数（9本）・テーブルIDが一致
- [ ] SKINBEAUTY固有の語句が残っていない（「SKINBEAUTY」「オンライン体験会」「SKU 120/121」等を検索して確認）
- [ ] noindex維持／`part_tab2_ccera_2026_09.html`をダウンロード提示

**チャット4（tab1 HTML＋統合）**
- [ ] `part_tab1`をC+Cera用に置換（handoffの数値のみ使用。BQ再実行なし）
- [ ] 総論章（2・6・10・11・12）はhandoffを**統合**して書く（転記しない）
- [ ] `brand_report_merge.py ccera 2026_09`で統合、canvas合計27・`switchReportTab`定義が1箇所・noindexを確認
- [ ] SKINBEAUTY固有語句の取り残しがない
- [ ] `ccera_crm_brand_report_2026_09.html`をダウンロード提示
- [ ] ナレッジ更新ファイル（下記8章）をダウンロード提示

# 8. 完了後のナレッジ更新（チャット4で実施・ダウンロード形式で提示）

- `reference_brand_crm_report_3chat_workflow.md`：4チャット構成（BQ/handoff分離型）を追記
- `reference_brand_crm_report_workflow.md`：C+Cera版の5-1 SKU定義（105-set／106-set＋106-pre）
- `reference_brand_crm_report_values.md`：C+Cera 9月版ログ（新章の確定値・定義変更・訂正）
- `reference_brand_crm_report_pitfalls.md`：新たな落とし穴があれば追記
- `MEMORY.md`：履歴追記（直近5件ルール適用・古い1件を`reference_memory_history_archive.md`へ退避）

# 9. 各チャットの冒頭プロンプト（コピー用）

## チャット1

```
優秀なマーケター、データ分析のプロとして振る舞ってください。
BigQueryへの接続はGoogle Cloud BigQuery MCPコネクタを使ってください。

C+CeraのCRMブランドレポート2026年9月版のうち、tab2（コホートチャート）の
handoffドキュメントのみを作成します。HTMLは作りません。

【アップロード】plan_ccera_crm_report_2026_09_4chat.md、skinbeauty_crm_brand_report_2026_09.html
【最初に読む】MEMORY.md → reference_brand_crm_report_3chat_workflow.md、
reference_brand_crm_tab2_handoff_template.md、reference_customer_analysis_queries.md（3・8・9・10章）、
reference_brand_crm_report_pitfalls.md、reference_subscription_history.md

【やること】
1. 計画書の1〜7章を読み、SKINBEAUTY 9月版の5章一式（5・5-1・5-2・5-3・5-3-2・5-3-3・5-4）の
   構成・定義を確認する
2. 基準日2026-09-30で、C+Ceraの全章を同一基準日でBQ実行（5-1は計画書3章の定義）
3. 前月（8月）確定セルを同一クエリで再計算し、機械比較する
4. 計画書6章の仕様で handoff_tab2_ccera_2026_09.md を作成（全確定数値を格納）

【やらないこと】HTML生成／tab1のBQ実行。完了条件（計画書7章）を満たしたらmdを提示して止まる。
HTML生成物ではないナレッジ・handoffはダウンロード可能な形で提示。
```

## チャット2

```
（共通の役割・BQ接続の記述はチャット1と同じ）

C+CeraのCRMブランドレポート2026年9月版のうち、tab1（基本レポート）の
handoffドキュメントのみを作成します。HTMLは作りません。

【アップロード】plan_ccera_crm_report_2026_09_4chat.md、handoff_tab2_ccera_2026_09.md、
skinbeauty_crm_brand_report_2026_09.html、ccera_crm_brand_report_2026_08.html
【最初に読む】MEMORY.md → reference_brand_crm_report_workflow.md（3・4章）、
reference_brand_crm_report_pitfalls.md、reference_brand_crm_report_values.md（8-17・9章）、
reference_brand_crm_report_3chat_workflow.md（懸念点⑥⑦）

【やること】
1. handoff_tab2の基準日・定義・母数を確認（基準日はそのまま使う）
2. tab1全章（1〜4-3・6〜13章。3-1・7-1新設、7-3・9-3は修正済み純粋新規定義）を
   同一基準日でBQ実行。前月掲載値は同一クエリで再計算する
3. 計画書6章の仕様で handoff_tab1_ccera_2026_09.md を作成（全確定数値を格納）

【やらないこと】HTML生成。完了条件（計画書7章）を満たしたらmdを提示して止まる。
```

## チャット3

```
優秀なマーケター、データ分析のプロとして振る舞ってください。（BQ接続は不要）

【アップロード】plan_ccera_crm_report_2026_09_4chat.md、handoff_tab2_ccera_2026_09.md、
skinbeauty_crm_brand_report_2026_09.html
【やること】
1. brand_report_split.py でSKINBEAUTY 9月版を分解し part_tab2 を得る
2. handoff_tab2の数値のみを使い、C+Cera用の part_tab2_ccera_2026_09.html を作成
   （BQは再実行しない。noindex維持・canvas数・テーブルID一致・SKINBEAUTY固有語句の取り残しなし）
3. present_files でダウンロード提示
```

## チャット4

```
（チャット3と同じ役割）

【アップロード】plan_ccera_crm_report_2026_09_4chat.md、handoff_tab1_ccera_2026_09.md、
handoff_tab2_ccera_2026_09.md、part_tab2_ccera_2026_09.html、skinbeauty_crm_brand_report_2026_09.html
【やること】
1. SKINBEAUTY 9月版を分解して part_tab1 を得て、handoff_tab1の数値のみでC+Cera用に更新
   （総論章2・6・10・11・12はhandoffを統合して書く。BQは再実行しない）
2. brand_report_merge.py ccera 2026_09 で統合し、完了条件（計画書7章）を検証
3. ccera_crm_brand_report_2026_09.html と、ナレッジ更新ファイル（計画書8章）をダウンロード提示
```
