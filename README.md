# Repo2Talk - Repository to Slide Generation System

GitHubリポジトリから自動でTED風・IMRAD構成のスライドを生成するシステムです。

## 🚀 機能

- **自動リポジトリ解析**: GitHub APIを使用してコード、依存関係、コミット履歴を自動解析
- **ストーリー生成**: Why/Problem/Approach/Result/Next の構造でプロジェクトの物語を構築
- **スライド自動生成**: TED風とIMRAD構成の2つのモードでプレゼンテーション作成
- **多言語対応**: 日本語、英語、中国語でのスライド生成
- **多形式出力**: HTML、PDF、PPTX、Keynote形式でエクスポート
- **PWA対応**: オフラインでも利用可能なプログレッシブWebアプリ

## 🛠️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - UI開発
- **Vite** - 高速ビルドツール
- **React Router** - ルーティング
- **Reveal.js** - スライドプレゼンテーション

### バックエンド
- **Netlify Functions** - サーバーレス関数
- **GitHub API (Octokit)** - リポジトリ解析
- **Tesseract.js** - OCR機能

### データ・ストレージ
- **IndexedDB** - ローカルデータストレージ
- **Dexie** - IndexedDBラッパー

### 分析・生成
- **Mermaid** - 図表生成
- **jsPDF** - PDF出力
- **PptxGenJS** - PowerPoint出力

## 🎯 使用方法

### 1. 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd repo2talk

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 2. スライド生成の流れ

1. **リポジトリ指定**: GitHub URLを入力またはファイルをアップロード
2. **設定選択**: プレゼンテーションモード（TED風/IMRAD）、時間、言語を選択
3. **自動生成**: AIがリポジトリを解析してスライドを自動生成
4. **プレゼン**: 生成されたスライドで即座にプレゼンテーション可能

## 📁 プロジェクト構造

```
repo2talk/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── HomePage.tsx     # ホームページ
│   │   ├── SlideGenerator.tsx # スライド生成ページ
│   │   └── SlideViewer.tsx  # スライドビューア
│   ├── services/           # ビジネスロジック
│   │   ├── github.ts       # GitHub API連携
│   │   └── storyGenerator.ts # ストーリー生成
│   ├── types/              # 型定義
│   └── utils/              # ユーティリティ関数
├── netlify/functions/      # Netlify Functions
└── public/                 # 静的ファイル
```

## 🎨 スライドテンプレート

### TED風モード
- 一般向けの分かりやすいプレゼンテーション
- ストーリー重視の構成
- 視覚的に魅力的なデザイン

### IMRADモード
- 学術発表向けの構造化されたプレゼンテーション
- Introduction/Methods/Results/And/Discussion の構成
- 厳密で論理的な流れ

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# リント実行
npm run lint

# プレビュー
npm run preview

# Netlify開発環境
npm run netlify:dev
```

## 📊 対応ファイル形式

### 入力
- GitHub リポジトリ URL
- ZIP ファイル
- 個別ファイルアップロード
- 画像・スクリーンショット

### 出力
- HTML（Reveal.js）
- PDF
- PowerPoint（PPTX）
- Keynote（互換）

## 🌍 多言語対応

- **日本語**: デフォルト言語
- **English**: 英語でのスライド生成
- **中文**: 中国語でのスライド生成

## 🎯 ロードマップ

### v1.0 (現在)
- [x] 基本的なリポジトリ解析
- [x] TED風スライド生成
- [x] PDF出力
- [ ] GitHub API完全統合

### v2.0 (予定)
- [ ] IMRADモード実装
- [ ] PowerPoint/Keynote出力
- [ ] OCR機能統合
- [ ] LLM Agent連携

### v3.0 (将来)
- [ ] 音声合成機能
- [ ] 自動翻訳機能
- [ ] ダッシュボード機能

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙋‍♂️ サポート

質問や問題がありましたら、GitHubのIssuesでお知らせください。

---

**Repo2Talk** - あなたのコードから素晴らしいプレゼンテーションを 🚀