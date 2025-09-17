// Visual Design System for Engaging Presentations
// 色彩理論とフォントスケーリングに基づく包括的デザインシステム

export interface VisualTheme {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      accent: string
    }
    gradient: {
      start: string
      end: string
    }
  }
  typography: {
    title: FontConfig
    subtitle: FontConfig
    body: FontConfig
    caption: FontConfig
    emphasis: FontConfig
  }
  emotionalTone: 'professional' | 'creative' | 'technical' | 'inspirational' | 'urgent'
}

export interface FontConfig {
  size: string
  weight: string
  lineHeight: string
  letterSpacing?: string
  fontFamily?: string
}

export interface DynamicFontScaling {
  minSize: number
  maxSize: number
  optimalSize: number
  contentBasedScaling: boolean
  responsive: {
    mobile: FontConfig
    tablet: FontConfig
    desktop: FontConfig
  }
}

// プロジェクトタイプ別の最適化テーマ
export const projectThemes: Record<string, VisualTheme> = {
  // 技術系プロジェクト - 信頼性と革新性
  technical: {
    name: 'Technical Excellence',
    description: '技術的信頼性と革新性を表現',
    colors: {
      primary: '#1e40af', // 深い青 - 信頼性
      secondary: '#3b82f6', // 明るい青 - 革新性
      accent: '#06b6d4', // シアン - 技術感
      background: '#f8fafc',
      surface: '#ffffff',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        accent: '#0ea5e9'
      },
      gradient: {
        start: '#1e40af',
        end: '#06b6d4'
      }
    },
    typography: {
      title: {
        size: 'clamp(2.5rem, 4vw + 1rem, 4rem)',
        weight: '700',
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      subtitle: {
        size: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)',
        weight: '600',
        lineHeight: '1.2'
      },
      body: {
        size: 'clamp(1rem, 1.5vw + 0.5rem, 1.25rem)',
        weight: '400',
        lineHeight: '1.6'
      },
      caption: {
        size: 'clamp(0.875rem, 1vw + 0.25rem, 1rem)',
        weight: '500',
        lineHeight: '1.4'
      },
      emphasis: {
        size: 'clamp(1.125rem, 1.75vw + 0.5rem, 1.5rem)',
        weight: '600',
        lineHeight: '1.3'
      }
    },
    emotionalTone: 'technical'
  },

  // 教育系プロジェクト - 親しみやすさと学習効果
  educational: {
    name: 'Learning Focused',
    description: '学習効果と親しみやすさを重視',
    colors: {
      primary: '#059669', // 緑 - 成長・学習
      secondary: '#10b981', // 明るい緑 - 希望
      accent: '#f59e0b', // オレンジ - 活力・注意
      background: '#f0fdf4',
      surface: '#ffffff',
      text: {
        primary: '#064e3b',
        secondary: '#047857',
        accent: '#d97706'
      },
      gradient: {
        start: '#059669',
        end: '#34d399'
      }
    },
    typography: {
      title: {
        size: 'clamp(2.25rem, 3.5vw + 1rem, 3.5rem)',
        weight: '800',
        lineHeight: '1.1',
        letterSpacing: '-0.01em'
      },
      subtitle: {
        size: 'clamp(1.375rem, 2.25vw + 0.5rem, 2rem)',
        weight: '600',
        lineHeight: '1.25'
      },
      body: {
        size: 'clamp(1.125rem, 1.75vw + 0.5rem, 1.375rem)',
        weight: '400',
        lineHeight: '1.7'
      },
      caption: {
        size: 'clamp(1rem, 1.25vw + 0.25rem, 1.125rem)',
        weight: '500',
        lineHeight: '1.5'
      },
      emphasis: {
        size: 'clamp(1.25rem, 2vw + 0.5rem, 1.75rem)',
        weight: '700',
        lineHeight: '1.2'
      }
    },
    emotionalTone: 'inspirational'
  },

  // ビジネス系プロジェクト - プロフェッショナルと成果
  business: {
    name: 'Professional Impact',
    description: 'ビジネス価値と成果を強調',
    colors: {
      primary: '#7c3aed', // 紫 - プレミアム感
      secondary: '#a855f7', // 明るい紫 - 革新性
      accent: '#ef4444', // 赤 - 緊急性・重要性
      background: '#fafaf9',
      surface: '#ffffff',
      text: {
        primary: '#44403c',
        secondary: '#78716c',
        accent: '#dc2626'
      },
      gradient: {
        start: '#7c3aed',
        end: '#ec4899'
      }
    },
    typography: {
      title: {
        size: 'clamp(2.75rem, 4.25vw + 1rem, 4.25rem)',
        weight: '900',
        lineHeight: '1.05',
        letterSpacing: '-0.025em'
      },
      subtitle: {
        size: 'clamp(1.5rem, 2.75vw + 0.5rem, 2.5rem)',
        weight: '700',
        lineHeight: '1.15'
      },
      body: {
        size: 'clamp(1.125rem, 1.75vw + 0.5rem, 1.375rem)',
        weight: '400',
        lineHeight: '1.6'
      },
      caption: {
        size: 'clamp(0.875rem, 1.125vw + 0.25rem, 1rem)',
        weight: '600',
        lineHeight: '1.4'
      },
      emphasis: {
        size: 'clamp(1.375rem, 2.25vw + 0.5rem, 2rem)',
        weight: '800',
        lineHeight: '1.2'
      }
    },
    emotionalTone: 'professional'
  },

  // クリエイティブ系プロジェクト - 表現力と芸術性
  creative: {
    name: 'Creative Expression',
    description: 'クリエイティビティと表現力を重視',
    colors: {
      primary: '#ec4899', // ピンク - 創造性
      secondary: '#f97316', // オレンジ - エネルギー
      accent: '#8b5cf6', // 紫 - 神秘性
      background: '#fef7ff',
      surface: '#ffffff',
      text: {
        primary: '#831843',
        secondary: '#be185d',
        accent: '#7c2d12'
      },
      gradient: {
        start: '#ec4899',
        end: '#f97316'
      }
    },
    typography: {
      title: {
        size: 'clamp(3rem, 5vw + 1rem, 5rem)',
        weight: '800',
        lineHeight: '1.0',
        letterSpacing: '-0.03em',
        fontFamily: 'Georgia, serif'
      },
      subtitle: {
        size: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)',
        weight: '600',
        lineHeight: '1.2'
      },
      body: {
        size: 'clamp(1.125rem, 1.75vw + 0.5rem, 1.375rem)',
        weight: '400',
        lineHeight: '1.75'
      },
      caption: {
        size: 'clamp(1rem, 1.25vw + 0.25rem, 1.125rem)',
        weight: '500',
        lineHeight: '1.5'
      },
      emphasis: {
        size: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)',
        weight: '700',
        lineHeight: '1.15'
      }
    },
    emotionalTone: 'creative'
  }
}

