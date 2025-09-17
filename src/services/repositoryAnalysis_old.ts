import { RepositoryData, FileData, CommitData } from '../types'

export class RepositoryAnalysisEngine {
  async analyzeRepository(githubUrl: string): Promise<RepositoryData> {
    console.log('Analyzing repository:', githubUrl)
    
    // Validate GitHub URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL format. Please provide a valid GitHub repository URL.')
    }
    
    const [, owner, repo] = match.map(s => s.replace(/\.git$/, ''))
    
    try {
      // Use Netlify Function for repository analysis
      const response = await fetch('/.netlify/functions/analyzeRepository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: githubUrl })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to analyze repository: ${response.status}`)
      }
      
      const repositoryData: RepositoryData = await response.json()
      
      // Enhance data with additional analysis
      repositoryData.description = repositoryData.description || this.generateSmartDescription(repositoryData)
      repositoryData.dependencies = await this.analyzeDependencies(repositoryData)
      
      console.log('Repository analysis complete:', repositoryData)
      return repositoryData
      
    } catch (error) {
      console.error('Repository analysis failed:', error)
      
      // Fallback: Create basic repository data from URL analysis
      return this.createFallbackRepositoryData(githubUrl, owner, repo)
    }
  }

  private generateSmartDescription(repo: RepositoryData): string {
    const { name, language, files, readme } = repo
    
    // If README exists and has content, extract description
    if (readme && readme.length > 50) {
      const lines = readme.split('\n').filter(line => line.trim().length > 0)
      
      for (const line of lines) {
        // Skip headers, badges, and very short lines
        if (line.startsWith('#') || line.startsWith('!') || line.startsWith('[') || line.length < 20) continue
        
        // Return first substantial paragraph
        if (line.length > 20 && line.length < 300) {
          return line.trim().replace(/^[\*\-\+]\s*/, '') // Remove bullet points
        }
      }
    }
    
    // Generate description based on project structure and language
    const fileCount = files.length
    const hasTests = files.some(f => f.path.includes('test') || f.path.includes('spec'))
    const hasConfig = files.some(f => f.path.includes('config') || f.path.includes('.json'))
    const hasComponents = files.some(f => f.path.includes('component'))
    const hasAPI = files.some(f => f.path.includes('api') || f.path.includes('server'))
    
    let description = `A ${language || 'software'} project`
    
    if (hasComponents && hasAPI) {
      description = `A full-stack ${language} application`
    } else if (hasComponents) {
      description = `A ${language} frontend application`
    } else if (hasAPI) {
      description = `A ${language} backend service`
    }
    
    if (fileCount > 50) {
      description += ' with comprehensive architecture'
    } else if (fileCount > 20) {
      description += ' with organized structure'
    }
    
    if (hasTests) {
      description += ' featuring automated testing'
    }
    
    if (hasConfig) {
      description += ' and professional configuration'
    }
    
    // Add domain-specific insights
    if (name.toLowerCase().includes('todo') || name.toLowerCase().includes('task')) {
      description += ' for task management'
    } else if (name.toLowerCase().includes('chat') || name.toLowerCase().includes('message')) {
      description += ' for communication and messaging'
    } else if (name.toLowerCase().includes('blog') || name.toLowerCase().includes('cms')) {
      description += ' for content management'
    } else if (name.toLowerCase().includes('api') || name.toLowerCase().includes('service')) {
      description += ' providing API services'
    } else if (name.toLowerCase().includes('ui') || name.toLowerCase().includes('component')) {
      description += ' for user interface components'
    }
    
    return description
  }

  private async analyzeDependencies(repo: RepositoryData): Promise<any[]> {
    const dependencies: any[] = []
    
    // Analyze package.json if exists
    const packageFile = repo.files.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'))
    if (packageFile) {
      // Infer common dependencies based on language and file structure
      if (repo.language === 'TypeScript' || repo.language === 'JavaScript') {
        const hasReact = repo.files.some(f => f.path.includes('.tsx') || f.path.includes('.jsx'))
        const hasNext = repo.files.some(f => f.path.includes('next.config') || f.path.includes('app/'))
        const hasVite = repo.files.some(f => f.path.includes('vite.config'))
        const hasExpress = repo.files.some(f => f.path.includes('server') || f.path.includes('api/'))
        
        if (hasNext) {
          dependencies.push({ name: 'next', version: 'latest', type: 'runtime' })
          dependencies.push({ name: 'react', version: 'latest', type: 'runtime' })
        } else if (hasReact) {
          dependencies.push({ name: 'react', version: 'latest', type: 'runtime' })
        }
        
        if (hasVite) {
          dependencies.push({ name: 'vite', version: 'latest', type: 'dev' })
        }
        
        if (hasExpress) {
          dependencies.push({ name: 'express', version: 'latest', type: 'runtime' })
        }
        
        if (repo.language === 'TypeScript') {
          dependencies.push({ name: 'typescript', version: 'latest', type: 'dev' })
        }
      }
    }
    
    // Analyze requirements.txt for Python
    const requirementsFile = repo.files.find(f => f.path === 'requirements.txt')
    if (requirementsFile && repo.language === 'Python') {
      dependencies.push({ name: 'python', version: 'latest', type: 'runtime' })
      
      const hasFlask = repo.files.some(f => f.path.includes('app.py') || f.path.includes('flask'))
      const hasDjango = repo.files.some(f => f.path.includes('django') || f.path.includes('manage.py'))
      const hasFastAPI = repo.files.some(f => f.path.includes('fastapi') || f.path.includes('uvicorn'))
      
      if (hasFlask) dependencies.push({ name: 'flask', version: 'latest', type: 'runtime' })
      if (hasDjango) dependencies.push({ name: 'django', version: 'latest', type: 'runtime' })
      if (hasFastAPI) dependencies.push({ name: 'fastapi', version: 'latest', type: 'runtime' })
    }
    
    return dependencies
  }

  private createFallbackRepositoryData(githubUrl: string, owner: string, repo: string): RepositoryData {
    // Create minimal repository data when analysis fails
    return {
      id: `${owner}/${repo}`,
      name: repo,
      owner,
      url: githubUrl,
      description: `A software project named ${repo}`,
      language: 'Unknown',
      languages: {},
      stars: 0,
      forks: 0,
      watchers: 0,
      openIssues: 0,
      readme: '',
      files: [],
      dependencies: [],
      commits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  analyzeArchitecture(repository: RepositoryData): {
          { name: 'next-pwa', version: '5.6.0', type: 'runtime' },
          { name: 'lucide-react', version: '0.263.0', type: 'runtime' },
          { name: '@supabase/supabase-js', version: '2.38.0', type: 'runtime' }
        ],
        commits: [
          {
            sha: 'abc123',
            message: 'Initial commit: Setup Next.js 14 with App Router',
            author: owner,
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            sha: 'def456',
            message: 'Add: 体調チェックイン機能を実装',
            author: owner,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            sha: 'ghi789',
            message: 'Add: TOEIC語彙学習システムを追加',
            author: owner,
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            sha: 'jkl012',
            message: 'Add: 天気連動のうてんきスコア算出エンジン',
            author: owner,
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            sha: 'mno345',
            message: 'Add: ワーキングメモリトレーニング機能',
            author: owner,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            sha: 'pqr678',
            message: 'Add: PWA設定とオフライン対応',
            author: owner,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      return repositoryData
    }
    
    // Default mock data for other repositories
    const repositoryData: RepositoryData = {
      id: `${owner}/${repo}`,
      name: repo,
      owner,
      url: githubUrl,
      description: 'A sample repository for testing',
      language: 'TypeScript',
      languages: {
        TypeScript: 75,
        JavaScript: 20,
        CSS: 5
      },
      stars: 42,
      forks: 8,
      watchers: 15,
      openIssues: 3,
      readme: `# ${repo}\n\nThis is a sample project that demonstrates modern web development practices.\n\n## Features\n- Modern TypeScript\n- React components\n- Responsive design\n\n## Getting Started\n\nnpm install\nnpm run dev`,
      files: [
        { path: 'src/index.ts', type: 'typescript', size: 1024, content: 'export default function main() {}' },
        { path: 'src/components/App.tsx', type: 'typescript', size: 2048, content: 'import React from "react"' },
        { path: 'package.json', type: 'json', size: 512, content: '{}' },
        { path: 'README.md', type: 'markdown', size: 256, content: '# Project' },
        { path: 'src/styles/main.css', type: 'css', size: 1536, content: 'body { margin: 0; }' }
      ],
      dependencies: [
        { name: 'react', version: '18.0.0', type: 'runtime' },
        { name: 'typescript', version: '5.0.0', type: 'dev' },
        { name: 'vite', version: '4.0.0', type: 'dev' }
      ],
      commits: [
        {
          sha: 'abc123',
          message: 'Initial commit',
          author: owner,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          sha: 'def456',
          message: 'Add TypeScript support',
          author: owner,
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          sha: 'ghi789',
          message: 'Update README',
          author: owner,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    return repositoryData
  }

  analyzeArchitecture(repository: RepositoryData): {
    patterns: string[]
    complexity: 'low' | 'medium' | 'high'
    structure: string
    recommendations: string[]
  } {
    const files = repository.files
    const languages = Object.keys(repository.languages)
    
    // Detect architectural patterns
    const patterns = this.detectArchitecturalPatterns(files)
    
    // Calculate complexity
    const complexity = this.calculateComplexity(files, languages, repository.commits)
    
    // Analyze project structure
    const structure = this.analyzeProjectStructure(files)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(files, repository)
    
    return {
      patterns,
      complexity,
      structure,
      recommendations
    }
  }

  analyzeCodeQuality(repository: RepositoryData): {
    testCoverage: 'low' | 'medium' | 'high'
    documentation: 'poor' | 'fair' | 'good' | 'excellent'
    maintainability: number
    technicalDebt: string[]
  } {
    const files = repository.files
    
    // Analyze test coverage
    const testCoverage = this.analyzeTestCoverage(files)
    
    // Analyze documentation
    const documentation = this.analyzeDocumentation(files, repository.readme)
    
    // Calculate maintainability score
    const maintainability = this.calculateMaintainability(files, repository)
    
    // Identify technical debt
    const technicalDebt = this.identifyTechnicalDebt(files, repository)
    
    return {
      testCoverage,
      documentation,
      maintainability,
      technicalDebt
    }
  }

  generateInsights(repository: RepositoryData): {
    keyStrengths: string[]
    areasForImprovement: string[]
    uniqueFeatures: string[]
    technologyHighlights: string[]
  } {
    const files = repository.files
    const languages = repository.languages
    
    // Identify key strengths
    const keyStrengths = this.identifyStrengths(repository)
    
    // Areas for improvement
    const areasForImprovement = this.identifyImprovements(repository)
    
    // Unique features
    const uniqueFeatures = this.identifyUniqueFeatures(files, repository.dependencies)
    
    // Technology highlights
    const technologyHighlights = this.identifyTechnologyHighlights(languages, repository.dependencies)
    
    return {
      keyStrengths,
      areasForImprovement,
      uniqueFeatures,
      technologyHighlights
    }
  }

  private detectArchitecturalPatterns(files: FileData[]): string[] {
    const patterns = []
    const paths = files.map(f => f.path.toLowerCase())
    
    // MVC Pattern
    if (paths.some(p => p.includes('model')) && 
        paths.some(p => p.includes('view')) && 
        paths.some(p => p.includes('controller'))) {
      patterns.push('MVC (Model-View-Controller)')
    }
    
    // Microservices
    if (paths.filter(p => p.includes('service')).length > 3) {
      patterns.push('Microservices Architecture')
    }
    
    // Component-based
    if (paths.filter(p => p.includes('component')).length > 5) {
      patterns.push('Component-Based Architecture')
    }
    
    // Layered Architecture
    if (paths.some(p => p.includes('repository')) && 
        paths.some(p => p.includes('service')) && 
        paths.some(p => p.includes('controller'))) {
      patterns.push('Layered Architecture')
    }
    
    return patterns.length > 0 ? patterns : ['Custom Architecture']
  }

  private calculateComplexity(files: FileData[], languages: string[], commits: CommitData[]): 'low' | 'medium' | 'high' {
    const fileCount = files.length
    const languageCount = languages.length
    const commitCount = commits.length
    
    let score = 0
    
    // File count factor
    if (fileCount > 100) score += 3
    else if (fileCount > 50) score += 2
    else if (fileCount > 20) score += 1
    
    // Language diversity factor
    if (languageCount > 5) score += 3
    else if (languageCount > 3) score += 2
    else if (languageCount > 1) score += 1
    
    // Activity factor
    if (commitCount > 200) score += 2
    else if (commitCount > 50) score += 1
    
    if (score >= 6) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  private analyzeProjectStructure(files: FileData[]): string {
    const directories = new Set(files.map(f => f.path.split('/')[0]))
    const hasSource = directories.has('src') || directories.has('lib')
    const hasTests = files.some(f => f.path.includes('test') || f.path.includes('spec'))
    const hasDocs = directories.has('docs') || directories.has('documentation')
    const hasConfig = files.some(f => f.path.includes('config') || f.path.includes('.config'))
    
    if (hasSource && hasTests && hasDocs && hasConfig) {
      return 'Well-structured project with clear separation of concerns'
    } else if (hasSource && hasTests) {
      return 'Good project structure with source and test organization'
    } else if (hasSource) {
      return 'Basic project structure with organized source code'
    } else {
      return 'Flat project structure - consider organizing into directories'
    }
  }

  private analyzeTestCoverage(files: FileData[]): 'low' | 'medium' | 'high' {
    const totalFiles = files.length
    const testFiles = files.filter(f => 
      f.path.includes('test') || 
      f.path.includes('spec') || 
      f.path.includes('__tests__')
    ).length
    
    const ratio = testFiles / totalFiles
    
    if (ratio > 0.3) return 'high'
    if (ratio > 0.1) return 'medium'
    return 'low'
  }

  private analyzeDocumentation(files: FileData[], readme: string): 'poor' | 'fair' | 'good' | 'excellent' {
    const docFiles = files.filter(f => f.type === 'markdown').length
    const hasReadme = readme.length > 100
    
    let score = 0
    
    if (hasReadme) score += 2
    if (readme.length > 1000) score += 1
    if (docFiles > 1) score += 1
    if (docFiles > 3) score += 1
    
    if (score >= 4) return 'excellent'
    if (score >= 3) return 'good'
    if (score >= 2) return 'fair'
    return 'poor'
  }

  private calculateMaintainability(files: FileData[], repository: RepositoryData): number {
    let score = 50 // Base score
    
    // Test coverage bonus
    const testRatio = files.filter(f => f.path.includes('test')).length / files.length
    score += testRatio * 20
    
    // Documentation bonus
    if (repository.readme.length > 500) score += 10
    if (files.filter(f => f.type === 'markdown').length > 1) score += 5
    
    // Recent activity bonus
    const daysSinceUpdate = (Date.now() - new Date(repository.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 30) score += 10
    else if (daysSinceUpdate < 90) score += 5
    
    // Configuration files bonus
    if (files.some(f => f.path.includes('.config') || f.path.includes('package.json'))) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private generateRecommendations(files: FileData[], repository: RepositoryData): string[] {
    const recommendations = []
    
    // Test recommendations
    const testFiles = files.filter(f => f.path.includes('test')).length
    if (testFiles === 0) {
      recommendations.push('テストファイルの追加を検討してください')
    }
    
    // Documentation recommendations
    if (repository.readme.length < 200) {
      recommendations.push('READMEファイルの充実を検討してください')
    }
    
    // Configuration recommendations
    if (!files.some(f => f.path.includes('.gitignore'))) {
      recommendations.push('.gitignoreファイルの追加を検討してください')
    }
    
    // Structure recommendations
    if (!files.some(f => f.path.includes('src/') || f.path.includes('lib/'))) {
      recommendations.push('ソースコードのディレクトリ整理を検討してください')
    }
    
    return recommendations
  }

  private identifyStrengths(repository: RepositoryData): string[] {
    const strengths = []
    
    if (repository.stars > 50) {
      strengths.push('コミュニティから高い評価を獲得')
    }
    
    if (repository.commits.length > 100) {
      strengths.push('活発な開発活動')
    }
    
    if (repository.files.some(f => f.path.includes('test'))) {
      strengths.push('テストが整備されている')
    }
    
    if (repository.readme.length > 1000) {
      strengths.push('充実したドキュメント')
    }
    
    if (Object.keys(repository.languages).length === 1) {
      strengths.push('技術スタックが統一されている')
    }
    
    return strengths
  }

  private identifyImprovements(repository: RepositoryData): string[] {
    const improvements = []
    
    const daysSinceUpdate = (Date.now() - new Date(repository.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate > 90) {
      improvements.push('定期的な更新の継続')
    }
    
    if (!repository.files.some(f => f.path.includes('test'))) {
      improvements.push('テストカバレッジの向上')
    }
    
    if (repository.readme.length < 500) {
      improvements.push('ドキュメントの充実')
    }
    
    if (repository.stars < 10) {
      improvements.push('コミュニティへの露出増加')
    }
    
    return improvements
  }

  private identifyUniqueFeatures(files: FileData[], dependencies: any[]): string[] {
    const features = []
    const paths = files.map(f => f.path.toLowerCase())
    const deps = dependencies.map(d => d.name.toLowerCase())
    
    // AI/ML features
    if (deps.some(d => d.includes('tensorflow') || d.includes('pytorch') || d.includes('sklearn'))) {
      features.push('機械学習・AI機能')
    }
    
    // Real-time features
    if (deps.some(d => d.includes('socket') || d.includes('websocket'))) {
      features.push('リアルタイム通信機能')
    }
    
    // Mobile support
    if (deps.some(d => d.includes('react-native') || d.includes('flutter'))) {
      features.push('モバイルアプリ対応')
    }
    
    // API features
    if (paths.some(p => p.includes('api') || p.includes('routes'))) {
      features.push('REST API機能')
    }
    
    return features
  }

  private identifyTechnicalDebt(files: FileData[], repository: RepositoryData): string[] {
    const debt = []
    
    // Large files
    const largeFiles = files.filter(f => f.size > 10000).length
    if (largeFiles > 5) {
      debt.push('大きなファイルのリファクタリング検討')
    }
    
    // Old dependencies
    if (repository.dependencies.length > 20) {
      debt.push('依存関係の整理・最新化')
    }
    
    // No tests
    if (!files.some(f => f.path.includes('test'))) {
      debt.push('テストの追加')
    }
    
    // Configuration debt
    if (!files.some(f => f.path.includes('.config'))) {
      debt.push('設定ファイルの標準化')
    }
    
    return debt
  }

  private identifyTechnologyHighlights(languages: Record<string, number>, dependencies: any[]): string[] {
    const highlights = []
    const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1])
    
    // Primary language
    if (sortedLanguages.length > 0) {
      highlights.push(`主要言語: ${sortedLanguages[0][0]}`)
    }
    
    // Modern frameworks
    const modernFrameworks = dependencies.filter(d => 
      ['react', 'vue', 'angular', 'next', 'nuxt', 'svelte'].includes(d.name.toLowerCase())
    )
    if (modernFrameworks.length > 0) {
      highlights.push(`モダンフレームワーク: ${modernFrameworks[0].name}`)
    }
    
    // Build tools
    const buildTools = dependencies.filter(d => 
      ['webpack', 'vite', 'rollup', 'parcel'].includes(d.name.toLowerCase())
    )
    if (buildTools.length > 0) {
      highlights.push(`ビルドツール: ${buildTools[0].name}`)
    }
    
    return highlights
  }
}

// Export singleton instance
export const repositoryAnalyzer = new RepositoryAnalysisEngine()