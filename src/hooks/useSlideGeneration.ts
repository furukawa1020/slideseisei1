import { useState, useEffect } from 'react'
import { repositoryAnalysisEngine } from '../services/repositoryAnalysis'
import { storyGenerator } from '../services/storyGenerator'
import { slideGeneratorService } from '../services/slideGenerator'
import { exportService } from '../services/export'
import { storageService } from '../services/storage'
import { SlidePresentation, AnalysisProgress, ExportConfig } from '../types'

interface UseSlideGenerationOptions {
  repoUrl: string
  mode: 'ted' | 'imrad'
  duration: 3 | 5
  language: 'ja' | 'en' | 'zh'
  githubToken?: string
  enableLLMEnhancement?: boolean
}

export function useSlideGeneration() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgress>({
    stage: 'repository',
    progress: 0,
    message: ''
  })
  const [presentation, setPresentation] = useState<SlidePresentation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateSlides = async (options: UseSlideGenerationOptions) => {
    try {
      setLoading(true)
      setError(null)

      setProgress({
        stage: 'repository',
        progress: 10,
        message: 'リポジトリ情報を取得中...'
      })

      // Step 1: Repository Analysis
      const repositoryData = await repositoryAnalysisEngine.analyzeRepository(options.repoUrl)

      setProgress({
        stage: 'story',
        progress: 45,
        message: 'ストーリー構造を生成中...'
      })

      // Step 2: Story Generation
      const storyStructure = storyGenerator.generateStory(repositoryData)

      setProgress({
        stage: 'slides',
        progress: 75,
        message: 'スライドを生成中...'
      })

      // Step 3: Slide Generation
      const slidePresentation = slideGeneratorService.generatePresentation(
        repositoryData,
        await storyStructure,
        options.mode,
        options.duration,
        options.language
      )

      setProgress({
        stage: 'complete',
        progress: 100,
        message: '生成完了！'
      })

      setPresentation(slidePresentation)
      
      // Save to storage
      await storageService.savePresentation(slidePresentation)

      return slidePresentation

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スライド生成中にエラーが発生しました'
      setError(errorMessage)
      setProgress({
        stage: 'repository',
        progress: 0,
        message: '',
        error: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const exportPresentation = async (format: ExportConfig['format'], config?: Partial<ExportConfig>) => {
    if (!presentation) {
      throw new Error('エクスポートするプレゼンテーションがありません')
    }

    const exportConfig: ExportConfig = {
      format,
      theme: 'default',
      includeNotes: true,
      quality: 'medium',
      ...config
    }

    const result = await exportService.exportPresentation(presentation, exportConfig)
    return result
  }

  const clearPresentation = () => {
    setPresentation(null)
    setError(null)
    setProgress({
      stage: 'repository',
      progress: 0,
      message: ''
    })
  }

  const loadSavedPresentation = async (id: string) => {
    try {
      const savedPresentation = await storageService.getPresentation(id)
      if (savedPresentation) {
        setPresentation(savedPresentation.presentationData)
        return savedPresentation
      }
      throw new Error('プレゼンテーションが見つかりませんでした')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '読み込みエラー'
      setError(errorMessage)
      throw err
    }
  }

  const getSavedPresentations = async () => {
    try {
      return await storageService.getAllPresentations()
    } catch (err) {
      console.error('Failed to get saved presentations:', err)
      return []
    }
  }

  const deleteSavedPresentation = async (id: string) => {
    try {
      await storageService.deletePresentation(id)
      if (presentation?.id === id) {
        clearPresentation()
      }
    } catch (err) {
      console.error('Failed to delete presentation:', err)
      throw err
    }
  }

  // Reset state on component unmount
  useEffect(() => {
    return () => {
      clearPresentation()
    }
  }, [])

  return {
    // State
    loading,
    progress,
    presentation,
    error,

    // Actions
    generateSlides,
    exportPresentation,
    clearPresentation,
    loadSavedPresentation,
    getSavedPresentations,
    deleteSavedPresentation
  }
}

export default useSlideGeneration