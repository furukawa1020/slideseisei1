import { useState } from 'react'
import { useSlideGeneration } from '../hooks/useSlideGeneration'
import LLMEnhancementPanel from './LLMEnhancementPanel'

export function SlideGenerator() {
  const [repoUrl, setRepoUrl] = useState('')
  const [mode, setMode] = useState<'ted' | 'imrad'>('ted')
  const [duration, setDuration] = useState<3 | 5>(5)
  const [language, setLanguage] = useState<'ja' | 'en' | 'zh'>('ja')
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '')
  const [enableLLMEnhancement, setEnableLLMEnhancement] = useState(false)
  const [showLLMPanel, setShowLLMPanel] = useState(false)
  const [currentContent, setCurrentContent] = useState('')

  const {
    isGenerating,
    progress,
    presentation,
    error,
    generateSlides,
    exportPresentation,
    resetGeneration
  } = useSlideGeneration()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    try {
      await generateSlides({
        repoUrl,
        mode,
        duration,
        language,
        githubToken: githubToken || undefined,
        enableLLMEnhancement
      })
    } catch (err) {
      console.error('Slide generation failed:', err)
    }
  }

  const saveGithubToken = () => {
    localStorage.setItem('github_token', githubToken)
    alert('GitHub token saved!')
  }

  const handleLLMEnhancement = (enhancedContent: string) => {
    setCurrentContent(enhancedContent)
    setShowLLMPanel(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Repo2Talk
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform your GitHub repositories into compelling presentation slides with AI-powered content generation
          </p>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Configuration</h2>
            <p className="text-slate-300 mt-1">Setup your repository and presentation preferences</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="repoUrl" className="block text-sm font-semibold text-slate-700">
                  Repository URL
                </label>
                <input
                  id="repoUrl"
                  type="url"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="githubToken" className="block text-sm font-semibold text-slate-700">
                  GitHub Token
                  <span className="text-slate-500 font-normal ml-1">(Optional)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    id="githubToken"
                    type="password"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxx"
                  />
                  <button 
                    type="button" 
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-200 font-medium" 
                    onClick={saveGithubToken}
                  >
                    Save
                  </button>
                </div>
                <p className="text-sm text-slate-500">
                  Increases API rate limits from 60 to 5,000 requests per hour
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="mode" className="block text-sm font-semibold text-slate-700">Presentation Style</label>
                  <select
                    id="mode"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'ted' | 'imrad')}
                  >
                    <option value="ted">TED Style</option>
                    <option value="imrad">IMRAD Academic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">Duration</label>
                  <select
                    id="duration"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) as 3 | 5)}
                  >
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="language" className="block text-sm font-semibold text-slate-700">Language</label>
                <select
                  id="language"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ja' | 'en' | 'zh')}
                >
                  <option value="ja">Japanese</option>
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="enableLLM"
                  checked={enableLLMEnhancement}
                  onChange={(e) => setEnableLLMEnhancement(e.target.checked)}
                  className="w-4 h-4 text-slate-600 bg-white border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
                />
                <label htmlFor="enableLLM" className="text-sm font-medium text-slate-700">
                  Enable AI content enhancement
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Slides...</span>
                  </div>
                ) : (
                  'Generate Presentation'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Progress & Results Panel */}
        <div className="space-y-6">
          {progress && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <h3 className="text-xl font-bold text-white">Generation Progress</h3>
              </div>
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-medium text-slate-700">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-slate-600 font-medium">{progress.message}</p>
                {progress.error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium">{progress.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
                <h4 className="text-xl font-bold text-white">Generation Failed</h4>
              </div>
              <div className="p-8">
                <p className="text-red-700 mb-6">{error}</p>
                <button 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-200 font-medium" 
                  onClick={resetGeneration}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {presentation && (
            <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                <h3 className="text-xl font-bold text-white">Presentation Generated Successfully</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="space-y-2">
                    <p className="text-slate-500 font-medium">Repository</p>
                    <p className="text-slate-800 font-semibold">{presentation.repository.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-medium">Slides</p>
                    <p className="text-slate-800 font-semibold">{presentation.slides.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-medium">Style</p>
                    <p className="text-slate-800 font-semibold">{presentation.mode.toUpperCase()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-medium">Language</p>
                    <p className="text-slate-800 font-semibold">{presentation.language.toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => window.open(`/viewer/${presentation.id}`, '_blank')}
                  >
                    View Presentation
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => setShowLLMPanel(true)}
                  >
                    AI Enhance
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => exportPresentation({ 
                      format: 'pdf',
                      theme: 'default',
                      includeNotes: false,
                      quality: 'high'
                    })}
                  >
                    Export PDF
                  </button>
                  <button
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => exportPresentation({ 
                      format: 'pptx',
                      theme: 'default',
                      includeNotes: false,
                      quality: 'high'
                    })}
                  >
                    Export PPTX
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Enhancement Panel */}
      {showLLMPanel && (
        <div className="mt-8">
          <LLMEnhancementPanel
            content={currentContent}
            onEnhanced={handleLLMEnhancement}
            language={language}
          />
        </div>
      )}
      </div>
    </div>
  )
}