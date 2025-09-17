import { RepositoryData, StoryStructure, StorySection } from '../types'

export class StoryGeneratorService {
  async generateStory(
    repository: RepositoryData, 
    mode: 'ted' | 'imrad' = 'ted',
    language: 'ja' | 'en' | 'zh' = 'ja'
  ): Promise<StoryStructure> {
    console.log(`Generating ${mode} story in ${language} for:`, repository.name)
    
    // Analyze repository deeply for story generation
    const insights = this.analyzeRepositoryInsights(repository)
    
    return {
      why: this.generateWhySection(repository, language, insights),
      problem: this.generateProblemSection(repository, language, insights),
      approach: this.generateApproachSection(repository, language, insights),
      result: this.generateResultSection(repository, language, insights),
      next: this.generateNextSection(repository, language, insights)
    }
  }

  private analyzeRepositoryInsights(repo: RepositoryData) {
    const { files, language, languages, readme, dependencies, commits, 
            languageStats, architectureAnalysis, designPatterns, frameworkAnalysis } = repo
    
    // Use enhanced analysis if available
    const techStack = frameworkAnalysis ? this.formatTechStackFromAnalysis(frameworkAnalysis) 
                                       : this.analyzeTechStack(files, dependencies, language)
    const architecture = architectureAnalysis?.pattern || this.analyzeArchitecture(files)
    const patterns = designPatterns || this.extractDesignPatterns(files)
    const langDistribution = languageStats || this.analyzeLangDistribution(languages)
    
    const complexity = this.analyzeComplexity(files, languages, commits)
    const maturity = this.analyzeProjectMaturity(repo)
    
    // Content analysis
    const purpose = this.inferProjectPurpose(repo.name, repo.description, readme, files)
    const uniqueFeatures = this.identifyUniqueFeatures(files, dependencies, readme)
    const challenges = this.identifyTechnicalChallenges(files, techStack, complexity)
    
    return {
      techStack,
      architecture,
      patterns,
      langDistribution,
      complexity,
      maturity,
      purpose,
      uniqueFeatures,
      challenges,
      frameworkBreakdown: frameworkAnalysis
    }
  }

  private formatTechStackFromAnalysis(analysis: any) {
    return {
      frontend: analysis.frontend,
      backend: analysis.backend,
      database: analysis.database,
      testing: analysis.testing,
      tools: analysis.buildTools,
      frameworks: [...analysis.frontend, ...analysis.backend]
    }
  }

  private analyzeLangDistribution(languages: Record<string, number>) {
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
    return Object.entries(languages).map(([lang, bytes]) => ({
      language: lang,
      percentage: Math.round((bytes / total) * 100)
    })).sort((a, b) => b.percentage - a.percentage)
  }

  private extractDesignPatterns(files: any[]) {
    const patterns: string[] = []
    const paths = files.map(f => f.path).join(' ').toLowerCase()
    
    if (paths.includes('factory')) patterns.push('Factory Pattern')
    if (paths.includes('observer') || paths.includes('event')) patterns.push('Observer Pattern')
    if (paths.includes('singleton')) patterns.push('Singleton Pattern')
    if (paths.includes('repository')) patterns.push('Repository Pattern')
    if (paths.includes('service')) patterns.push('Service Pattern')
    if (paths.includes('hook') || paths.includes('use')) patterns.push('Hooks Pattern')
    
    return patterns
  }

