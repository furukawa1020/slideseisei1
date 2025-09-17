// LLM Agent Service - Unified interface for AI model interactions
// Supports WebLLM (local), OpenAI API, and local model endpoints

interface LLMConfig {
  provider: 'webllm' | 'openai' | 'local'
  model?: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
}

interface EnhancementRequest {
  type: 'improve' | 'simplify' | 'translate' | 'summarize' | 'proofread'
  content: string
  targetLanguage?: 'ja' | 'en' | 'zh'
  targetAudience?: 'general' | 'technical' | 'academic'
  maxLength?: number
}

interface EnhancementResult {
  enhancedContent: string
  suggestions: string[]
  confidence: number
}

// Dynamic imports to avoid bundling issues
const importWebLLM = async () => {
  try {
    const webllm = await import('@mlc-ai/web-llm')
    return webllm
  } catch {
    return null
  }
}

const importOpenAI = async () => {
  try {
    const OpenAI = await import('openai')
    return OpenAI.default
  } catch {
    return null
  }
}

class LLMAgentService {
  private config: LLMConfig
  private isInitialized = false
  private webLLMEngine: any = null
  private openAIClient: any = null

  constructor(config: LLMConfig = { provider: 'webllm' }) {
    this.config = config
  }

  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.isInitialized = false
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      switch (this.config.provider) {
        case 'webllm':
          await this.initializeWebLLM()
          break
        case 'openai':
          await this.initializeOpenAI()
          break
        case 'local':
          // Local models don't need initialization
          break
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize LLM:', error)
      throw new Error('LLM initialization failed')
    }
  }

  private async initializeWebLLM(): Promise<void> {
    const webllm = await importWebLLM()
    if (!webllm) {
      throw new Error('WebLLM not available')
    }

    try {
      // Use WebLLM's built-in engine instead of worker
      this.webLLMEngine = await webllm.CreateMLCEngine(
        this.config.model || 'Llama-3.2-3B-Instruct-q4f32_1-MLC'
      )
    } catch (error) {
      console.error('WebLLM initialization failed:', error)
      throw error
    }
  }

  private async initializeOpenAI(): Promise<void> {
    const OpenAI = await importOpenAI()
    if (!OpenAI) {
      throw new Error('OpenAI client not available')
    }

    this.openAIClient = new OpenAI({
      apiKey: this.config.apiKey || '',
      dangerouslyAllowBrowser: true
    })
  }

  async enhanceContent(content: string, language: 'ja' | 'en' | 'zh' = 'ja'): Promise<EnhancementResult> {
    await this.initialize()

    const prompt = this.buildEnhancementPrompt(content, language)

    try {
      let enhancedContent = ''

      switch (this.config.provider) {
        case 'webllm':
          enhancedContent = await this.generateWithWebLLM(prompt)
          break
        case 'openai':
          enhancedContent = await this.generateWithOpenAI(prompt)
          break
        case 'local':
          enhancedContent = await this.generateWithLocal(prompt)
          break
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }

      return {
        enhancedContent,
        suggestions: ['Content enhanced for better clarity and engagement'],
        confidence: 0.8
      }
    } catch (error) {
      console.error('Content enhancement failed:', error)
      return {
        enhancedContent: content, // Return original content as fallback
        suggestions: ['Enhancement failed, using original content'],
        confidence: 0.0
      }
    }
  }

  private buildEnhancementPrompt(content: string, language: 'ja' | 'en' | 'zh'): string {
    const languageMap = {
      ja: 'Japanese',
      en: 'English', 
      zh: 'Chinese'
    }

    return `Please improve the following content for a presentation slide. Make it more engaging, clear, and concise while maintaining the original meaning. Respond in ${languageMap[language]}:

${content}

Enhanced version:`
  }

  private async generateWithWebLLM(prompt: string): Promise<string> {
    if (!this.webLLMEngine) {
      throw new Error('WebLLM engine not initialized')
    }

    try {
      const response = await this.webLLMEngine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 500
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('WebLLM generation failed:', error)
      throw error
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const response = await this.openAIClient.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 500
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI generation failed:', error)
      throw error
    }
  }

  private async generateWithLocal(prompt: string): Promise<string> {
    // Placeholder for local model integration
    // This would typically make a request to a local model server
    console.warn('Local model provider not implemented yet')
    return `Enhanced: ${prompt}`
  }

  async translatePresentation(presentation: any, targetLanguage: 'ja' | 'en' | 'zh'): Promise<any> {
    await this.initialize()

    const translatedSlides = await Promise.all(
      presentation.slides.map(async (slide: any) => ({
        ...slide,
        title: await this.translateText(slide.title, targetLanguage),
        content: await this.translateText(slide.content, targetLanguage),
        speakerNotes: await this.translateText(slide.speakerNotes, targetLanguage)
      }))
    )

    return {
      ...presentation,
      language: targetLanguage,
      slides: translatedSlides
    }
  }

  private async translateText(text: string, targetLanguage: 'ja' | 'en' | 'zh'): Promise<string> {
    const languageMap = {
      ja: 'Japanese',
      en: 'English',
      zh: 'Chinese'
    }

    const prompt = `Translate the following text to ${languageMap[targetLanguage]}:

${text}

Translation:`

    try {
      switch (this.config.provider) {
        case 'webllm':
          return await this.generateWithWebLLM(prompt)
        case 'openai':
          return await this.generateWithOpenAI(prompt)
        case 'local':
          return await this.generateWithLocal(prompt)
        default:
          return text
      }
    } catch (error) {
      console.error('Translation failed:', error)
      return text
    }
  }

  async isProviderAvailable(provider: 'webllm' | 'openai' | 'local'): Promise<boolean> {
    switch (provider) {
      case 'webllm':
        return !!(await importWebLLM())
      case 'openai':
        return !!(await importOpenAI()) && !!this.config.apiKey
      case 'local':
        // Check if local endpoint is available
        return false
      default:
        return false
    }
  }
}

// Export singleton instance
export const llmAgent = new LLMAgentService({
  provider: 'webllm',
  model: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
  temperature: 0.7,
  maxTokens: 500
})

export const createLLMAgent = (config: LLMConfig): LLMAgentService => {
  return new LLMAgentService(config)
}

export const defaultLLMConfig: LLMConfig = {
  provider: 'webllm',
  model: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
  temperature: 0.7,
  maxTokens: 500
}

export type { LLMConfig, EnhancementRequest, EnhancementResult }