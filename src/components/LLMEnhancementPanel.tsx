import { useState } from 'react'
import { llmAgent } from '../services/llmAgent'

import { SlidePresentation } from '../types'

interface LLMEnhancementPanelProps {
  presentation: SlidePresentation
  onEnhanced: (enhancedPresentation: SlidePresentation) => void
  onClose: () => void
}

export default function LLMEnhancementPanel({ presentation, onEnhanced, onClose }: LLMEnhancementPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState(JSON.stringify(presentation, null, 2))

  const handleEnhance = async () => {
    if (!currentContent.trim()) return

    setIsLoading(true)
    try {
      // Use WebLLM only
      llmAgent.updateConfig({
        provider: 'webllm',
        model: 'Llama-3.2-3B-Instruct-q4f32_1-MLC'
      })
      
      await llmAgent.initialize()

      const enhanced = await llmAgent.enhanceContent(currentContent, presentation.language || 'ja')
      setCurrentContent(enhanced.enhancedContent)
    } catch (error) {
      console.error('Enhancement failed:', error)
      alert('AI enhancement failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    try {
      const enhancedPresentation = JSON.parse(currentContent) as SlidePresentation
      onEnhanced(enhancedPresentation)
      onClose()
    } catch (error) {
      alert('Invalid JSON format. Please check the content.')
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(to right, #7c3aed, #8b5cf6)',
        padding: '24px',
        color: 'white'
      }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>AI Content Enhancement (WebLLM)</h3>
        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Enhance your content with local AI</p>
      </div>
      <div style={{ padding: '24px' }}>
        {/* Content Editor */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Content</label>
          <textarea
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'none',
              minHeight: '120px'
            }}
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Enter content to enhance..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              flex: 1,
              background: isLoading ? '#9ca3af' : 'linear-gradient(to right, #7c3aed, #8b5cf6)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleEnhance}
            disabled={isLoading || !currentContent.trim()}
          >
            {isLoading ? 'Enhancing...' : 'Enhance Content'}
          </button>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={handleApply}
            disabled={!currentContent.trim()}
          >
            Apply Changes
          </button>
        </div>

        {/* Status */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            WebLLM runs locally in your browser. First use may take time to download the model.
          </p>
        </div>
      </div>
    </div>
  )
}