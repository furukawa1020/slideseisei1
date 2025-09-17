import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Repo2Talk
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            GitHubリポジトリから自動でTED風・IMRAD構成のスライドを生成
            <br />
            コードから物語へ、あなたのアイデアを素早く伝えましょう
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/generate" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              今すぐ始める
            </Link>
            <a 
              href="#features" 
              className="btn btn-secondary text-lg px-8 py-3"
            >
              機能を見る
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">自動解析</h3>
            <p className="text-gray-600">
              リポジトリの構造、言語、依存関係、コミット履歴を自動で解析し、
              プロジェクトの全体像を把握します
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">📖</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">ストーリー生成</h3>
            <p className="text-gray-600">
              Why/Problem/Approach/Result/Next の構造で、
              技術的な実装を分かりやすい物語に変換します
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">スライド自動生成</h3>
            <p className="text-gray-600">
              TED風・IMRAD構成で美しいスライドを自動生成。
              PDF、PPTX、Keynote形式で出力可能です
            </p>
          </div>
        </div>

        {/* Process Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">使い方は簡単3ステップ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">リポジトリを指定</h3>
              <p className="text-gray-600">GitHub URLを入力するか、ファイルをアップロード</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">自動解析・生成</h3>
              <p className="text-gray-600">AIがコードを解析してストーリーを構築</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">スライド完成</h3>
              <p className="text-gray-600">即座にプレゼン可能な美しいスライドが完成</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              今すぐRepo2Talkを体験しよう
            </h3>
            <p className="text-gray-600 mb-6">
              あなたのコードが持つ物語を発見し、
              効果的なプレゼンテーションを作成しましょう
            </p>
            <Link 
              to="/generate" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              スライド生成を開始
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}