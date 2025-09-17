import { useState } from 'react'
import { SlideGeneratorService } from '../services/slideGenerator'
import { repositoryAnalysisEngine } from '../services/repositoryAnalysis'
import { storyGenerator } from '../services/storyGenerator'
import { exportService } from '../services/export'
import LLMEnhancementPanel from './LLMEnhancementPanel'
import RepositoryAnalysisDisplay from './RepositoryAnalysisDisplay'
import { SlidePresentation, RepositoryData, StoryStructure } from '../types'

const slideGeneratorService = new SlideGeneratorService()

export default function SlideGenerator() {
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [presentation, setPresentation] = useState<SlidePresentation | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mode, setMode] = useState<'ted' | 'imrad'>('ted')
  const [duration, setDuration] = useState<3 | 5>(3)
  const [language, setLanguage] = useState<'ja' | 'en' | 'zh'>('ja')
  const [showLLMPanel, setShowLLMPanel] = useState(false)
  const [repositoryData, setRepositoryData] = useState<RepositoryData | null>(null)
  const [_storyData, setStoryData] = useState<StoryStructure | null>(null)

  const generateSlides = async () => {
    if (!repositoryUrl.trim()) return

    setIsGenerating(true)
    try {
      console.log('Analyzing repository:', repositoryUrl)
      
      // Step 1: Analyze repository
      const repoData = await repositoryAnalysisEngine.analyzeRepository(repositoryUrl)
      setRepositoryData(repoData)
      console.log('Repository analysis complete:', repoData)
      
      // Step 2: Generate story structure
      const story = await storyGenerator.generateStory(repoData, mode, language)
      setStoryData(story)
      console.log('Story generation complete:', story)
      
      // Step 3: Generate presentation slides
      const slidePresentation = slideGeneratorService.generatePresentation(
        repoData,
        story,
        mode,
        duration,
        language
      )
      
      setPresentation(slidePresentation)
      setCurrentSlide(0)
      console.log('Slide generation complete:', slidePresentation)
      
    } catch (error) {
      console.error('Slide generation failed:', error)
      alert(`スライド生成に失敗しました: ${error}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = async () => {
    if (!presentation) return
    try {
      const config = { 
        format: 'pdf' as const, 
        theme: 'default',
        includeNotes: false,
        quality: 'medium' as const 
      }
      await exportService.exportToPDF(presentation, config)
      alert('PDF export completed!')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF出力に失敗しました')
    }
  }

  const exportToPPTX = async () => {
    if (!presentation) return
    try {
      const config = { 
        format: 'pptx' as const, 
        theme: 'default',
        includeNotes: false,
        quality: 'medium' as const 
      }
      await exportService.exportToPowerPoint(presentation, config)
      alert('PowerPoint export completed!')
    } catch (error) {
      console.error('PPTX export failed:', error)
      alert('PowerPoint出力に失敗しました')
    }
  }

  const viewPresentation = () => {
    if (!presentation) return
    
    const presentationHtml = slideGeneratorService.renderSlides(presentation)
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(presentationHtml)
      newWindow.document.close()
    }
  }

  const enhanceWithLLM = () => {
    if (!presentation) return
    setShowLLMPanel(true)
  }

  const handleEnhancedContent = (enhancedPresentation: SlidePresentation) => {
    setPresentation(enhancedPresentation)
    setShowLLMPanel(false)
  }

  const nextSlide = () => {
    if (!presentation) return
    setCurrentSlide((prev) => (prev + 1) % presentation.slides.length)
  }

  const prevSlide = () => {
    if (!presentation) return
    setCurrentSlide((prev) => (prev - 1 + presentation.slides.length) % presentation.slides.length)
  }

  const currentSlideData = presentation?.slides[currentSlide]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Repo2Talk
        </h1>
        <p className="text-xl text-gray-600">
          Transform GitHub repositories into compelling presentations
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'ted' | 'imrad')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ted">TED Style</option>
                <option value="imrad">IMRAD (Academic)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) as 3 | 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 minutes</option>
                <option value={5}>5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'ja' | 'en' | 'zh')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateSlides}
            disabled={isGenerating || !repositoryUrl.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating slides...</span>
              </>
            ) : (
              <span>Generate Presentation</span>
            )}
          </button>
        </div>
      </div>

      {/* Repository Analysis Display */}
      {repositoryData && (
        <RepositoryAnalysisDisplay repository={repositoryData} />
      )}

      {/* Generated Slides Preview */}
      {presentation && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Generated Presentation
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={enhanceWithLLM}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Enhance with AI
              </button>
              <button
                onClick={viewPresentation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Presentation
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={exportToPPTX}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Export PPTX
              </button>
            </div>
          </div>

          {/* Slide Preview */}
          {currentSlideData && (
            <div className="border rounded-lg p-6 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentSlideData.title}
                </h3>
                <span className="text-sm text-gray-500">
                  Slide {currentSlide + 1} of {presentation.slides.length}
                </span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {currentSlideData.content}
                </p>
                
                {currentSlideData.bullets && currentSlideData.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {currentSlideData.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                )}
                
                {currentSlideData.code && (
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{currentSlideData.code.code}</code>
                    </pre>
                    <p className="text-gray-300 text-xs mt-2">
                      {currentSlideData.code.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevSlide}
              disabled={!presentation || presentation.slides.length <= 1}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextSlide}
              disabled={!presentation || presentation.slides.length <= 1}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* LLM Enhancement Panel */}
      {showLLMPanel && presentation && (
        <LLMEnhancementPanel
          presentation={presentation}
          onEnhanced={handleEnhancedContent}
          onClose={() => setShowLLMPanel(false)}
        />
      )}

      {/* Status Information */}
      {repositoryData && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Repository Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Language:</span>
              <span className="ml-2">{repositoryData.language}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Stars:</span>
              <span className="ml-2">{repositoryData.stars}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Files:</span>
              <span className="ml-2">{repositoryData.files.length}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Commits:</span>
              <span className="ml-2">{repositoryData.commits.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}