  private analyzeTechStack(files: any[], _dependencies: any[], _primaryLanguage: string) {
    const stack = {
      frontend: [],
      backend: [],
      database: [],
      tools: [],
      frameworks: []
    } as any
    
    // Analyze from files
    const hasReact = files.some(f => f.path.includes('.jsx') || f.path.includes('.tsx') || f.path.includes('react'))
    const hasVue = files.some(f => f.path.includes('.vue'))
    const hasAngular = files.some(f => f.path.includes('angular') || f.path.includes('.component.'))
    const hasNext = files.some(f => f.path.includes('next.config') || f.path.includes('app/page.'))
    const hasNuxt = files.some(f => f.path.includes('nuxt.config'))
    
    const hasExpress = files.some(f => f.path.includes('server') || f.path.includes('app.js'))
    const hasFlask = files.some(f => f.path.includes('app.py') || f.path.includes('flask'))
    const hasDjango = files.some(f => f.path.includes('manage.py') || f.path.includes('django'))
    const hasSpring = files.some(f => f.path.includes('spring') || f.path.includes('.java'))
    
    const hasSQL = files.some(f => f.path.includes('.sql') || f.path.includes('database'))
    const hasMongo = files.some(f => f.path.includes('mongo') || f.path.includes('mongoose'))
    const hasRedis = files.some(f => f.path.includes('redis'))
    
    // Frontend frameworks
    if (hasNext) stack.frameworks.push('Next.js')
    else if (hasReact) stack.frontend.push('React')
    if (hasVue) stack.frontend.push('Vue.js')
    if (hasNuxt) stack.frameworks.push('Nuxt.js')
    if (hasAngular) stack.frontend.push('Angular')
    
    // Backend frameworks
    if (hasExpress) stack.backend.push('Express.js')
    if (hasFlask) stack.backend.push('Flask')
    if (hasDjango) stack.backend.push('Django')
    if (hasSpring) stack.backend.push('Spring Boot')
    
    // Databases
    if (hasSQL) stack.database.push('SQL Database')
    if (hasMongo) stack.database.push('MongoDB')
    if (hasRedis) stack.database.push('Redis')
    
    // Tools and build systems
    if (files.some(f => f.path.includes('webpack'))) stack.tools.push('Webpack')
    if (files.some(f => f.path.includes('vite'))) stack.tools.push('Vite')
    if (files.some(f => f.path.includes('docker'))) stack.tools.push('Docker')
    if (files.some(f => f.path.includes('.github'))) stack.tools.push('GitHub Actions')
    
    return stack
  }

  private analyzeArchitecture(files: any[]) {
    const patterns = []
    
    // Component-based architecture
    if (files.filter(f => f.path.includes('component')).length > 5) {
      patterns.push('Component-Based Architecture')
    }
    
    // Layered architecture
    if (files.some(f => f.path.includes('controller')) && 
        files.some(f => f.path.includes('service')) && 
        files.some(f => f.path.includes('model'))) {
      patterns.push('Layered Architecture (MVC)')
    }
    
    // Microservices
    if (files.filter(f => f.path.includes('service')).length > 3) {
      patterns.push('Service-Oriented Architecture')
    }
    
    // Modular structure
    if (files.some(f => f.path.includes('module')) || 
        files.filter(f => f.path.split('/').length > 3).length > files.length * 0.5) {
      patterns.push('Modular Design')
    }
    
    return patterns.length > 0 ? patterns : ['Custom Architecture']
  }

