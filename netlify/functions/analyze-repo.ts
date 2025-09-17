import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { Octokit } from 'octokit'

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { url, token } = JSON.parse(event.body || '{}')
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Repository URL is required' })
      }
    }

    const octokit = new Octokit({ auth: token })
    
    // Parse GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid GitHub URL' })
      }
    }

    const owner = match[1]
    const repo = match[2].replace(/\.git$/, '')

    // Get repository data
    const [repoData, languages, commits, tree] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listLanguages({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 50 }),
      octokit.rest.git.getTree({ 
        owner, 
        repo, 
        tree_sha: 'HEAD',
        recursive: 'true' 
      }).catch(() => ({ data: { tree: [] } }))
    ])

    // Get README
    let readme = ''
    try {
      const readmeData = await octokit.rest.repos.getReadme({ owner, repo })
      readme = Buffer.from(readmeData.data.content, 'base64').toString('utf-8')
    } catch (error) {
      console.warn('README not found')
    }

    // Analyze dependencies
    const dependencies = await analyzeDependencies(octokit, owner, repo)

    // Enhanced analysis
    const languageStats = await analyzeLanguageDistribution(octokit, owner, repo)
    const projectPurpose = await analyzeProjectPurpose(repoData.data, tree.data.tree, dependencies)
    const architectureAnalysis = await analyzeArchitecture(tree.data.tree)
    const designPatterns = await analyzeDesignPatterns(tree.data.tree)
    const frameworkAnalysis = await analyzeFrameworks(dependencies, tree.data.tree)

    const result = {
      url,
      name: repoData.data.name,
      description: repoData.data.description || '',
      language: repoData.data.language || 'Unknown',
      languages: languages.data,
      languageStats, // Add language distribution
      projectPurpose, // Add deep project analysis
      dependencies,
      commits: commits.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        date: commit.commit.author?.date || '',
        additions: 0,
        deletions: 0
      })),
      files: tree.data.tree
        .filter(item => item.type === 'blob')
        .map(file => ({
          path: file.path || '',
          type: getFileType(file.path || ''),
          size: file.size || 0,
          importance: calculateFileImportance(file.path || '')
        }))
        .slice(0, 100),
      readme,
      architectureAnalysis, // Add enhanced architecture analysis
      designPatterns, // Add design patterns
      frameworkAnalysis, // Add framework analysis
      screenshots: [],
      createdAt: repoData.data.created_at,
      updatedAt: repoData.data.updated_at,
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('Error analyzing repository:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to analyze repository',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

async function analyzeDependencies(octokit: Octokit, owner: string, repo: string) {
  const dependencies = []
  
  try {
    // Try package.json
    const packageJson = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'package.json'
    })

    if ('content' in packageJson.data) {
      const content = Buffer.from(packageJson.data.content, 'base64').toString('utf-8')
      const parsed = JSON.parse(content)
      
      if (parsed.dependencies) {
        Object.entries(parsed.dependencies).forEach(([name, version]) => {
          dependencies.push({
            name,
            version: version as string,
            type: 'dependency'
          })
        })
      }
    }
  } catch (error) {
    // Try requirements.txt
    try {
      const requirements = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'requirements.txt'
      })

      if ('content' in requirements.data) {
        const content = Buffer.from(requirements.data.content, 'base64').toString('utf-8')
        content.split('\n').forEach(line => {
          if (line.trim()) {
            const [name, version] = line.trim().split('==')
            dependencies.push({
              name,
              version: version || 'latest',
              type: 'dependency'
            })
          }
        })
      }
    } catch (pythonError) {
      console.warn('No dependency files found')
    }
  }

  return dependencies
}

function getFileType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'react',
    'tsx': 'react',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'md': 'markdown',
    'json': 'json',
    'yml': 'yaml',
    'yaml': 'yaml',
    'css': 'css',
    'html': 'html',
    'vue': 'vue',
    'go': 'go',
    'rs': 'rust'
  }
  return typeMap[extension || ''] || 'unknown'
}

