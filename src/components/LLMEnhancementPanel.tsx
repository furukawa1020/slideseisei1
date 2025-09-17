import { useState } from 'react'
import { llmAgent } from '../services/llmAgent'

interface LLMEnhancementPanelProps {
  content: string
  onEnhanced: (enhancedContent: string) => void
  language: 'ja' | 'en' | 'zh'
}

export default function LLMEnhancementPanel({ content, onEnhanced, language }: LLMEnhancementPanelProps) {
  const [provider, setProvider] = useState<'webllm' | 'openai' | 'local'>('webllm')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [isLoading, setIsLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState(content)
  const [enhancementType, setEnhancementType] = useState<'improve' | 'simplify' | 'expand' | 'translate'>('improve')

  const handleEnhance = async () => {
    if (!currentContent.trim()) return

    setIsLoading(true)
    try {
      // Update LLM configuration
      llmAgent.updateConfig({
        provider,
        apiKey: provider === 'openai' ? apiKey : undefined,
        model: provider === 'openai' ? model : 'Llama-3.2-3B-Instruct-q4f32_1-MLC'
      })
      
      // Initialize LLM Agent
      await llmAgent.initialize()

      // Generate enhancement based on type
      const enhanced = await llmAgent.enhanceContent(currentContent, language)
      setCurrentContent(enhanced.enhancedContent)
    } catch (error) {
      console.error('Enhancement failed:', error)
      alert('Enhancement failed. Please check your settings and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    onEnhanced(currentContent)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
        <h3 className="text-2xl font-bold text-white">AI Content Enhancement</h3>
        <p className="text-purple-100 mt-1">Enhance your content with artificial intelligence</p>
      </div>
      <div className="p-8 space-y-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">AI Provider</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                provider === 'webllm' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setProvider('webllm')}
            >
              WebLLM
            </button>
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                provider === 'openai' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setProvider('openai')}
            >
              OpenAI
            </button>
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                provider === 'local' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setProvider('local')}
            >
              Local
            </button>
          </div>
        </div>

        {/* OpenAI Settings */}
        {provider === 'openai' && (
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-semibold text-slate-700">OpenAI API Key</label>
              <input
                id="apiKey"
                type="password"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-semibold text-slate-700">Model</label>
              <select
                id="model"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>
        )}

        {/* Enhancement Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Enhancement Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                enhancementType === 'improve' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setEnhancementType('improve')}
            >
              Improve
            </button>
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                enhancementType === 'simplify' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setEnhancementType('simplify')}
            >
              Simplify
            </button>
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                enhancementType === 'expand' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setEnhancementType('expand')}
            >
              Expand
            </button>
            <button
              type="button"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                enhancementType === 'translate' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
              onClick={() => setEnhancementType('translate')}
            >
              Translate
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-semibold text-slate-700">Content</label>
          <textarea
            id="content"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={6}
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Enter content to enhance..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleEnhance}
            disabled={isLoading || !currentContent.trim()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enhancing...</span>
              </div>
            ) : (
              'Enhance Content'
            )}
          </button>
          <button
            type="button"
            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
            onClick={handleApply}
            disabled={!currentContent.trim()}
          >
            Apply Changes
          </button>
        </div>

        {/* Provider Status */}
        {provider === 'webllm' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 font-medium">
              WebLLM runs locally in your browser. First use may take time to download the model.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}