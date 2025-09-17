// Presentation Script Generation Engine
// プレゼンテーション原稿自動生成システム

import { StorySection, RepositoryData } from '../types'

export interface PresentationScript {
  slideId: string
  sections: ScriptSection[]
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audience: 'technical' | 'business' | 'general'
}

export interface ScriptSection {
  title: string
  content: string
  speakerNotes: SpeakerNote[]
  timing: TimingInfo
  emphasis: EmphasisPoint[]
  transitions: TransitionCue[]
  engagementTechniques: EngagementTechnique[]
}

export interface SpeakerNote {
  type: 'opening' | 'explanation' | 'emphasis' | 'transition' | 'interaction' | 'conclusion'
  content: string
  timing: number // 秒数
  tone: 'confident' | 'enthusiastic' | 'thoughtful' | 'urgent' | 'friendly'
  gestures?: string[]
  pauseAfter?: number
}

export interface TimingInfo {
  estimatedDuration: number // 秒
  minDuration: number
  maxDuration: number
  criticalPoints: number[] // 重要なタイミング（秒）
}

export interface EmphasisPoint {
  text: string
  technique: 'volume' | 'pace' | 'pause' | 'gesture' | 'repetition'
  importance: 'low' | 'medium' | 'high' | 'critical'
  suggestion: string
}

export interface TransitionCue {
  fromSection: string
  toSection: string
  bridgeText: string
  visualCue?: string
  timing: number
}

export interface EngagementTechnique {
  type: 'question' | 'story' | 'statistic' | 'demonstration' | 'analogy' | 'humor'
  content: string
  expectedResponse?: string
  fallbackResponse?: string
  timing: number
}

class PresentationScriptGenerator {
  // メインの原稿生成メソッド
  generateScript(
    storyData: { why: StorySection; approach: StorySection; result: StorySection; next: StorySection },
    repoData: RepositoryData,
    duration: 3 | 5,
    audience: 'technical' | 'business' | 'general'
  ): PresentationScript {
    const sections = [
      this.generateOpeningScript(storyData.why, repoData, audience),
      this.generateApproachScript(storyData.approach, repoData, audience),
      this.generateResultScript(storyData.result, repoData, audience),
      this.generateFutureScript(storyData.next, repoData, audience)
    ]

    const totalDuration = sections.reduce((sum, section) => sum + section.timing.estimatedDuration, 0)

    return {
      slideId: `script-${Date.now()}`,
      sections,
      totalDuration,
      difficulty: this.assessDifficulty(repoData),
      audience
    }
  }

  // オープニング原稿生成
  private generateOpeningScript(
    whySection: StorySection,
    repoData: RepositoryData,
    audience: string
  ): ScriptSection {
    const engagingQuestion = whySection.visualElements?.[0]?.data || 'なぜこのプロジェクトが必要なのでしょうか？'
    
    const speakerNotes: SpeakerNote[] = [
      {
        type: 'opening',
        content: '深呼吸をして、聴衆とアイコンタクトを取りながら始めましょう。',
        timing: 0,
        tone: 'confident',
        gestures: ['深呼吸', 'アイコンタクト'],
        pauseAfter: 2
      },
      {
        type: 'interaction',
        content: `「${engagingQuestion}」この質問を聴衆に投げかけ、数秒間の沈黙を作って考えさせましょう。`,
        timing: 10,
        tone: 'thoughtful',
        gestures: ['手を上げる', '聴衆を見回す'],
        pauseAfter: 3
      },
      {
        type: 'explanation',
        content: `実は、${repoData.projectPurpose?.problemSolved || 'この問題'}について、多くの人が感じている課題があります。`,
        timing: 20,
        tone: 'empathetic',
        gestures: ['共感の表情', '手の動き']
      },
      {
        type: 'emphasis',
        content: `今日は、${repoData.name}プロジェクトを通じて、この課題にどう取り組んでいるかをお話しします。`,
        timing: 35,
        tone: 'enthusiastic',
        gestures: ['前に一歩', '明確な手振り']
      }
    ]

    const emphasis: EmphasisPoint[] = [
      {
        text: engagingQuestion,
        technique: 'pause',
        importance: 'critical',
        suggestion: '質問の後に3秒間の沈黙を作り、聴衆が考える時間を与える'
      },
      {
        text: repoData.projectPurpose?.problemSolved || '課題',
        technique: 'volume',
        importance: 'high',
        suggestion: '声のトーンを少し上げて、問題の重要性を強調'
      }
    ]

    const engagementTechniques: EngagementTechnique[] = [
      {
        type: 'question',
        content: engagingQuestion,
        expectedResponse: '聴衆が考え込む様子',
        fallbackResponse: '「同じような経験をされた方もいらっしゃるのではないでしょうか」',
        timing: 10
      }
    ]

    return {
      title: whySection.title,
      content: this.generateSectionContent(whySection, 'opening'),
      speakerNotes,
      timing: {
        estimatedDuration: 60,
        minDuration: 45,
        maxDuration: 75,
        criticalPoints: [10, 35]
      },
      emphasis,
      transitions: [],
      engagementTechniques
    }
  }

