import React from 'react'
import { VisualElement } from '../types'

interface EngagingSlideElementsProps {
  elements?: VisualElement[]
}

export const EngagingSlideElements: React.FC<EngagingSlideElementsProps> = ({ elements }) => {
  if (!elements || elements.length === 0) {
    return null
  }

  return (
    <div className="engaging-elements space-y-4">
      {elements.map((element, index) => (
        <div key={index} className="visual-element">
          {renderElement(element)}
        </div>
      ))}
    </div>
  )
}

const renderElement = (element: VisualElement) => {
  switch (element.type) {
    case 'engaging-question':
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">💭</span>
            <h3 className="text-lg font-semibold text-blue-800">考えてみてください</h3>
          </div>
          <p className="text-blue-700 text-xl font-medium italic">
            "{element.data}"
          </p>
        </div>
      )

    case 'problem-solution':
      return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🎯</span>
            <h3 className="text-lg font-semibold text-red-800">解決すべき課題</h3>
          </div>
          <p className="text-red-700">{element.data}</p>
        </div>
      )

    case 'target-audience':
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">👥</span>
            <h3 className="text-lg font-semibold text-green-800">対象ユーザー</h3>
          </div>
          <p className="text-green-700">{element.data}</p>
        </div>
      )

    case 'market-context':
      return (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">📊</span>
            <h3 className="text-lg font-semibold text-purple-800">市場背景</h3>
          </div>
          <p className="text-purple-700">{element.data}</p>
        </div>
      )

    case 'tech-stack':
      return (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🛠️</span>
            <h3 className="text-lg font-semibold text-cyan-800">技術スタック</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-cyan-700">主要言語</h4>
              <p className="text-cyan-600">{element.data.language}</p>
            </div>
            {element.data.frameworks?.length > 0 && (
              <div>
                <h4 className="font-medium text-cyan-700">フレームワーク</h4>
                <ul className="text-cyan-600">
                  {element.data.frameworks.map((fw: string, i: number) => (
                    <li key={i}>• {fw}</li>
                  ))}
                </ul>
              </div>
            )}
            {element.data.tools?.length > 0 && (
              <div>
                <h4 className="font-medium text-cyan-700">ツール</h4>
                <ul className="text-cyan-600">
                  {element.data.tools.map((tool: string, i: number) => (
                    <li key={i}>• {tool}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )

    case 'metrics':
      return (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">📈</span>
            <h3 className="text-lg font-semibold text-amber-800">プロジェクト指標</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">{element.data.stars}</div>
              <div className="text-amber-600">⭐ Stars</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">{element.data.forks}</div>
              <div className="text-amber-600">🍴 Forks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">{element.data.commits}</div>
              <div className="text-amber-600">📝 Commits</div>
            </div>
          </div>
        </div>
      )

    case 'roadmap':
      return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🗺️</span>
            <h3 className="text-lg font-semibold text-indigo-800">ロードマップ</h3>
          </div>
          <div className="space-y-3">
            {element.data.map((phase: string, i: number) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {i + 1}
                </div>
                <p className="text-indigo-700 pt-1">{phase}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'future-vision':
      return (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🔮</span>
            <h3 className="text-lg font-semibold text-rose-800">将来のビジョン</h3>
          </div>
          <p className="text-rose-700 text-lg leading-relaxed">{element.data}</p>
        </div>
      )

    case 'visualization-suggestions':
      return (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🎨</span>
            <h3 className="text-lg font-semibold text-teal-800">ビジュアル提案</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {element.data.map((suggestion: string, i: number) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-700 text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'business-value':
      return (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">💎</span>
            <h3 className="text-lg font-semibold text-emerald-800">ビジネス価値</h3>
          </div>
          <p className="text-emerald-700">{element.data}</p>
        </div>
      )

    case 'achievements':
      return (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🏆</span>
            <h3 className="text-lg font-semibold text-orange-800">技術的達成度</h3>
          </div>
          <ul className="space-y-2">
            {element.data?.map((achievement: string, i: number) => (
              <li key={i} className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span className="text-orange-700">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    default:
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">Unknown element type: {element.type}</p>
        </div>
      )
  }
}