  private analyzeComplexity(files: any[], languages: any, commits: any[]) {
    let score = 0
    
    // File count complexity
    if (files.length > 100) score += 3
    else if (files.length > 50) score += 2
    else if (files.length > 20) score += 1
    
    // Language diversity
    const langCount = Object.keys(languages).length
    if (langCount > 5) score += 3
    else if (langCount > 3) score += 2
    else if (langCount > 1) score += 1
    
    // Development activity
    if (commits.length > 100) score += 2
    else if (commits.length > 50) score += 1
    
    if (score >= 6) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  private analyzeProjectMaturity(repo: RepositoryData) {
    const { files, readme, commits, stars } = repo
    
    let maturityScore = 0
    
    // Documentation
    if (readme.length > 1000) maturityScore += 2
    else if (readme.length > 500) maturityScore += 1
    
    // Testing
    if (files.some(f => f.path.includes('test') || f.path.includes('spec'))) maturityScore += 2
    
    // Configuration
    if (files.some(f => f.path.includes('.config') || f.path.includes('package.json'))) maturityScore += 1
    
    // Community engagement
    if (stars > 50) maturityScore += 2
    else if (stars > 10) maturityScore += 1
    
    // Development activity
    if (commits.length > 50) maturityScore += 1
    
    if (maturityScore >= 6) return 'mature'
    if (maturityScore >= 3) return 'developing'
    return 'early'
  }

  private inferProjectPurpose(name: string, description: string, readme: string, files: any[]) {
    const content = `${name} ${description} ${readme}`.toLowerCase()
    
    // Domain classification
    if (content.includes('api') || content.includes('server') || content.includes('backend')) {
      return 'backend_service'
    }
    if (content.includes('web') || content.includes('app') || content.includes('frontend')) {
      return 'web_application'
    }
    if (content.includes('mobile') || content.includes('ios') || content.includes('android')) {
      return 'mobile_application'
    }
    if (content.includes('library') || content.includes('package') || content.includes('module')) {
      return 'library'
    }
    if (content.includes('tool') || content.includes('cli') || content.includes('utility')) {
      return 'development_tool'
    }
    if (content.includes('game') || content.includes('entertainment')) {
      return 'game'
    }
    if (content.includes('data') || content.includes('analysis') || content.includes('ml') || content.includes('ai')) {
      return 'data_science'
    }
    
    // Fallback based on file structure
    if (files.some(f => f.path.includes('component') || f.path.includes('page'))) {
      return 'web_application'
    }
    if (files.some(f => f.path.includes('api') || f.path.includes('server'))) {
      return 'backend_service'
    }
    
    return 'software_project'
  }

  private identifyUniqueFeatures(files: any[], _dependencies: any[], readme: string) {
    const features = []
    
    // Technology-specific features
    if (files.some(f => f.path.includes('pwa') || f.path.includes('manifest'))) {
      features.push('Progressive Web App (PWA) capabilities')
    }
    if (files.some(f => f.path.includes('websocket') || f.path.includes('socket'))) {
      features.push('Real-time communication')
    }
    if (files.some(f => f.path.includes('auth') || f.path.includes('login'))) {
      features.push('User authentication system')
    }
    if (files.some(f => f.path.includes('payment') || f.path.includes('stripe'))) {
      features.push('Payment processing integration')
    }
    if (files.some(f => f.path.includes('upload') || f.path.includes('file'))) {
      features.push('File upload and management')
    }
    
    // README-based features
    const readmeLower = readme.toLowerCase()
    if (readmeLower.includes('machine learning') || readmeLower.includes('ai')) {
      features.push('Machine Learning integration')
    }
    if (readmeLower.includes('responsive') || readmeLower.includes('mobile')) {
      features.push('Responsive design')
    }
    if (readmeLower.includes('offline') || readmeLower.includes('cache')) {
      features.push('Offline functionality')
    }
    
    return features.length > 0 ? features : ['Custom functionality implementation']
  }

  private identifyTechnicalChallenges(files: any[], techStack: any, complexity: string) {
    const challenges = []
    
    // Complexity-based challenges
    if (complexity === 'high') {
      challenges.push('Managing complex codebase architecture')
    }
    
    // Multi-technology challenges
    if (techStack.frontend.length > 0 && techStack.backend.length > 0) {
      challenges.push('Full-stack development coordination')
    }
    
    // Performance challenges
    if (files.length > 100) {
      challenges.push('Large-scale application performance optimization')
    }
    
    // Testing challenges
    if (!files.some(f => f.path.includes('test'))) {
      challenges.push('Ensuring code quality without comprehensive testing')
    }
    
    return challenges.length > 0 ? challenges : ['Standard software development challenges']
  }

  private generateWhySection(repo: RepositoryData, _language: 'ja' | 'en' | 'zh', _insights: any): StorySection {
    const { projectPurpose } = repo
    
    if (projectPurpose) {
      // 引き込む質問から始める
      const engagingQuestion = projectPurpose.engagingQuestions[0] || 'このプロジェクトの背景について考えてみましょう'
      
      return {
        title: '🎯 なぜこのプロジェクトが生まれたのか',
        content: `
**${engagingQuestion}**

**市場の課題認識**
${projectPurpose.problemSolved}

**対象ユーザーのニーズ**
${projectPurpose.targetAudience}に向けて、従来のソリューションでは解決できない課題に取り組みました。

**提供価値の明確化**
${projectPurpose.businessValue}

**市場背景**
${projectPurpose.marketContext}という時代背景の中で、このプロジェクトの必要性が高まりました。

**技術的根拠**
• ${projectPurpose.technicalEvidence.join('\n• ')}
        `,
        bullets: [
          '市場背景の重要性',
          '技術的根拠の明確化', 
          'ターゲットユーザーのニーズ把握'
        ],
        visualElements: [
          { type: 'engaging-question', data: engagingQuestion },
          { type: 'problem-solution', data: projectPurpose.problemSolved },
          { type: 'target-audience', data: projectPurpose.targetAudience },
          { type: 'market-context', data: projectPurpose.marketContext },
          { type: 'visualization-suggestions', data: projectPurpose.visualizationSuggestions }
        ]
      }
    }
    
    // Fallback logic
    const primaryLanguage = repo.language
    const isSpecialProject = repo.name === 'notenkyo'

    let content = ''
    let bullets = []

    if (isSpecialProject) {
      content = `「のうてんきょ」は、ADHD・うつ傾向のある学習者が抱える深刻な課題に着目して開発されました。従来のTOEIC学習アプリは健常者向けに設計されており、認知特性や体調の変化を考慮していません。このギャップを埋めるため、心理学とHCI研究の知見を統合した革新的なPWAアプリを構想しました。`
      
      bullets = [
        '対象課題: ADHD・うつ傾向の学習者の学習効率低下',
        '既存ソリューションの限界: 健常者向け設計による非適応性',
        '独自アプローチ: 体調×天気連動の学習最適化システム',
        '技術的挑戦: PWAによるオフライン完結型学習環境'
      ]
    } else {
      // Default logic for other repositories
      if (repo.description && repo.description.length > 0) {
        content = `このプロジェクト「${repo.name}」は、${repo.description}を目的として開発されました。`
      } else {
        content = `このプロジェクト「${repo.name}」は、${primaryLanguage}を使用して開発されたソフトウェアです。`
      }

      bullets = [
        `主要言語: ${primaryLanguage}`,
        `開発開始: ${new Date(repo.createdAt).toLocaleDateString('ja-JP')}`,
        `最終更新: ${new Date(repo.updatedAt).toLocaleDateString('ja-JP')}`
      ]

      if (repo.stars > 10) {
        bullets.push(`GitHubスター数: ${repo.stars}個`)
      }
    }

    return {
      title: 'なぜこのプロジェクトを作ったのか',
      content,
      bullets
    }
  }

  private generateProblemSection(repo: RepositoryData, _language: 'ja' | 'en' | 'zh', _insights: any): StorySection {
    const hasTests = repo.files.some(file => file.path.includes('test') || file.path.includes('spec'))
    const hasDocs = repo.files.some(file => file.path.includes('doc') || file.type === 'markdown')
    const commitCount = repo.commits.length

    let content = ''
    let bullets = []

    // Analyze project complexity
    const languageCount = Object.keys(repo.languages).length
    const totalFiles = repo.files.length

    if (languageCount > 1) {
      content = '複数の技術スタックを統合する必要があり、'
    } else {
      content = `${repo.language}での開発において、`
    }

    if (totalFiles > 50) {
      content += '大規模なコードベースの管理と'
    } else {
      content += '効率的な開発と'
    }

    content += '保守性の確保が課題でした。'

    bullets = [
      `ファイル数: ${totalFiles}個`,
      `使用言語: ${languageCount}種類`,
      `コミット数: ${commitCount}回`
    ]

    if (!hasTests) {
      bullets.push('テストカバレッジの改善が必要')
    }

    if (!hasDocs) {
      bullets.push('ドキュメント整備が必要')
    }

    return {
      title: '解決したい課題',
      content,
      bullets
    }
  }

  private generateApproachSection(repo: RepositoryData, _language: 'ja' | 'en' | 'zh', _insights: any): StorySection {
    const { projectPurpose } = repo
    const architectureFiles = repo.files.filter(file => 
      file.path.includes('config') || 
      file.path.includes('src') ||
      file.path.includes('lib')
    )

    const frameworks = this.detectFrameworks(repo)
    const tools = this.detectTools(repo)

    // 引き込む質問
    const engagingQuestion = projectPurpose?.engagingQuestions[1] || '技術選択の背景は何でしょうか？'

    let content = `**${engagingQuestion}**

**技術選択の戦略**
${repo.language}をベースとして、`
    
    if (frameworks.length > 0) {
      content += `${frameworks.join('、')}などのフレームワークを活用し、`
    }

    if (tools.length > 0) {
      content += `${tools.join('、')}といったツールを組み合わせて開発を進めました。`
    } else {
      content += 'モダンな開発手法を取り入れながら実装しました。'
    }

    const bullets = [
      `主要技術: ${repo.language}`,
      ...frameworks.map(fw => `フレームワーク: ${fw}`),
      ...tools.map(tool => `ツール: ${tool}`),
      `アーキテクチャファイル数: ${architectureFiles.length}個`
    ]

    return {
      title: '🛠️ どのようにアプローチしたか',
      content,
      bullets,
      visualElements: [
        { type: 'engaging-question', data: engagingQuestion },
        { type: 'tech-stack', data: { language: repo.language, frameworks, tools } },
        { type: 'architecture', data: repo.architectureAnalysis }
      ]
    }
  }

  private generateResultSection(repo: RepositoryData, _language: 'ja' | 'en' | 'zh', _insights: any): StorySection {
    const { projectPurpose } = repo
    const lastCommitDate = new Date(repo.updatedAt)
    const daysSinceUpdate = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24))