function calculateFileImportance(path: string): number {
  if (path.match(/^(README|readme)/)) return 10
  if (path.match(/package\.json|requirements\.txt|pom\.xml|Cargo\.toml/)) return 9
  if (path.match(/src\/|lib\/|app\//)) return 8
  if (path.match(/test\/|spec\/|__tests__\//)) return 7
  if (path.match(/\.config\.|\.env|Dockerfile/)) return 6
  if (path.match(/docs\/|documentation\//)) return 5
  return 3
}

// Enhanced analysis functions
async function analyzeLanguageDistribution(octokit: Octokit, owner: string, repo: string) {
  try {
    const languages = await octokit.rest.repos.listLanguages({ owner, repo })
    const total = Object.values(languages.data).reduce((sum: number, bytes: unknown) => sum + (bytes as number), 0)
    
    return Object.entries(languages.data).map(([language, bytes]) => ({
      language,
      bytes: bytes as number,
      percentage: Math.round(((bytes as number) / total) * 100)
    })).sort((a, b) => b.percentage - a.percentage)
  } catch (error) {
    return []
  }
}

async function analyzeProjectPurpose(repoData: any, files: any[], dependencies: any[]): Promise<{
  primaryPurpose: string;
  problemSolved: string;
  targetAudience: string;
  businessValue: string;
  technicalEvidence: string[];
  marketContext: string;
  futureVision: string;
  roadmap: string[];
  engagingQuestions: string[];
  visualizationSuggestions: string[];
}> {
  const repoName = repoData.name.toLowerCase()
  const description = repoData.description || ''
  const paths = files.map(f => f.path || '').filter(Boolean)
  const depNames = dependencies.map(d => d.name?.toLowerCase() || '').filter(Boolean)
  
  // Analyze project type and domain
  let primaryPurpose = ''
  let problemSolved = ''
  let targetAudience = ''
  let businessValue = ''
  let technicalEvidence: string[] = []
  let marketContext = ''
  let futureVision = ''
  let roadmap: string[] = []
  let engagingQuestions: string[] = []
  let visualizationSuggestions: string[] = []
  
  // Domain-specific analysis
  if (repoName.includes('notenkyo') || repoName.includes('toeic') || description.toLowerCase().includes('toeic')) {
    primaryPurpose = 'ADHD・うつ傾向者向けTOEIC学習支援システム'
    problemSolved = '従来の学習アプリが健常者向けに設計されており、認知特性や体調変化を考慮していない課題'
    targetAudience = 'ADHD・うつ傾向のある英語学習者、メンタルヘルス配慮が必要な学習者'
    businessValue = '未開拓市場への特化サービス、アクセシビリティ向上、学習効率最適化'
    marketContext = 'メンタルヘルス意識の高まりと個別最適化学習の需要拡大'
    futureVision = '全学習者のニューロダイバーシティに配慮した包括的学習プラットフォームの実現'
    
    roadmap = [
      'Phase 1: TOEICに特化した体調連動学習システムの完成',
      'Phase 2: 他言語試験（英検、IELTS）への拡張',
      'Phase 3: AI学習アシスタントによる個別最適化強化',
      'Phase 4: メンタルヘルス専門機関との連携サービス開発',
      'Phase 5: グローバル展開とマルチプラットフォーム対応'
    ]
    
    engagingQuestions = [
      'あなたは体調や気分によって学習効率が変わることを感じたことはありますか？',
      'なぜ既存の学習アプリは「健常者」を前提に作られているのでしょうか？',
      '天気と学習効率の関係について考えたことはありますか？',
      'もし学習アプリがあなたの体調を理解してくれたら、どう変わると思いますか？'
    ]
    
    visualizationSuggestions = [
      'ADHD/うつ傾向学習者の学習効率グラフ（天気別）',
      '従来アプリ vs のてんきょ 比較チャート',
      '体調連動学習システムのフローダイアグラム',
      'ユーザージャーニーマップ（体調変化込み）',
      'メンタルヘルス市場の成長予測グラフ'
    ]
    
    technicalEvidence.push('PWA技術による完全オフライン対応で集中力維持')
    if (depNames.includes('react')) technicalEvidence.push('Reactによるインタラクティブな学習UI')
    if (paths.some(p => p.includes('service'))) technicalEvidence.push('Service Worker活用でオフライン学習継続')
  } 
  else if (repoName.includes('api') || repoName.includes('server') || paths.some(p => p.includes('api'))) {
    primaryPurpose = 'スケーラブルバックエンドAPIサービス'
    problemSolved = 'フロントエンドとデータベース間の効率的なデータ処理と管理'
    targetAudience = 'フロントエンド開発者、モバイルアプリ開発者、システム管理者'
    businessValue = 'スケーラブルなデータ処理、開発効率向上、運用コスト削減'
    marketContext = 'マイクロサービス化とAPI経済の成長'
    futureVision = 'AI駆動の自律的APIオーケストレーションシステムの実現'
    
    roadmap = [
      'Phase 1: 高パフォーマンスRESTful API基盤の構築',
      'Phase 2: GraphQL対応とリアルタイム通信機能追加',
      'Phase 3: AI/ML機能統合とインテリジェントキャッシング',
      'Phase 4: マルチクラウド対応と自動スケーリング',
      'Phase 5: エッジコンピューティング対応とゼロレイテンシ実現'
    ]
    
    engagingQuestions = [
      'APIの応答速度が1秒遅くなると、ユーザーはどれくらい離脱すると思いますか？',
      'なぜ多くのスタートアップがAPIファーストで開発するのでしょうか？',
      '将来、API設計はAIが自動化すると思いますか？',
      'マイクロサービス化の最大のメリットは何だと思いますか？'
    ]
    
    visualizationSuggestions = [
      'API応答時間とユーザー離脱率の相関グラフ',
      'マイクロサービスアーキテクチャ図',
      'スケーラビリティ比較チャート（モノリス vs マイクロサービス）',
      'API経済の市場規模予測',
      'レスポンス時間改善のビフォーアフター'
    ]
    
    if (depNames.includes('express')) technicalEvidence.push('Express.jsによる高速なRESTful API')
    if (depNames.includes('prisma')) technicalEvidence.push('Prismaによる型安全なデータベース操作')
  }
  else if (repoName.includes('dashboard') || repoName.includes('admin')) {
    primaryPurpose = 'インテリジェント管理・分析ダッシュボードシステム'
    problemSolved = '複雑なデータの可視化と効率的な管理業務の自動化'
    targetAudience = '管理者、データアナリスト、意思決定者、C-level経営陣'
    businessValue = 'データドリブンな意思決定支援、業務効率化、コスト削減'
    marketContext = 'ビッグデータ活用とリアルタイム分析の需要増加'
    futureVision = 'AI予測分析機能を統合した次世代意思決定支援システム'
    
    roadmap = [
      'Phase 1: リアルタイムデータ可視化基盤の構築',
      'Phase 2: 予測分析とアラート機能の実装',
      'Phase 3: AI/ML統合による自動インサイト生成',
      'Phase 4: 音声・自然言語インターフェース追加',
      'Phase 5: AR/VR対応の没入型データ分析環境'
    ]
    
    engagingQuestions = [
      'データがあっても活用できていない企業は全体の何%だと思いますか？',
      '経営判断の70%がデータではなく「勘」で行われている現実をどう思いますか？',
      'リアルタイムでデータが見えることで、ビジネスはどう変わると思いますか？',
      '将来、ダッシュボードは音声で操作するようになると思いますか？'
    ]
    
    visualizationSuggestions = [
      'データ活用度による企業業績比較グラフ',
      'リアルタイムダッシュボードのモックアップ',
      '意思決定速度の改善効果チャート',
      'データ可視化の進化タイムライン',
      'ROI改善効果の before/after 比較'
    ]
    
    if (depNames.includes('chart')) technicalEvidence.push('データ可視化ライブラリによる直感的な分析UI')
  }
  else {
    // Generic analysis based on tech stack
    if (depNames.includes('react') || depNames.includes('vue')) {
      primaryPurpose = 'モダンWebアプリケーション'
      problemSolved = 'ユーザビリティとパフォーマンスの両立'
      targetAudience = 'Webサービス利用者、モバイルユーザー'
      businessValue = 'ユーザー体験向上、エンゲージメント増加'
      marketContext = 'PWAとSPAの普及による高品質Web体験の標準化'
      futureVision = '次世代Webプラットフォームによるネイティブアプリレベルの体験提供'
      
      roadmap = [
        'Phase 1: 高性能SPAの基盤構築',
        'Phase 2: PWA化とオフライン対応',
        'Phase 3: AI/パーソナライゼーション機能追加',
        'Phase 4: WebAssembly活用による超高速処理',
        'Phase 5: WebXR対応の没入型体験提供'
      ]
      
      engagingQuestions = [
        'Webアプリがネイティブアプリより高速になる日は来ると思いますか？',
        'ユーザーがアプリを削除する最大の理由は何だと思いますか？',
        '将来、WebブラウザはOSの役割を担うようになると思いますか？'
      ]
      
      visualizationSuggestions = [
        'ページ読み込み速度とユーザー満足度の相関',
        'SPA vs 従来サイト パフォーマンス比較',
        'PWA導入効果のメトリクス',
        'ユーザージャーニーフロー図'
      ]
    }
  }
  
  // Add evidence based on architecture
  if (paths.some(p => p.includes('test'))) technicalEvidence.push('テスト駆動開発による品質保証')
  if (paths.some(p => p.includes('docker'))) technicalEvidence.push('Docker活用による環境統一と運用効率化')
  if (depNames.includes('typescript')) technicalEvidence.push('TypeScript採用による開発効率と保守性向上')
  
  return {
    primaryPurpose,
    problemSolved,
    targetAudience,
    businessValue,
    technicalEvidence,
    marketContext,
    futureVision,
    roadmap,
    engagingQuestions,
    visualizationSuggestions
  }
}

async function analyzeArchitecture(files: any[]): Promise<{
  pattern: string;
  structure: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  layering: string[];
  designRationale: string;
  scalabilityIndicators: string[];
}> {
  const paths = files.map(f => f.path || '').filter(Boolean)
  
  // Detect architecture patterns
  let pattern = 'Unknown'
  let structure: string[] = []
  let layering: string[] = []
  let designRationale = ''
  let scalabilityIndicators: string[] = []
  
  if (paths.some(p => p.includes('src/components/') && p.includes('src/pages/'))) {
    pattern = 'Component-Based Architecture'
    structure = ['components', 'pages', 'hooks', 'services']
    designRationale = 'コンポーネントの再利用性と保守性を重視した設計。単一責任の原則に基づく'
    scalabilityIndicators.push('コンポーネント分割による並行開発可能性')
    scalabilityIndicators.push('Hooks活用による状態管理の分離')
  } else if (paths.some(p => p.includes('app/models/') && p.includes('app/controllers/'))) {
    pattern = 'MVC (Model-View-Controller)'
    structure = ['models', 'views', 'controllers']
    designRationale = '関心の分離とビジネスロジックの明確化を重視した伝統的なアーキテクチャ'
    scalabilityIndicators.push('レイヤー分離による独立した開発・テスト')
  } else if (paths.some(p => p.includes('src/') && p.includes('lib/'))) {
    pattern = 'Modular Architecture'
    structure = ['src', 'lib', 'utils']
    designRationale = 'モジュール化による機能の独立性と再利用性を重視'
    scalabilityIndicators.push('モジュール単位での機能拡張可能性')
  }
  
  // Analyze layering
  if (paths.some(p => p.includes('api/') || p.includes('backend/'))) {
    layering.push('Backend API')
    scalabilityIndicators.push('API層分離によるフロントエンド・バックエンド独立開発')
  }
  if (paths.some(p => p.includes('frontend/') || p.includes('client/'))) {
    layering.push('Frontend')
    scalabilityIndicators.push('フロントエンド分離による技術スタック選択の自由度')
  }
  if (paths.some(p => p.includes('database/') || p.includes('db/'))) {
    layering.push('Database')
    scalabilityIndicators.push('データベース層分離による永続化戦略の柔軟性')
  }
  if (paths.some(p => p.includes('middleware/'))) {
    layering.push('Middleware')
    scalabilityIndicators.push('ミドルウェア活用による横断的関心事の分離')
  }
  
  const complexity = paths.length > 100 ? 'complex' : paths.length > 50 ? 'moderate' : 'simple'
  
  return { pattern, structure, complexity, layering, designRationale, scalabilityIndicators }
}

async function analyzeDesignPatterns(files: any[]): Promise<string[]> {
  const paths = files.map(f => f.path || '').filter(Boolean)
  const patterns: string[] = []
  
  // Factory Pattern
  if (paths.some(p => p.toLowerCase().includes('factory'))) patterns.push('Factory Pattern')
  
  // Observer Pattern
  if (paths.some(p => p.toLowerCase().includes('observer') || p.includes('event'))) patterns.push('Observer Pattern')
  
  // Singleton Pattern
  if (paths.some(p => p.toLowerCase().includes('singleton'))) patterns.push('Singleton Pattern')
  
  // Repository Pattern
  if (paths.some(p => p.toLowerCase().includes('repository'))) patterns.push('Repository Pattern')
  
  // Service Pattern
  if (paths.some(p => p.includes('service') || p.includes('Service'))) patterns.push('Service Pattern')
  
  // HOC Pattern (React)
  if (paths.some(p => p.includes('hoc') || p.includes('HOC'))) patterns.push('Higher-Order Component')
  
  // Hooks Pattern (React)
  if (paths.some(p => p.includes('hooks/') || p.includes('use'))) patterns.push('React Hooks Pattern')
  
  return patterns
}

async function analyzeFrameworks(dependencies: any[], files: any[]): Promise<{
  frontend: string[];
  backend: string[];
  database: string[];
  testing: string[];
  buildTools: string[];
  percentages: { category: string; frameworks: string; percentage: number }[];
}> {
  const depNames = dependencies.map(d => d.name.toLowerCase())
  const paths = files.map(f => f.path || '').filter(Boolean)
  
  const frontend: string[] = []
  const backend: string[] = []
  const database: string[] = []
  const testing: string[] = []
  const buildTools: string[] = []
  
  // Frontend frameworks
  if (depNames.includes('react')) frontend.push('React')
  if (depNames.includes('vue')) frontend.push('Vue.js')
  if (depNames.includes('angular')) frontend.push('Angular')
  if (depNames.includes('svelte')) frontend.push('Svelte')
  if (depNames.includes('next')) frontend.push('Next.js')
  if (depNames.includes('nuxt')) frontend.push('Nuxt.js')
  
  // Backend frameworks
  if (depNames.includes('express')) backend.push('Express.js')
  if (depNames.includes('fastify')) backend.push('Fastify')
  if (depNames.includes('koa')) backend.push('Koa.js')
  if (depNames.includes('django')) backend.push('Django')
  if (depNames.includes('flask')) backend.push('Flask')
  if (depNames.includes('spring')) backend.push('Spring Boot')
  
  // Database
  if (depNames.includes('mongoose')) database.push('MongoDB')
  if (depNames.includes('prisma')) database.push('Prisma')
  if (depNames.includes('sequelize')) database.push('Sequelize')
  if (depNames.includes('typeorm')) database.push('TypeORM')
  
  // Testing
  if (depNames.includes('jest')) testing.push('Jest')
  if (depNames.includes('mocha')) testing.push('Mocha')
  if (depNames.includes('cypress')) testing.push('Cypress')
  if (depNames.includes('playwright')) testing.push('Playwright')
  
  // Build tools
  if (depNames.includes('webpack')) buildTools.push('Webpack')
  if (depNames.includes('vite')) buildTools.push('Vite')
  if (depNames.includes('rollup')) buildTools.push('Rollup')
  if (paths.some(p => p.includes('docker'))) buildTools.push('Docker')
  
  // Calculate percentages
  const total = frontend.length + backend.length + database.length + testing.length + buildTools.length
  const percentages = [
    { category: 'Frontend', frameworks: frontend.join(', '), percentage: total > 0 ? Math.round((frontend.length / total) * 100) : 0 },
    { category: 'Backend', frameworks: backend.join(', '), percentage: total > 0 ? Math.round((backend.length / total) * 100) : 0 },
    { category: 'Database', frameworks: database.join(', '), percentage: total > 0 ? Math.round((database.length / total) * 100) : 0 },
    { category: 'Testing', frameworks: testing.join(', '), percentage: total > 0 ? Math.round((testing.length / total) * 100) : 0 },
    { category: 'Build Tools', frameworks: buildTools.join(', '), percentage: total > 0 ? Math.round((buildTools.length / total) * 100) : 0 }
  ].filter(item => item.percentage > 0)
  
  return { frontend, backend, database, testing, buildTools, percentages }
}

export { handler }