  // アプローチ原稿生成
  private generateApproachScript(
    approachSection: StorySection,
    repoData: RepositoryData,
    audience: string
  ): ScriptSection {
    const techStack = approachSection.visualElements?.find(e => e.type === 'tech-stack')?.data
    
    const speakerNotes: SpeakerNote[] = [
      {
        type: 'transition',
        content: '前のセクションから自然に移行。「では、具体的にどのようにアプローチしたかを見てみましょう」',
        timing: 0,
        tone: 'confident',
        gestures: ['スライドを指差す']
      },
      {
        type: 'explanation',
        content: `技術選択について説明します。${techStack?.language || 'メイン技術'}を選んだ理由を明確に伝えましょう。`,
        timing: 15,
        tone: 'enthusiastic',
        gestures: ['技術スタックを指差す']
      },
      {
        type: 'emphasis',
        content: 'なぜこの技術組み合わせが最適だったかを、聴衆のレベルに合わせて説明',
        timing: 45,
        tone: 'confident',
        gestures: ['説得力のある手振り']
      }
    ]

    const engagementTechniques: EngagementTechnique[] = [
      {
        type: 'analogy',
        content: '技術スタックを料理のレシピに例える：「適切な材料を選ぶように、私たちも最適なツールを選択しました」',
        timing: 30,
        expectedResponse: '理解した表情',
        fallbackResponse: '「つまり、目的に最も適した技術を選んだということです」'
      }
    ]

    return {
      title: approachSection.title,
      content: this.generateSectionContent(approachSection, 'approach'),
      speakerNotes,
      timing: {
        estimatedDuration: 90,
        minDuration: 75,
        maxDuration: 105,
        criticalPoints: [15, 45]
      },
      emphasis: [
        {
          text: '技術選択の理由',
          technique: 'pace',
          importance: 'high',
          suggestion: 'ゆっくりと明確に、技術選択の論理的根拠を説明'
        }
      ],
      transitions: [],
      engagementTechniques
    }
  }

  // 結果原稿生成
  private generateResultScript(
    resultSection: StorySection,
    repoData: RepositoryData,
    audience: string
  ): ScriptSection {
    const metrics = resultSection.visualElements?.find(e => e.type === 'metrics')?.data
    
    const speakerNotes: SpeakerNote[] = [
      {
        type: 'transition',
        content: '成果を発表する際は、数字を効果的に使いましょう。',
        timing: 0,
        tone: 'enthusiastic'
      },
      {
        type: 'emphasis',
        content: `${metrics?.stars || 0}個のスターと${metrics?.commits || 0}回のコミット - これらの数字が示す意味を説明`,
        timing: 20,
        tone: 'confident',
        gestures: ['数字を強調する手振り']
      },
      {
        type: 'explanation',
        content: '数字だけでなく、質的な成果も含めて包括的に説明しましょう。',
        timing: 50,
        tone: 'thoughtful'
      }
    ]

    const engagementTechniques: EngagementTechnique[] = [
      {
        type: 'statistic',
        content: `${metrics?.commits || 0}回のコミットは、約${Math.floor((metrics?.commits || 0) / 30)}ヶ月間の継続的な開発を意味します`,
        timing: 25
      }
    ]

    return {
      title: resultSection.title,
      content: this.generateSectionContent(resultSection, 'result'),
      speakerNotes,
      timing: {
        estimatedDuration: 75,
        minDuration: 60,
        maxDuration: 90,
        criticalPoints: [20, 50]
      },
      emphasis: [
        {
          text: '具体的な数字',
          technique: 'volume',
          importance: 'high',
          suggestion: '数字を言う時は、声のトーンを上げて印象を強くする'
        }
      ],
      transitions: [],
      engagementTechniques
    }
  }

