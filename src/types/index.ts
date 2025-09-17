// Repository Analysis Types
export interface RepositoryData {
  url: string
  name: string
  description: string
  language: string
  languages: Record<string, number>
  dependencies: Dependency[]
  commits: CommitData[]
  files: FileData[]
  readme: string
  screenshots: ImageData[]
  createdAt: string
  updatedAt: string
  stars: number
  forks: number
}

export interface Dependency {
  name: string
  version: string
  type: 'dependency' | 'devDependency'
}

export interface CommitData {
  sha: string
  message: string
  author: string
  date: string
  additions: number
  deletions: number
}

export interface FileData {
  path: string
  type: string
  size: number
  content?: string
  importance: number
}

export interface ImageData {
  url: string
  caption?: string
  ocrText?: string
  type: 'screenshot' | 'diagram' | 'other'
}

// Story Generation Types
export interface StoryStructure {
  why: StorySection
  problem: StorySection
  approach: StorySection
  result: StorySection
  next: StorySection
}

export interface StorySection {
  title: string
  content: string
  bullets: string[]
  images?: ImageData[]
  code?: CodeSnippet[]
}

export interface CodeSnippet {
  language: string
  code: string
  explanation: string
}

// Slide Generation Types
export interface SlidePresentation {
  id: string
  title: string
  mode: 'ted' | 'imrad'
  language: 'ja' | 'en' | 'zh'
  duration: 3 | 5
  slides: Slide[]
  story: StoryStructure
  repository: RepositoryData
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  type: 'title' | 'content' | 'image' | 'code' | 'chart' | 'conclusion'
  title: string
  content: string
  bullets?: string[]
  image?: ImageData
  code?: CodeSnippet
  chart?: ChartData
  speakerNotes: string
  duration: number
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'timeline'
  data: any[]
  labels: string[]
  title: string
}

// Template Types
export interface SlideTemplate {
  name: string
  mode: 'ted' | 'imrad'
  structure: TemplateSection[]
  theme: ThemeConfig
}

export interface TemplateSection {
  type: Slide['type']
  title: string
  estimatedDuration: number
  required: boolean
}

export interface ThemeConfig {
  primaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  layout: 'standard' | 'wide' | 'compact'
}

// Export Configuration
export interface ExportConfig {
  format: 'html' | 'pdf' | 'pptx' | 'keynote'
  theme: string
  includeNotes: boolean
  quality: 'low' | 'medium' | 'high'
}

// Analysis Progress
export interface AnalysisProgress {
  stage: 'repository' | 'files' | 'story' | 'slides' | 'complete'
  progress: number
  message: string
  error?: string
}