    // 引き込む質問
    const engagingQuestion = projectPurpose?.engagingQuestions[2] || 'このプロジェクトはどんな成果を生み出しているでしょうか？'

    let content = `**${engagingQuestion}**

**開発活動の成果**`

    if (daysSinceUpdate < 7) {
      content += 'プロジェクトは活発に開発が続けられており、'
    } else if (daysSinceUpdate < 30) {
      content += 'プロジェクトは定期的に更新されており、'
    } else {
      content += 'プロジェクトは安定した状態に達しており、'
    }

    const hasReadme = repo.readme.length > 0
    if (hasReadme) {
      content += '充実したドキュメントとともに'
    }

    if (repo.stars > 10) {
      content += `GitHubで${repo.stars}個のスターを獲得するなど、`
    }

    content += '良好な成果を上げています。'

    // 具体的な成果指標
    if (projectPurpose) {
      content += `

**ビジネス価値の実現**
${projectPurpose.businessValue}

**技術的達成度**
• ${projectPurpose.technicalEvidence.join('\n• ')}`
    }

    const bullets = [
      `総コミット数: ${repo.commits.length}回`,
      `最終更新: ${daysSinceUpdate}日前`,
      `スター数: ${repo.stars}個`,
      `フォーク数: ${repo.forks}個`
    ]

