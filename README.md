# ⚔️ HabitQuest

**HabitQuest** は、日々の習慣やタスクをゲームのように楽しむための「ゲーミフィケーション型」タスク管理・習慣トラッカーです。
タスクをクリアしてレベルを上げ、最強の自分を目指しましょう！

![HabitQuest Icon](public/pwa-192x192.png)

## 🌟 主な機能

- **🎮 ゲーミフィケーション**: タスク完了でXP（経験値）を獲得。レベルアップやHP管理でモチベーションを維持。
- **📌 タスク・日課管理**: 定期的なルーチンから単発のタスクまでスマートに管理。
- **🔄 習慣トラッキング**: 良い習慣を積み重ね、悪い習慣を断ち切るためのカウンター機能。
- **⏱️ ポモドーロタイマー**: 集中時間を記録し、自動的に勉強時間として統計に反映。
- **📔 ジャーナル & 📝 メモ**: 日記やクイックなメモをカテゴリー別に整理。
- **📉 統計分析**: 学習時間やタスク完了率をチャートで可視化。
- **🌐 クラウド同期**: Firebase を使用し、PCとスマホでデータを自動同期。
- **📱 PWA 対応**: スマホのホーム画面に追加して、ネイティブアプリのように利用可能。
- **📤 情報共有**: メモや統計情報をSNSや他のアプリへ簡単に共有。

## 🛠 テクノロジースタック

- **Frontend**: React (v19), Vite
- **Styling**: Vanilla CSS (Modern CSS Transitions/Variables)
- **Database/Auth**: Firebase (Firestore, Google Authentication)
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons/Date**: Date-fns, Lucide-like Emoji style
- **PWA**: vite-plugin-pwa

## 🚀 はじめかた

### 開発環境のセットアップ

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/tir0318/HabitQuest.git
   ```
2. 依存関係をインストール:
   ```bash
   npm install
   ```
3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

### ビルドと公開

1. プロジェクトをビルド:
   ```bash
   npm run build
   ```
2. `dist` フォルダ内のファイルを Firebase Hosting や Netlify にデプロイしてください。

## 📱 モバイルでの利用

HabitQuest は PWA に対応しています。
1. スマホのブラウザで公開したURLを開く。
2. 「ホーム画面に追加」を選択することで、アイコンが作成されアプリとして利用できます。

---

Developed with ❤️ for better habits.
