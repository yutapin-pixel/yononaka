# 工数管理システム – セットアップ手順

## 個人URL一覧

| 氏名 | URL |
|------|-----|
| 宮下 怜 | `https://yutapin-pixel.github.io/yononaka/timecal/?token=k7x9m2p4q1w3` |
| 坂井 裕美 | `https://yutapin-pixel.github.io/yononaka/timecal/?token=p4r8n1q6w3e5` |
| 伊藤 美彩 | `https://yutapin-pixel.github.io/yononaka/timecal/?token=q6w3y5j1s7r9` |
| 宮城 香帆 | `https://yutapin-pixel.github.io/yononaka/timecal/?token=j1s7t4m9v2y8` |
| 横山 うみ | `https://yutapin-pixel.github.io/yononaka/timecal/?token=m9v2u6b5h4t3` |
| 中村 琴菜 | `https://yutapin-pixel.github.io/yononaka/timecal/?token=b5h4c8k7x9u2` |
| **管理者共通** | `https://yutapin-pixel.github.io/yononaka/timecal/admin.html?token=adm_wx8k3m2p9q1r4` |

---

## Step 1 – BigQuery のセットアップ

### 1-1. GCPプロジェクトIDの確認

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 上部のプロジェクト選択欄に表示されている **プロジェクトID**（例: `my-project-12345`）をメモする
3. このIDを `gas/Code.gs` の `BQ_PROJECT` 定数に設定する

### 1-2. BigQueryデータセット `nishimori` の作成

1. GCPコンソール左メニュー → **BigQuery**
2. 左側のプロジェクト名を右クリック → **データセットを作成**
3. 以下を入力：
   - データセットID: `nishimori`
   - ロケーション: `asia-northeast1`（東京）
   - デフォルト有効期限: なし
4. **データセットを作成** をクリック

---

## Step 2 – Google Apps Script のセットアップ

### 2-1. GASプロジェクト作成

1. [script.google.com](https://script.google.com) を開く（西守さんのGoogleアカウントで）
2. **新しいプロジェクト** をクリック
3. プロジェクト名を `工数管理バックエンド` などに変更

### 2-2. BigQuery Advanced Service を有効化

1. GASエディタ左メニュー → **サービス**（＋マーク）
2. `BigQuery API` を選択 → **追加**
   - バージョン: v2
   - 識別子: `BigQuery`（デフォルトのまま）

### 2-3. コードを貼り付け

1. `gas/Code.gs` の内容をすべてコピー
2. GASエディタのデフォルトコード（`function myFunction() {}`）を全選択して削除
3. コピーしたコードを貼り付け
4. **BQ_PROJECT を実際のGCPプロジェクトIDに変更する**（1-1で確認したID）

### 2-4. テーブル初期化

1. GASエディタ上部の関数選択プルダウンで `initTables` を選択
2. ▶ ボタン（実行）をクリック
3. 初回は権限確認ダイアログが出る → **権限を確認** → アカウントを選択 → **許可**
4. 実行ログに `Tables initialized` が表示されれば成功

### 2-5. ウェブアプリとしてデプロイ

1. 右上 **デプロイ** → **新しいデプロイ**
2. 種類: **ウェブアプリ**（歯車アイコン）
3. 以下を設定：
   - 説明: 工数管理API
   - 次のユーザーとして実行: **自分（西守さんのアカウント）**
   - アクセスできるユーザー: **全員**
4. **デプロイ** をクリック
5. 表示された **ウェブアプリURL** をコピーする（`https://script.google.com/macros/s/...../exec` の形式）

---

## Step 3 – フロントエンドにGAS URLを設定

`timecal/config.js` を開き、1行目の空文字を貼り付けたURLに変更：

```javascript
GAS_URL: 'https://script.google.com/macros/s/ここにIDを貼り付け/exec',
```

---

## Step 4 – GitHub へプッシュ

```
git add timecal/
git commit -m "add: 工数管理システム"
git push origin main
```

GitHub Pages が有効になっていれば、数分後に上記のURLでアクセスできます。

---

## ブランドカラー早見表

| ブランド | カラーコード |
|---------|------------|
| VC/C+D  | #FF7A30（オレンジ）＋ #7ED8A0（ミントグリーン）斜めストライプ |
| C+Cera  | #FF6B9D（ピンク） |
| SkinBeauty | #C4934A（ゴールドブラウン） |
| MINERALion | #1E3A8A（ネイビーブルー） |
| CBD     | #1B7A4A（ダークグリーン） |
| 識別なし | #9CA3AF（グレー） |

---

## 運用メモ

- **確定ボタン**を押した日はその日のデータが固定され変更不可
- 集計は確定済みデータのみ対象（対象外・未入力は除外）
- 管理者URLは3名で使い回し可能（ブックマーク推奨）
- VC/C+D は1ブランドとして集計（枠は斜めストライプで表示）
