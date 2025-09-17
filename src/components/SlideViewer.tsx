import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { EnhancedEngagingSlideElements } from './EnhancedEngagingSlideElements'
import { PresentationScriptViewer } from './PresentationScriptViewer'
import { StorySection } from '../types'
import { scriptGenerator } from '../services/scriptGenerator'
import { detectProjectTheme, projectThemes } from '../services/visualDesignSystem'

interface StoryData {
  why: StorySection
  approach: StorySection
  result: StorySection
  next: StorySection
}

export function SlideViewer() {
  const { id } = useParams<{ id: string }>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [story, setStory] = useState<StoryData | null>(null)
  const [presentationScript, setPresentationScript] = useState<any>(null)
  const [showScript, setShowScript] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('technical')

  useEffect(() => {
    // TODO: Fetch slide data by ID from storage
    console.log('Slide ID:', id)
    
    // Mock data for development with enhanced content
    if (id) {
      const mockRepoData = {
        name: 'notenkyo',
        description: '学習支援プラットフォーム',
        projectPurpose: {
          primaryPurpose: '包括的な学習体験の提供',
          problemSolved: '従来の学習方法では個人の学習スタイルに対応できていない',
          targetAudience: 'ニューロダイバーシティを持つ学習者',
          businessValue: '個別最適化された学習環境の実現',
          technicalEvidence: ['TypeScript実装', 'React + Vite構成', 'PWA対応'],
          marketContext: 'インクルーシブ教育への社会的要求の高まり',
          futureVision: '全学習者のニューロダイバーシティに配慮した包括的学習プラットフォームの実現',
          roadmap: [
            'プロトタイプ開発と基本機能実装',
            'ユーザビリティテストと改善',
            'AI機能統合と個別化学習',
            'グローバル展開と多言語対応',
            '包括的プラットフォーム完成'
          ],
          engagingQuestions: [
            'あなたは学習中にどんな困難を感じたことがありますか？',
            'なぜ一人ひとり違う学習方法が必要なのでしょうか？',
            'この取り組みで、どのような変化が期待できるでしょうか？'
          ],
          visualizationSuggestions: [
            'ユーザージャーニーマップ',
            '学習効果の比較グラフ',
            'アクセシビリティ機能の実例',
            'グローバル展開予定地図'
          ]
        },
        languages: { TypeScript: 70, CSS: 20, HTML: 10 },
        files: [],
        dependencies: [],
        commits: [],
        stars: 42,
        forks: 8,
        readme: '',
        screenshots: [],
        createdAt: '',
        updatedAt: '',
        url: ''
      }

      const mockStory: StoryData = {
        why: {
          title: '🎯 なぜこのプロジェクトが生まれたのか',
          content: `**あなたは学習中にどんな困難を感じたことがありますか？**

**市場の課題認識**
従来の学習方法では個人の学習スタイルに対応できていない

**対象ユーザーのニーズ**
ニューロダイバーシティを持つ学習者に向けて、従来のソリューションでは解決できない課題に取り組みました。

**提供価値の明確化**
個別最適化された学習環境の実現

**市場背景**
インクルーシブ教育への社会的要求の高まりという時代背景の中で、このプロジェクトの必要性が高まりました。

**技術的根拠**
• TypeScript実装
• React + Vite構成
• PWA対応`,
          bullets: ['ユーザー中心設計', 'アクセシビリティ重視', 'データ駆動型改善'],
          visualElements: [
            { type: 'engaging-question', data: 'あなたは学習中にどんな困難を感じたことがありますか？' },
            { type: 'problem-solution', data: '従来の学習方法では個人の学習スタイルに対応できていない' },
            { type: 'target-audience', data: 'ニューロダイバーシティを持つ学習者' },
            { type: 'market-context', data: 'インクルーシブ教育への社会的要求の高まり' },
            { type: 'visualization-suggestions', data: mockRepoData.projectPurpose.visualizationSuggestions }
          ]
        },
        approach: {
          title: '🛠️ どのようにアプローチしたか',
          content: `**なぜ一人ひとり違う学習方法が必要なのでしょうか？**

**技術選択の戦略**
TypeScriptをベースとして、React、Viteなどのフレームワークを活用し、TailwindCSSといったツールを組み合わせて開発を進めました。`,
          bullets: [
            '主要技術: TypeScript',
            'フレームワーク: React',
            'ツール: Vite',
            'ツール: TailwindCSS'
          ],
          visualElements: [
            { type: 'engaging-question', data: 'なぜ一人ひとり違う学習方法が必要なのでしょうか？' },
            { type: 'tech-stack', data: { language: 'TypeScript', frameworks: ['React', 'Vite'], tools: ['TailwindCSS', 'PWA'] } },
            { type: 'architecture', data: { pattern: 'Component-based', complexity: 'moderate' } }
          ]
        },
        result: {
          title: '📈 得られた結果',
          content: `**この取り組みで、どのような変化が期待できるでしょうか？**

**開発活動の成果**
プロジェクトは活発に開発が続けられており、充実したドキュメントとともにGitHubで42個のスターを獲得するなど、良好な成果を上げています。

**ビジネス価値の実現**
個別最適化された学習環境の実現

**技術的達成度**
• TypeScript実装
• React + Vite構成
• PWA対応`,
          bullets: [
            '総コミット数: 156回',
            '最終更新: 2日前',
            'スター数: 42個',
            'フォーク数: 8個',
            '詳細なREADMEを完備'
          ],
          visualElements: [
            { type: 'engaging-question', data: 'この取り組みで、どのような変化が期待できるでしょうか？' },
            { type: 'metrics', data: { stars: 42, forks: 8, commits: 156 } },
            { type: 'business-value', data: '個別最適化された学習環境の実現' },
            { type: 'achievements', data: ['TypeScript実装', 'React + Vite構成', 'PWA対応'] }
          ]
        },
        next: {
          title: '🚀 これからの展望',
          content: `**ビジョン**
全学習者のニューロダイバーシティに配慮した包括的学習プラットフォームの実現

**ロードマップ**
1. プロトタイプ開発と基本機能実装
2. ユーザビリティテストと改善
3. AI機能統合と個別化学習
4. グローバル展開と多言語対応
5. 包括的プラットフォーム完成

**インパクト予測**
このプロジェクトが目指す未来では、ニューロダイバーシティを持つ学習者の体験が根本的に変わります。

**コミュニティへの貢献**
オープンソースとしての発展を通じて、業界全体のイノベーションを推進します。`,
          bullets: [
            '段階的な機能拡張',
            'ユーザーフィードバックの継続的取り込み',
            '技術コミュニティとの連携',
            'パートナーシップ機会の模索',
            'グローバル展開の可能性'
          ],
          visualElements: [
            { type: 'future-vision', data: '全学習者のニューロダイバーシティに配慮した包括的学習プラットフォームの実現' },
            { type: 'roadmap', data: mockRepoData.projectPurpose.roadmap },
            { type: 'visualization-suggestions', data: mockRepoData.projectPurpose.visualizationSuggestions }
          ]
        }
      }
      
      setStory(mockStory)

      // 原稿生成
      const script = scriptGenerator.generateScript(
        mockStory,
        mockRepoData as any,
        5,
        'general'
      )
      setPresentationScript(script)

      // テーマ自動選択
      const theme = detectProjectTheme(
        mockRepoData.projectPurpose.primaryPurpose,
        mockRepoData.description,
        ['TypeScript', 'React', 'Vite']
      )
      setSelectedTheme(theme)
    }
  }, [id])

  const slides = story ? [story.why, story.approach, story.result, story.next] : []

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        nextSlide()
      } else if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key >= '1' && event.key <= '9') {
        const slideIndex = parseInt(event.key) - 1
        if (slideIndex < slides.length) {
          goToSlide(slideIndex)
        }
      } else if (event.key === 's' || event.key === 'S') {
        setShowScript(!showScript)
      } else if (event.key === 'p' || event.key === 'P') {
        setIsPresenting(!isPresenting)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide, slides.length, showScript, isPresenting])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p>スライドをロード中...</p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]
  const currentTheme = projectThemes[selectedTheme as keyof typeof projectThemes]

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.colors.gradient.start}, ${currentTheme.colors.gradient.end})`
      }}
    >
      {/* Navigation Header */}
      <div className="bg-black bg-opacity-50 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">🎭 Enhanced Presentation</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setShowScript(!showScript)}
              className={`px-3 py-1 rounded transition-colors ${
                showScript ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {showScript ? '📝 原稿表示中' : '📝 原稿表示'}
            </button>
            <button
              onClick={() => setIsPresenting(!isPresenting)}
              className={`px-3 py-1 rounded transition-colors ${
                isPresenting ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPresenting ? '⏹️ 停止' : '▶️ 開始'}
            </button>
            <button
              onClick={prevSlide}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              disabled={currentSlide === 0}
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              disabled={currentSlide === slides.length - 1}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Content */}
        <div className={`${showScript ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className="h-full overflow-y-auto p-8">
            <div 
              className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-6xl mx-auto"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            >
              {/* Slide Title */}
              <h2 
                className="font-bold mb-8 text-center"
                style={{ 
                  fontSize: currentTheme.typography.title.size,
                  fontWeight: currentTheme.typography.title.weight,
                  color: currentTheme.colors.primary,
                  lineHeight: currentTheme.typography.title.lineHeight
                }}
              >
                {currentSlideData.title}
              </h2>

              {/* Enhanced Visual Elements */}
              <div className="mb-8">
                <EnhancedEngagingSlideElements 
                  elements={currentSlideData.visualElements}
                  projectPurpose="包括的な学習体験の提供"
                  description="学習支援プラットフォーム"
                  technologies={['TypeScript', 'React', 'Vite']}
                  contentLength={currentSlideData.content.length}
                  emotionalContext={currentTheme.emotionalTone}
                />
              </div>

              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="leading-relaxed whitespace-pre-line"
                  style={{
                    fontSize: currentTheme.typography.body.size,
                    color: currentTheme.colors.text.primary,
                    lineHeight: currentTheme.typography.body.lineHeight
                  }}
                >
                  {currentSlideData.content}
                </div>

                {/* Bullets */}
                {currentSlideData.bullets && currentSlideData.bullets.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {currentSlideData.bullets.map((bullet: string, index: number) => (
                      <li 
                        key={index} 
                        className="flex items-center"
                        style={{
                          fontSize: currentTheme.typography.body.size,
                          color: currentTheme.colors.text.primary
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full mr-3"
                          style={{ backgroundColor: currentTheme.colors.primary }}
                        ></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Script Panel */}
        {showScript && presentationScript && (
          <div className="w-1/3 border-l border-gray-300">
            <PresentationScriptViewer
              script={presentationScript}
              currentSlideIndex={currentSlide}
              isPresenting={isPresenting}
              onTimingUpdate={(elapsed, remaining) => {
                console.log(`Elapsed: ${elapsed}s, Remaining: ${remaining}s`)
              }}
            />
          </div>
        )}
      </div>

      {/* Slide Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-gray-400 hover:bg-gray-300'
              }`}
              style={{
                backgroundColor: index === currentSlide ? currentTheme.colors.primary : undefined
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyboard Navigation Instructions */}
      <div className="fixed bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded">
        <div className="space-y-1">
          <p>🔸 ← → : スライド移動</p>
          <p>🔸 S : 原稿表示切替</p>
          <p>🔸 P : プレゼン開始/停止</p>
          <p>🔸 1-9 : スライド直接移動</p>
        </div>
      </div>
    </div>
  )
}