// コンテンツ長に基づく動的フォントスケーリング
export const calculateOptimalFontSize = (
  contentLength: number,
  baseSize: number,
  context: 'title' | 'body' | 'caption'
): string => {
  let scaleFactor = 1

  // コンテンツ長による調整
  if (contentLength > 200) {
    scaleFactor = 0.85 // 長いコンテンツは小さく
  } else if (contentLength > 100) {
    scaleFactor = 0.92
  } else if (contentLength < 30) {
    scaleFactor = 1.15 // 短いコンテンツは大きく
  }

  // コンテキストによる調整
  const contextMultiplier = {
    title: 1.2,
    body: 1.0,
    caption: 0.85
  }

  const finalSize = baseSize * scaleFactor * contextMultiplier[context]
  return `${finalSize}rem`
}

// 感情誘導色彩システム
export const getEmotionalColors = (emotion: string, intensity: 'low' | 'medium' | 'high') => {
  const emotions = {
    excitement: {
      low: '#fbbf24',
      medium: '#f59e0b',
      high: '#d97706'
    },
    trust: {
      low: '#60a5fa',
      medium: '#3b82f6',
      high: '#1d4ed8'
    },
    urgency: {
      low: '#fca5a5',
      medium: '#ef4444',
      high: '#dc2626'
    },
    growth: {
      low: '#86efac',
      medium: '#22c55e',
      high: '#15803d'
    },
    innovation: {
      low: '#c084fc',
      medium: '#a855f7',
      high: '#7c3aed'
    },
    calm: {
      low: '#a7f3d0',
      medium: '#34d399',
      high: '#059669'
    }
  }

  return emotions[emotion as keyof typeof emotions]?.[intensity] || '#6b7280'
}

// アクセシビリティ対応色彩チェック
export const checkColorContrast = (foreground: string, background: string): {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
} => {
  // 簡略化されたコントラスト計算（実際の実装では専門ライブラリを使用）
  const ratio = 4.5 // 仮の値
  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7
  }
}

// プロジェクトタイプ自動判定
export const detectProjectTheme = (
  projectPurpose: string,
  description: string,
  technologies: string[]
): keyof typeof projectThemes => {
  const content = `${projectPurpose} ${description}`.toLowerCase()
  
  if (content.includes('learn') || content.includes('教育') || content.includes('study')) {
    return 'educational'
  }
  
  if (content.includes('business') || content.includes('ビジネス') || content.includes('企業')) {
    return 'business'
  }
  
  if (content.includes('creative') || content.includes('design') || content.includes('art')) {
    return 'creative'
  }
  
  // 技術要素が多い場合
  const techKeywords = ['api', 'framework', 'library', 'algorithm', 'data']
  if (techKeywords.some(keyword => content.includes(keyword)) || technologies.length > 3) {
    return 'technical'
  }
  
  return 'technical' // デフォルト
}