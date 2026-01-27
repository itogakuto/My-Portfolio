# Testing Plan (Portfolio Site)

手動テストを下記手順で行った。

目的: 現在のポートフォリオサイトに対して、回帰防止と主要導線の品質担保を行うためのテスト戦略を整理する。

## 対象範囲
- 画面: Home, Topics, Topic Detail, Experiences, Admin
- ルーティング: HashRouter の主要パス
- 外部連携: Supabase, EmailJS

## テスト種別と役割

### 1) Unit / Component (Vitest + React Testing Library)
目的: ロジック単位・コンポーネント単位の安定性確認

主なチェック項目:
- `resolveImageUrl` の入力パターン
  - 空文字/undefined -> フォールバック
  - http/https -> そのまま利用
  - 相対パス -> Supabase URL を構築
- `TopicCard` の表示
  - タイトル、カテゴリ、タグ、日付の表示
  - Link の URL が `/topics/:slug` であること
- `RadarChart`
  - skills が空配列でもクラッシュしない
- ルート単位の表示
  - `/`, `/topics`, `/topics/:slug`, `/experiences`, `/admin`

注意点:
- `window.scrollTo` をモック
- `requestAnimationFrame` / `cancelAnimationFrame` が絡む場合は fake timers を使う
- EmailJS, Supabase は全てモック

### 2) Integration (Data + UI)
目的: API 結果が UI に正しく反映されるかを検証

主なチェック項目:
- TopicsList
  - 取得成功 -> 一覧が表示される
  - 取得失敗 -> エラーメッセージ表示
  - 0 件 -> 空状態 UI
- TopicDetail
  - slug が存在する -> 正常表示
  - slug 不正/取得失敗 -> 404 相当の表示
- Home Contact
  - 送信中 UI -> 成功 UI -> リセットボタン
  - 送信失敗 UI

### 3) E2E (Playwright)
目的: ユーザー視点の主要導線の確認

主なチェック項目:
- Home -> Topics -> Detail の遷移
- Contact フォームの必須バリデーションと送信成功表示
- 画像読み込み失敗時のフォールバック確認 (必要ならリクエストを失敗させる)

## カバレッジ基準 (目安)
- 重要導線 (Home -> Topics -> Detail -> Contact) は必ず E2E で担保
- 外部 API 依存部分は Integration で担保
- ヘルパー関数や UI の崩れやすい箇所は Unit で担保

## 実装時のテスト配置ルール (推奨)
- Unit/Component: `src/**/__tests__/*.test.tsx` or `*.test.ts`
- Integration: `src/**/__tests__/*.int.test.tsx`
- E2E: `e2e/*.spec.ts`

## モック方針
- Supabase: fetch レイヤー or client をモックし、成功/失敗/空配列を切り替える
- EmailJS: `sendForm` をモック (成功/失敗)
- 画像: `onError` を使う UI はテスト内で `fireEvent.error(img)`

## 非機能テストの最低ライン
- Lighthouse: Performance/Accessibility で 80 以上を目標
- レスポンシブ: iPhone/desktop の2サイズで主要導線確認

## 運用ルール (提案)
- PR に 1 つ以上の自動テストを追加 (修正箇所に応じて)
- 変更箇所が UI の場合は最低 1 つの integration か E2E を追加