  // 未来展望原稿生成
  private generateFutureScript(
    nextSection: StorySection,
    repoData: RepositoryData,
    audience: string
  ): ScriptSection {
    const futureVision = nextSection.visualElements?.find(e => e.type === 'future-vision')?.data
    const roadmap = nextSection.visualElements?.find(e => e.type === 'roadmap')?.data || []
    
    const speakerNotes: SpeakerNote[] = [
      {
        type: 'transition',
        content: '最後に、未来への展望について、希望と具体性を込めて話しましょう。',
        timing: 0,
        tone: 'enthusiastic'
      },
      {
        type: 'emphasis',
        content: `「${futureVision || 'この技術の未来'}」- この未来を実現するための具体的なステップを示します。`,
        timing: 15,
        tone: 'inspiring',
        gestures: ['未来を指差すような動作']
      },
      {
        type: 'interaction',
        content: '聴衆に向けて協力を呼びかけ、一緒に未来を作る感覚を演出しましょう。',
        timing: 60,
        tone: 'friendly',
        gestures: ['聴衆を包み込むような手振り']
      },
      {
        type: 'conclusion',
        content: '力強く、希望的に締めくくります。「一緒にこの未来を作りませんか？」',
        timing: 80,
        tone: 'inspiring',
        gestures: ['力強いクロージングジェスチャー'],
        pauseAfter: 3
      }
    ]

    const engagementTechniques: EngagementTechnique[] = [
      {
        type: 'question',
        content: 'この未来に共感していただけますか？',
        timing: 45,
        expectedResponse: '頷きや拍手',
        fallbackResponse: '私たちは、この可能性を信じています'
      },
      {
        type: 'demonstration',
        content: 'ロードマップの各段階を視覚的に示しながら説明',
        timing: 30
      }
    ]

    return {
      title: nextSection.title,
      content: this.generateSectionContent(nextSection, 'future'),
      speakerNotes,
      timing: {
        estimatedDuration: 90,
        minDuration: 75,
        maxDuration: 105,
        criticalPoints: [15, 60, 80]
      },
      emphasis: [
        {
          text: '未来のビジョン',
          technique: 'pause',
          importance: 'critical',
          suggestion: 'ビジョンを語る前に一呼吸置いて、聴衆の注意を集める'
        },
        {
          text: '一緒に作る',
          technique: 'repetition',
          importance: 'high',
          suggestion: '協力の呼びかけは、異なる表現で2-3回繰り返す'
        }
      ],
      transitions: [],
      engagementTechniques
    }
  }

  // セクション内容生成
  private generateSectionContent(section: StorySection, type: string): string {
    const baseContent = section.content
    
    // 原稿用の追加説明を生成
    const scriptAdditions = {
      opening: '\n\n【話者メモ】聴衆との関係性を築くため、最初の挨拶で笑顔を忘れずに。',
      approach: '\n\n【話者メモ】技術的な内容は、聴衆のレベルに合わせて説明の詳しさを調整してください。',
      result: '\n\n【話者メモ】成果を説明する際は、誇らしげに、しかし謙虚さも忘れずに。',
      future: '\n\n【話者メモ】未来への期待と現実的な計画のバランスを保ちながら話してください。'
    }

    return baseContent + (scriptAdditions[type as keyof typeof scriptAdditions] || '')
  }

  // プロジェクトの難易度評価
  private assessDifficulty(repoData: RepositoryData): 'beginner' | 'intermediate' | 'advanced' {
    let complexity = 0
    
    // 技術スタックの複雑さ
    if (Object.keys(repoData.languages).length > 3) complexity += 2
    
    // ファイル数
    if (repoData.files.length > 100) complexity += 2
    else if (repoData.files.length > 50) complexity += 1
    
    // 依存関係の数
    if (repoData.dependencies.length > 20) complexity += 2
    else if (repoData.dependencies.length > 10) complexity += 1
    
    // アーキテクチャの複雑さ
    if (repoData.architectureAnalysis?.complexity === 'complex') complexity += 3
    else if (repoData.architectureAnalysis?.complexity === 'moderate') complexity += 1
    
    if (complexity >= 6) return 'advanced'
    if (complexity >= 3) return 'intermediate'
    return 'beginner'
  }

  // 原稿のタイミング調整
  adjustTimingForDuration(script: PresentationScript, targetDuration: number): PresentationScript {
    const currentDuration = script.totalDuration
    const ratio = targetDuration / currentDuration
    
    // 各セクションのタイミングを調整
    const adjustedSections = script.sections.map(section => ({
      ...section,
      timing: {
        ...section.timing,
        estimatedDuration: Math.round(section.timing.estimatedDuration * ratio),
        minDuration: Math.round(section.timing.minDuration * ratio),
        maxDuration: Math.round(section.timing.maxDuration * ratio)
      },
      speakerNotes: section.speakerNotes.map(note => ({
        ...note,
        timing: Math.round(note.timing * ratio)
      }))
    }))

    return {
      ...script,
      sections: adjustedSections,
      totalDuration: targetDuration
    }
  }
}

// エクスポート
export const scriptGenerator = new PresentationScriptGenerator()