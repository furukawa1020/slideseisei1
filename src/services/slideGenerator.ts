// import Reveal from 'reveal.js'
import { SlidePresentation, Slide, StoryStructure, RepositoryData } from '../types'

export class SlideGeneratorService {
  generatePresentation(
    repository: RepositoryData, 
    story: StoryStructure, 
    mode: 'ted' | 'imrad',
    duration: 3 | 5,
    language: 'ja' | 'en' | 'zh'
  ): SlidePresentation {
    const slides = mode === 'ted' 
      ? this.generateTEDSlides(repository, story, duration, language)
      : this.generateIMRADSlides(repository, story, duration, language)

    return {
      id: this.generateId(),
      title: repository.name,
      mode,
      language,
      duration,
      slides,
      story,
      repository,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  generateTEDSlides(
    repository: RepositoryData, 
    story: StoryStructure, 
    duration: 3 | 5,
    language: 'ja' | 'en' | 'zh'
  ): Slide[] {
    const slides: Slide[] = []
    const slidesPerMinute = duration === 3 ? 2 : 3
    const totalSlides = duration * slidesPerMinute
    const timePerSlide = (duration * 60) / totalSlides

    // 1. Title Slide
    slides.push({
      id: '1',
      type: 'title',
      title: repository.name,
      content: this.formatDescription(repository.description, language),
      speakerNotes: this.generateSpeakerNotes('title', repository, language),
      duration: timePerSlide
    })

    // 2. Why Slide (Problem Statement)
    slides.push({
      id: '2',
      type: 'content',
      title: this.getLocalizedTitle('why', language),
      content: story.why.content,
      bullets: story.why.bullets.slice(0, 3), // Keep it concise
      speakerNotes: this.generateSpeakerNotes('why', story.why, language),
      duration: timePerSlide
    })

    // 3. The Challenge
    slides.push({
      id: '3',
      type: 'content',
      title: this.getLocalizedTitle('challenge', language),
      content: story.problem.content,
      bullets: story.problem.bullets.slice(0, 3),
      speakerNotes: this.generateSpeakerNotes('problem', story.problem, language),
      duration: timePerSlide
    })

    // 4. Our Approach (Visual/Code)
    if (duration === 5) {
      slides.push({
        id: '4',
        type: 'code',
        title: this.getLocalizedTitle('approach', language),
        content: story.approach.content,
        code: this.generateCodeSnippet(repository),
        speakerNotes: this.generateSpeakerNotes('approach', story.approach, language),
        duration: timePerSlide
      })
    }

    // 5. Architecture/Diagram
    slides.push({
      id: duration === 5 ? '5' : '4',
      type: 'chart',
      title: this.getLocalizedTitle('architecture', language),
      content: 'プロジェクトの技術構成',
      chart: this.generateArchitectureChart(repository),
      speakerNotes: this.generateArchitectureNotes(repository, language),
      duration: timePerSlide
    })

    // 6. Results & Impact
    slides.push({
      id: duration === 5 ? '6' : '5',
      type: 'content',
      title: this.getLocalizedTitle('results', language),
      content: story.result.content,
      bullets: this.formatResultBullets(story.result.bullets, repository),
      speakerNotes: this.generateSpeakerNotes('results', story.result, language),
      duration: timePerSlide
    })

    // 7. What's Next
    if (duration === 5) {
      slides.push({
        id: '7',
        type: 'content',
        title: this.getLocalizedTitle('next', language),
        content: story.next.content,
        bullets: story.next.bullets.slice(0, 3),
        speakerNotes: this.generateSpeakerNotes('next', story.next, language),
        duration: timePerSlide
      })
    }

    // Final Slide
    slides.push({
      id: duration === 5 ? '8' : '6',
      type: 'conclusion',
      title: this.getLocalizedTitle('thanks', language),
      content: `${repository.name}\n\n${this.getLocalizedContent('github_url', language)}\n${repository.url}`,
      speakerNotes: this.generateConclusionNotes(repository, language),
      duration: timePerSlide
    })

    return slides
  }

  generateIMRADSlides(
    repository: RepositoryData, 
    story: StoryStructure, 
    duration: 3 | 5,
    language: 'ja' | 'en' | 'zh'
  ): Slide[] {
    const slides: Slide[] = []
    const timePerSlide = (duration * 60) / (duration === 3 ? 6 : 8)

    // 1. Title
    slides.push({
      id: '1',
      type: 'title',
      title: repository.name,
      content: `${this.formatDescription(repository.description, language)}\n\n${repository.language} | ${repository.stars}⭐`,
      speakerNotes: this.generateSpeakerNotes('title', repository, language),
      duration: timePerSlide
    })

    // 2. Introduction
    slides.push({
      id: '2',
      type: 'content',
      title: 'Introduction',
      content: story.why.content,
      bullets: [`目的: ${repository.description}`, `技術: ${repository.language}`, `開始: ${new Date(repository.createdAt).getFullYear()}年`],
      speakerNotes: this.generateSpeakerNotes('introduction', story.why, language),
      duration: timePerSlide
    })

    // 3. Methods
    slides.push({
      id: '3',
      type: 'content',
      title: 'Methods',
      content: story.approach.content,
      bullets: this.generateMethodsBullets(repository),
      speakerNotes: this.generateSpeakerNotes('methods', story.approach, language),
      duration: timePerSlide
    })

    // 4. Implementation
    if (duration === 5) {
      slides.push({
        id: '4',
        type: 'code',
        title: 'Implementation',
        content: '主要な実装アプローチ',
        code: this.generateCodeSnippet(repository),
        speakerNotes: this.generateImplementationNotes(repository, language),
        duration: timePerSlide
      })
    }

    // 5. Results
    slides.push({
      id: duration === 5 ? '5' : '4',
      type: 'content',
      title: 'Results',
      content: story.result.content,
      bullets: this.formatResultBullets(story.result.bullets, repository),
      speakerNotes: this.generateSpeakerNotes('results', story.result, language),
      duration: timePerSlide
    })

    // 6. Analysis
    slides.push({
      id: duration === 5 ? '6' : '5',
      type: 'chart',
      title: 'Analysis',
      content: 'プロジェクト分析結果',
      chart: this.generateAnalysisChart(repository),
      speakerNotes: this.generateAnalysisNotes(repository, language),
      duration: timePerSlide
    })

    // 7. Discussion
    if (duration === 5) {
      slides.push({
        id: '7',
        type: 'content',
        title: 'Discussion',
        content: story.next.content,
        bullets: [`制約: ${this.identifyLimitations(repository)}`, `今後の課題: ${story.next.bullets[0]}`, `応用可能性: ${this.identifyApplications(repository)}`],
        speakerNotes: this.generateDiscussionNotes(repository, language),
        duration: timePerSlide
      })
    }

    // 8. Conclusion
    slides.push({
      id: duration === 5 ? '8' : '6',
      type: 'conclusion',
      title: 'Conclusion',
      content: `✓ ${repository.name}の開発完了\n✓ ${Object.keys(repository.languages).length}つの技術を統合\n✓ ${repository.commits.length}回のイテレーション\n\n今後の発展に期待`,
      speakerNotes: this.generateConclusionNotes(repository, language),
      duration: timePerSlide
    })

    return slides
  }

  renderSlides(presentation: SlidePresentation): string {
    const theme = presentation.mode === 'ted' ? 'black' : 'white'
    const transition = presentation.mode === 'ted' ? 'slide' : 'fade'

    const slidesHtml = presentation.slides.map(slide => this.renderSlide(slide)).join('')

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentation.title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/${theme}.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/plugin/highlight/monokai.css">
    <style>
        .reveal .slides section {
            text-align: left;
        }
        .reveal h1, .reveal h2, .reveal h3 {
            color: ${presentation.mode === 'ted' ? '#fff' : '#333'};
            font-family: 'Helvetica Neue', sans-serif;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        .reveal .title-slide {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .reveal .conclusion-slide {
            text-align: center;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        .reveal .code-slide pre {
            width: 100%;
            font-size: 0.6em;
            line-height: 1.2;
            border-radius: 8px;
        }
        .reveal ul {
            font-size: 0.9em;
            line-height: 1.6;
        }
        .reveal .chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 400px;
        }
        .slide-number {
            font-size: 0.8em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            ${slidesHtml}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/plugin/highlight/highlight.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/plugin/notes/notes.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: '${transition}',
            transitionSpeed: 'default',
            backgroundTransition: 'fade',
            plugins: [RevealHighlight, RevealNotes]
        });
    </script>
</body>
</html>`
  }

  private renderSlide(slide: Slide): string {
    const slideClass = slide.type === 'title' ? 'title-slide' : 
                      slide.type === 'conclusion' ? 'conclusion-slide' :
                      slide.type === 'code' ? 'code-slide' : ''

    let content = `<section class="${slideClass}" data-auto-animate>`
    
    if (slide.type === 'title' || slide.type === 'conclusion') {
      content += `
        <h1 style="font-size: 2.5em; margin-bottom: 1rem;">${slide.title}</h1>
        <p style="font-size: 1.2em; line-height: 1.6;">${slide.content.replace(/\n/g, '<br>')}</p>
      `
    } else {
      content += `<h2>${slide.title}</h2>`
      
      if (slide.content) {
        content += `<p style="font-size: 1.1em; margin-bottom: 1.5rem;">${slide.content}</p>`
      }
      
      if (slide.bullets && slide.bullets.length > 0) {
        content += '<ul style="font-size: 1em;">'
        slide.bullets.forEach(bullet => {
          content += `<li style="margin-bottom: 0.5rem;">${bullet}</li>`
        })
        content += '</ul>'
      }
      
      if (slide.code) {
        content += `
          <pre><code class="${slide.code.language}" data-trim data-noescape>
${slide.code.code}
          </code></pre>
          <p style="font-size: 0.8em; margin-top: 1rem;">${slide.code.explanation}</p>
        `
      }
      
      if (slide.chart) {
        content += `
          <div class="chart-container">
            <div style="text-align: center;">
              <h3>${slide.chart.title}</h3>
              <p>データ可視化プレースホルダー</p>
            </div>
          </div>
        `
      }
    }
    
    // Speaker notes
    if (slide.speakerNotes) {
      content += `<aside class="notes">${slide.speakerNotes}</aside>`
    }
    
    content += '</section>'
    return content
  }

  private generateCodeSnippet(repository: RepositoryData) {
    const language = repository.language.toLowerCase()
    
    const snippets = {
      javascript: {
        language: 'javascript',
        code: `// ${repository.name} - Core Implementation
function initializeApp() {
  const config = {
    name: '${repository.name}',
    version: '1.0.0',
    features: ['modern', 'scalable', 'efficient']
  };
  
  return new App(config);
}`,
        explanation: 'アプリケーションの初期化とコア機能'
      },
      typescript: {
        language: 'typescript',
        code: `// ${repository.name} - Type-Safe Implementation
interface AppConfig {
  name: string;
  version: string;
  features: string[];
}

class App {
  constructor(private config: AppConfig) {}
  
  initialize(): Promise<void> {
    return this.setupFeatures();
  }
}`,
        explanation: 'TypeScriptによる型安全な実装'
      },
      python: {
        language: 'python',
        code: `# ${repository.name} - Python Implementation
class Application:
    def __init__(self, name: str):
        self.name = name
        self.features = []
    
    def initialize(self) -> None:
        """Initialize the application with core features"""
        self.setup_logging()
        self.load_configuration()
        print(f"{self.name} initialized successfully!")`,
        explanation: 'Pythonによるクリーンな実装アプローチ'
      }
    }
    
    return (snippets as any)[language] || snippets.javascript
  }

  private generateArchitectureChart(repository: RepositoryData) {
    return {
      type: 'bar' as const,
      title: '技術構成',
      data: Object.entries(repository.languages).map(([, bytes]) => bytes),
      labels: Object.keys(repository.languages)
    }
  }

  private generateAnalysisChart(repository: RepositoryData) {
    return {
      type: 'pie' as const,
      title: 'プロジェクト分析',
      data: [repository.stars, repository.forks, repository.commits.length],
      labels: ['Stars', 'Forks', 'Commits']
    }
  }

  private getLocalizedTitle(key: string, language: 'ja' | 'en' | 'zh'): string {
    const titles = {
      ja: {
        why: 'なぜ作ったのか',
        challenge: '解決したい課題',
        approach: 'アプローチ',
        architecture: '技術アーキテクチャ',
        results: '成果と効果',
        next: '今後の展開',
        thanks: 'ありがとうございました',
        github_url: 'GitHub URL:'
      },
      en: {
        why: 'Why We Built This',
        challenge: 'The Challenge',
        approach: 'Our Approach',
        architecture: 'Technical Architecture',
        results: 'Results & Impact',
        next: 'What\'s Next',
        thanks: 'Thank You',
        github_url: 'GitHub URL:'
      },
      zh: {
        why: '为什么构建这个',
        challenge: '面临的挑战',
        approach: '我们的方法',
        architecture: '技术架构',
        results: '结果与影响',
        next: '下一步计划',
        thanks: '谢谢',
        github_url: 'GitHub URL:'
      }
    }
    return (titles as any)[language][key] || (titles as any).ja[key]
  }

  private getLocalizedContent(key: string, language: 'ja' | 'en' | 'zh'): string {
    const content = {
      ja: {
        github_url: 'GitHub URL:'
      },
      en: {
        github_url: 'GitHub URL:'
      },
      zh: {
        github_url: 'GitHub URL:'
      }
    }
    return (content as any)[language][key] || (content as any).ja[key]
  }

  private formatDescription(description: string, language: 'ja' | 'en' | 'zh'): string {
    if (!description) {
      const defaults = {
        ja: 'イノベーティブなソフトウェアプロジェクト',
        en: 'An innovative software project',
        zh: '创新的软件项目'
      }
      return defaults[language]
    }
    return description
  }

  private formatResultBullets(bullets: string[], repository: RepositoryData): string[] {
    return [
      bullets[0] || `${repository.commits.length}回の開発イテレーション`,
      `${repository.stars}個のGitHubスター獲得`,
      `${Object.keys(repository.languages).length}つの技術を統合`,
      bullets[1] || '安定した動作を実現'
    ].slice(0, 3)
  }

  private generateMethodsBullets(repository: RepositoryData): string[] {
    return [
      `主要言語: ${repository.language}`,
      `依存関係: ${repository.dependencies.length}個のパッケージ`,
      `ファイル構成: ${repository.files.length}個のファイル`,
      `開発期間: ${this.calculateDevelopmentPeriod(repository)}`
    ]
  }

  private calculateDevelopmentPeriod(repository: RepositoryData): string {
    const start = new Date(repository.createdAt)
    const end = new Date(repository.updatedAt)
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return `約${months}ヶ月`
  }

  private identifyLimitations(repository: RepositoryData): string {
    if (repository.files.filter(f => f.path.includes('test')).length === 0) {
      return 'テストカバレッジの拡充が必要'
    }
    if (repository.dependencies.length > 20) {
      return '依存関係の最適化が必要'
    }
    return '特定の環境への依存'
  }

  private identifyApplications(repository: RepositoryData): string {
    if (repository.language === 'JavaScript' || repository.language === 'TypeScript') {
      return 'Web アプリケーション開発全般'
    }
    if (repository.language === 'Python') {
      return 'データ分析・機械学習分野'
    }
    return '同様のプロジェクト開発'
  }

  private generateSpeakerNotes(type: string, data: any, _language: 'ja' | 'en' | 'zh'): string {
    const notes = {
      title: `プロジェクト「${data.name}」の概要を説明します。このプロジェクトは${data.language}で開発され、${data.description}を目的としています。`,
      why: `なぜこのプロジェクトを始めたのかについて説明します。${data.content}`,
      problem: `解決したい課題について詳しく説明します。${data.content}`,
      approach: `採用したアプローチと技術的な判断について説明します。${data.content}`,
      results: `プロジェクトの成果と実際の効果について説明します。${data.content}`,
      next: `今後の展開と改善計画について説明します。${data.content}`
    }
    return (notes as any)[type] || `${type}について説明します。`
  }

  private generateArchitectureNotes(repository: RepositoryData, _language: 'ja' | 'en' | 'zh'): string {
    return `技術アーキテクチャについて説明します。主要言語は${repository.language}で、${Object.keys(repository.languages).length}種類の技術を組み合わせています。`
  }

  private generateImplementationNotes(repository: RepositoryData, _language: 'ja' | 'en' | 'zh'): string {
    return `実装の詳細について説明します。${repository.language}を使用し、${repository.files.length}個のファイルで構成されています。`
  }

  private generateAnalysisNotes(repository: RepositoryData, _language: 'ja' | 'en' | 'zh'): string {
    return `プロジェクトの分析結果を説明します。${repository.stars}個のスター、${repository.forks}個のフォーク、${repository.commits.length}回のコミットがあります。`
  }

  private generateDiscussionNotes(_repository: RepositoryData, _language: 'ja' | 'en' | 'zh'): string {
    return `プロジェクトの制約と今後の課題について議論します。現在の制約と将来の発展可能性を説明します。`
  }

  private generateConclusionNotes(repository: RepositoryData, _language: 'ja' | 'en' | 'zh'): string {
    return `プレゼンテーションのまとめです。${repository.name}プロジェクトの価値と今後の展望について強調します。`
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}