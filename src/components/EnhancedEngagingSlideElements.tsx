import React, { useMemo } from 'react'
import { VisualElement } from '../types'
import { projectThemes, detectProjectTheme, calculateOptimalFontSize, getEmotionalColors } from '../services/visualDesignSystem'

interface EnhancedEngagingSlideElementsProps {
  elements?: VisualElement[]
  projectPurpose?: string
  description?: string
  technologies?: string[]
  contentLength?: number
  emotionalContext?: string
}

export const EnhancedEngagingSlideElements: React.FC<EnhancedEngagingSlideElementsProps> = ({ 
  elements, 
  projectPurpose = '',
  description = '',
  technologies = [],
  contentLength = 100,
  emotionalContext = 'professional'
}) => {
  // プロジェクトに最適なテーマを自動選択
  const selectedTheme = useMemo(() => {
    const themeKey = detectProjectTheme(projectPurpose, description, technologies)
    return projectThemes[themeKey]
  }, [projectPurpose, description, technologies])

  // 動的フォントサイズ計算
  const dynamicFontSizes = useMemo(() => {
    return {
      title: calculateOptimalFontSize(contentLength, 2.5, 'title'),
      body: calculateOptimalFontSize(contentLength, 1.125, 'body'),
      caption: calculateOptimalFontSize(contentLength, 0.875, 'caption')
    }
  }, [contentLength])

  // 感情誘導色彩の取得
  const emotionalColor = useMemo(() => {
    return getEmotionalColors(emotionalContext, 'medium')
  }, [emotionalContext])

  if (!elements || elements.length === 0) {
    return null
  }

  const renderElement = (element: VisualElement, index: number) => {
    switch (element.type) {
      case 'engaging-question':
        return (
          <div 
            key={index}
            className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme.colors.gradient.start}15, ${selectedTheme.colors.gradient.end}15)`,
              borderLeft: `6px solid ${selectedTheme.colors.primary}`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4 shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`,
                    color: 'white'
                  }}
                >
                  💭
                </div>
                <h3 
                  className="font-bold tracking-tight"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: selectedTheme.colors.primary,
                    fontWeight: selectedTheme.typography.title.weight
                  }}
                >
                  考えてみてください
                </h3>
              </div>
              <blockquote 
                className="italic leading-relaxed font-medium"
                style={{ 
                  fontSize: dynamicFontSizes.body,
                  color: selectedTheme.colors.text.primary,
                  lineHeight: selectedTheme.typography.body.lineHeight
                }}
              >
                "{element.data}"
              </blockquote>
              <div 
                className="mt-6 h-1 w-20 rounded-full"
                style={{ background: emotionalColor }}
              ></div>
            </div>
          </div>
        )

      case 'problem-solution':
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${getEmotionalColors('urgency', 'low')}, ${getEmotionalColors('urgency', 'medium')}15)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span 
                  className="text-4xl mr-4 p-3 rounded-full"
                  style={{ 
                    background: getEmotionalColors('urgency', 'medium'),
                    color: 'white'
                  }}
                >
                  🎯
                </span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: getEmotionalColors('urgency', 'high')
                  }}
                >
                  解決すべき課題
                </h3>
              </div>
              <p 
                className="leading-relaxed"
                style={{ 
                  fontSize: dynamicFontSizes.body,
                  color: selectedTheme.colors.text.primary
                }}
              >
                {element.data}
              </p>
            </div>
          </div>
        )

      case 'target-audience':
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${getEmotionalColors('growth', 'low')}, ${getEmotionalColors('growth', 'medium')}15)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span 
                  className="text-4xl mr-4 p-3 rounded-full"
                  style={{ 
                    background: getEmotionalColors('growth', 'medium'),
                    color: 'white'
                  }}
                >
                  👥
                </span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: getEmotionalColors('growth', 'high')
                  }}
                >
                  対象ユーザー
                </h3>
              </div>
              <p 
                className="leading-relaxed"
                style={{ 
                  fontSize: dynamicFontSizes.body,
                  color: selectedTheme.colors.text.primary
                }}
              >
                {element.data}
              </p>
            </div>
          </div>
        )

      case 'tech-stack':
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${getEmotionalColors('innovation', 'low')}, ${getEmotionalColors('innovation', 'medium')}15)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span 
                  className="text-4xl mr-4 p-3 rounded-full"
                  style={{ 
                    background: getEmotionalColors('innovation', 'medium'),
                    color: 'white'
                  }}
                >
                  🛠️
                </span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: getEmotionalColors('innovation', 'high')
                  }}
                >
                  技術スタック
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ 
                      fontSize: dynamicFontSizes.body,
                      color: selectedTheme.colors.primary
                    }}
                  >
                    {element.data.language}
                  </div>
                  <div 
                    className="text-sm opacity-75"
                    style={{ color: selectedTheme.colors.text.secondary }}
                  >
                    主要言語
                  </div>
                </div>
                {element.data.frameworks?.length > 0 && (
                  <div className="text-center">
                    <div 
                      className="space-y-1"
                      style={{ fontSize: dynamicFontSizes.caption }}
                    >
                      {element.data.frameworks.map((fw: string, i: number) => (
                        <div 
                          key={i}
                          className="px-3 py-1 rounded-full inline-block mr-1 mb-1"
                          style={{ 
                            background: selectedTheme.colors.secondary + '20',
                            color: selectedTheme.colors.text.primary
                          }}
                        >
                          {fw}
                        </div>
                      ))}
                    </div>
                    <div 
                      className="text-sm opacity-75 mt-2"
                      style={{ color: selectedTheme.colors.text.secondary }}
                    >
                      フレームワーク
                    </div>
                  </div>
                )}
                {element.data.tools?.length > 0 && (
                  <div className="text-center">
                    <div 
                      className="space-y-1"
                      style={{ fontSize: dynamicFontSizes.caption }}
                    >
                      {element.data.tools.map((tool: string, i: number) => (
                        <div 
                          key={i}
                          className="px-3 py-1 rounded-full inline-block mr-1 mb-1"
                          style={{ 
                            background: selectedTheme.colors.accent + '20',
                            color: selectedTheme.colors.text.primary
                          }}
                        >
                          {tool}
                        </div>
                      ))}
                    </div>
                    <div 
                      className="text-sm opacity-75 mt-2"
                      style={{ color: selectedTheme.colors.text.secondary }}
                    >
                      ツール
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'metrics':
        const { stars, forks, commits } = element.data
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${getEmotionalColors('excitement', 'low')}, ${getEmotionalColors('excitement', 'medium')}15)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center mb-8">
                <span 
                  className="text-4xl mr-4 p-3 rounded-full"
                  style={{ 
                    background: getEmotionalColors('excitement', 'medium'),
                    color: 'white'
                  }}
                >
                  📈
                </span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: getEmotionalColors('excitement', 'high')
                  }}
                >
                  プロジェクト指標
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-8">
                {[
                  { value: stars, label: '⭐ Stars', color: selectedTheme.colors.primary },
                  { value: forks, label: '🍴 Forks', color: selectedTheme.colors.secondary },
                  { value: commits, label: '📝 Commits', color: selectedTheme.colors.accent }
                ].map((metric, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="font-black mb-2 bg-gradient-to-br from-current to-opacity-75 bg-clip-text text-transparent"
                      style={{ 
                        fontSize: `calc(${dynamicFontSizes.title} * 1.5)`,
                        color: metric.color
                      }}
                    >
                      {metric.value.toLocaleString()}
                    </div>
                    <div 
                      className="font-medium opacity-75"
                      style={{ 
                        fontSize: dynamicFontSizes.caption,
                        color: selectedTheme.colors.text.secondary
                      }}
                    >
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'roadmap':
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme.colors.gradient.start}10, ${selectedTheme.colors.gradient.end}10)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center mb-8">
                <span 
                  className="text-4xl mr-4 p-3 rounded-full"
                  style={{ 
                    background: selectedTheme.colors.primary,
                    color: 'white'
                  }}
                >
                  🗺️
                </span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    color: selectedTheme.colors.primary
                  }}
                >
                  ロードマップ
                </h3>
              </div>
              <div className="space-y-6">
                {element.data.map((phase: string, i: number) => (
                  <div key={i} className="flex items-start">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6 shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`,
                        fontSize: dynamicFontSizes.caption
                      }}
                    >
                      {i + 1}
                    </div>
                    <p 
                      className="pt-3 leading-relaxed font-medium"
                      style={{ 
                        fontSize: dynamicFontSizes.body,
                        color: selectedTheme.colors.text.primary
                      }}
                    >
                      {phase}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'future-vision':
        return (
          <div 
            key={index}
            className="rounded-2xl shadow-2xl overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme.colors.gradient.start}, ${selectedTheme.colors.gradient.end})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🔮</span>
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: dynamicFontSizes.title,
                    fontWeight: selectedTheme.typography.title.weight
                  }}
                >
                  将来のビジョン
                </h3>
              </div>
              <p 
                className="leading-relaxed font-medium"
                style={{ 
                  fontSize: dynamicFontSizes.body,
                  lineHeight: selectedTheme.typography.body.lineHeight
                }}
              >
                {element.data}
              </p>
              <div className="mt-6 flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/50"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animation: 'pulse 2s infinite'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div 
            key={index}
            className="rounded-xl p-6"
            style={{
              background: selectedTheme.colors.surface,
              color: selectedTheme.colors.text.secondary
            }}
          >
            <p style={{ fontSize: dynamicFontSizes.caption }}>
              Unknown element type: {element.type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="enhanced-engaging-elements space-y-8">
      {elements.map((element, index) => renderElement(element, index))}
    </div>
  )
}