    if (hasReadme) {
      bullets.push('詳細なREADMEを完備')
    }

    return {
      title: '📈 得られた結果',
      content,
      bullets,
      visualElements: [
        { type: 'engaging-question', data: engagingQuestion },
        { type: 'metrics', data: { stars: repo.stars, forks: repo.forks, commits: repo.commits.length } },
        { type: 'business-value', data: projectPurpose?.businessValue },
        { type: 'achievements', data: projectPurpose?.technicalEvidence }
      ]
    }
  }

  private generateNextSection(repo: RepositoryData, _language: 'ja' | 'en' | 'zh', _insights: any): StorySection {
    const { projectPurpose } = repo
    
    if (projectPurpose && projectPurpose.futureVision) {
      return {
        title: '🚀 これからの展望',
        content: `
**ビジョン**
${projectPurpose.futureVision}

**ロードマップ**
${projectPurpose.roadmap.map((phase, index) => `${index + 1}. ${phase}`).join('\n')}

**インパクト予測**
このプロジェクトが目指す未来では、${projectPurpose.targetAudience}の体験が根本的に変わります。

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
          { type: 'roadmap', data: projectPurpose.roadmap },
          { type: 'future-vision', data: projectPurpose.futureVision },
          { type: 'visualization-suggestions', data: projectPurpose.visualizationSuggestions }
        ]
      }
    }
    
    // Fallback for other projects
    const needsTests = !repo.files.some(file => file.path.includes('test'))
    const needsDocs = repo.files.filter(file => file.type === 'markdown').length < 3

    let content = '今後の展開として、'
    let bullets = []

    if (needsTests) {
      content += 'テストカバレッジの向上、'
      bullets.push('テスト自動化の強化')
    }

    if (needsDocs) {
      content += 'ドキュメントの拡充、'
      bullets.push('API ドキュメントの整備')
    }

    content += 'パフォーマンス最適化やユーザビリティの改善に取り組む予定です。'

    bullets.push(
      '継続的インテグレーションの改善',
      'セキュリティ監査の実施',
      'コミュニティからのフィードバック対応'
    )

    if (repo.forks > 5) {
      bullets.push('オープンソースコミュニティとの連携強化')
    }

    return {
      title: '🚀 次のステップ',
      content,
      bullets
    }
  }

  private detectFrameworks(repo: RepositoryData): string[] {
    const frameworks = []
    const dependencies = repo.dependencies.map(dep => dep.name.toLowerCase())
    const packageNames = dependencies.join(' ')

    if (packageNames.includes('react')) frameworks.push('React')
    if (packageNames.includes('vue')) frameworks.push('Vue.js')
    if (packageNames.includes('angular')) frameworks.push('Angular')
    if (packageNames.includes('express')) frameworks.push('Express.js')
    if (packageNames.includes('django')) frameworks.push('Django')
    if (packageNames.includes('flask')) frameworks.push('Flask')
    if (packageNames.includes('spring')) frameworks.push('Spring')
    if (packageNames.includes('rails')) frameworks.push('Ruby on Rails')

    return frameworks
  }

  private detectTools(repo: RepositoryData): string[] {
    const tools = []
    const dependencies = repo.dependencies.map(dep => dep.name.toLowerCase())
    const files = repo.files.map(file => file.path.toLowerCase())
    const allText = [...dependencies, ...files].join(' ')

    if (allText.includes('webpack')) tools.push('Webpack')
    if (allText.includes('vite')) tools.push('Vite')
    if (allText.includes('docker')) tools.push('Docker')
    if (allText.includes('jest')) tools.push('Jest')
    if (allText.includes('eslint')) tools.push('ESLint')
    if (allText.includes('prettier')) tools.push('Prettier')
    if (allText.includes('typescript')) tools.push('TypeScript')

    return tools
  }
}

// Export singleton instance
export const storyGenerator = new StoryGeneratorService()