import { useState, useEffect } from 'react'
import { GitHubService } from '../services/github'
import { StoryGeneratorService } from '../services/storyGenerator'
import { SlideGeneratorService } from '../services/slideGenerator'
import { RepositoryAnalysisEngine } from '../services/repositoryAnalysis'
import { ExportService } from '../services/export'
import { storageService } from '../services/storage'
import { createLLMAgent, defaultLLMConfig } from '../services/llmAgent'
import { RepositoryData, SlidePresentation, AnalysisProgress, ExportConfig } from '../types'

interface UseSlideGenerationOptions {
  repoUrl: string
  mode: 'ted' | 'imrad'
  duration: 3 | 5
  language: 'ja' | 'en' | 'zh'
  githubToken?: string
  enableLLMEnhancement?: boolean
}

export function useSlideGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [presentation, setPresentation] = useState<SlidePresentation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateSlides = async (options: UseSlideGenerationOptions) => {
    try {
      setIsGenerating(true)
      setError(null)
      setProgress({
        stage: 'repository',
        progress: 0,
        message: 'リポジトリ情報を取得中...'
      })

      // Step 1: Repository Analysis
      const githubService = new GitHubService(options.githubToken)
      let repositoryData: RepositoryData

      // Check cache first
      const cachedRepo = await storageService.getCachedRepository(options.repoUrl)
      if (cachedRepo) {
        repositoryData = cachedRepo
        setProgress({
          stage: 'repository',
          progress: 15,
          message: 'キャッシュからリポジトリデータを読み込み'
        })
      } else {
        repositoryData = await githubService.analyzeRepository(options.repoUrl)
        await storageService.cacheRepository(options.repoUrl, repositoryData)
      }

      setProgress({
        stage: 'files',
        progress: 25,
        message: 'プロジェクト構造を解析中...'
      })

      // Step 2: Advanced Repository Analysis
      const analysisEngine = new RepositoryAnalysisEngine()
      const architecture = analysisEngine.analyzeArchitecture(repositoryData)
      const codeQuality = analysisEngine.analyzeCodeQuality(repositoryData)
      const insights = analysisEngine.generateInsights(repositoryData)

      setProgress({
        stage: 'story',
        progress: 45,
        message: 'ストーリー構造を生成中...'
      })

      // Step 3: Story Generation
      const storyGenerator = new StoryGeneratorService()
      let storyStructure = storyGenerator.generateStory(repositoryData)

      // Step 4: LLM Enhancement (if enabled)
      if (options.enableLLMEnhancement) {
        setProgress({
          stage: 'story',
          progress: 55,
          message: 'AIによるコンテンツ強化中...'
        })

        const llmAgent = createLLMAgent(defaultLLMConfig)
        try {
          const enhanced = await llmAgent.enhanceContent(JSON.stringify(storyStructure), options.language)
          try {
            storyStructure = JSON.parse(enhanced.enhancedContent)
          } catch {
            console.warn('Failed to parse LLM enhanced story, using original')
          }
        } catch (llmError) {
          console.warn('LLM enhancement failed, using original content:', llmError)
        }
      }

      setProgress({
        stage: 'slides',
        progress: 75,
        message: 'スライドを生成中...'
      })

      // Step 5: Slide Generation
      const slideGenerator = new SlideGeneratorService()
      const slidePresentation = slideGenerator.generatePresentation(
        repositoryData,
        storyStructure,
        options.mode,
        options.duration,
        options.language
      )

      // Enhance with analysis insights
      slidePresentation.repository = {
        ...slidePresentation.repository,
        // Add analysis results as metadata
        architecture,
        codeQuality,
        insights
      } as any

      setProgress({
        stage: 'complete',
        progress: 90,
        message: 'プレゼンテーションを保存中...'
      })

      // Step 6: Save to IndexedDB
      await storageService.savePresentation(slidePresentation)

      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'スライド生成完了！'
      })

      setPresentation(slidePresentation)
      return slidePresentation

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setProgress({
        stage: 'repository',
        progress: 0,
        message: 'エラーが発生しました',
        error: errorMessage
      })
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  const exportPresentation = async (exportConfig: ExportConfig) => {
    if (!presentation) {
      throw new Error('No presentation to export')
    }

    const exportService = new ExportService()
    await exportService.exportPresentation(presentation, exportConfig)
  }

  const resetGeneration = () => {
    setIsGenerating(false)
    setProgress(null)
    setPresentation(null)
    setError(null)
  }

  return {
    isGenerating,
    progress,
    presentation,
    error,
    generateSlides,
    exportPresentation,
    resetGeneration
  }
}

export function useStoredPresentations() {
  const [presentations, setPresentations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = async () => {
    try {
      const stored = await storageService.getAllPresentations()
      setPresentations(stored)
    } catch (error) {
      console.error('Failed to load presentations:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePresentation = async (id: string) => {
    await storageService.deletePresentation(id)
    await loadPresentations()
  }

  const searchPresentations = async (query: string) => {
    if (!query.trim()) {
      await loadPresentations()
      return
    }

    try {
      const results = await storageService.searchPresentations(query)
      setPresentations(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  return {
    presentations,
    loading,
    deletePresentation,
    searchPresentations,
    refresh: loadPresentations
  }
}

export function useOfflineCapabilities() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [capabilities, setCapabilities] = useState({
    canCreatePresentations: true,
    canEditPresentations: true,
    canExportPresentations: true,
    canAnalyzeRepositories: navigator.onLine
  })

  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      setCapabilities(prev => ({
        ...prev,
        canAnalyzeRepositories: online
      }))
    }

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  return {
    isOnline,
    capabilities
  }
}