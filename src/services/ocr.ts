import { createWorker, Worker, PSM, OEM } from 'tesseract.js'
import { ImageData } from '../types'

export class OCRService {
  private worker: Worker | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('Initializing OCR worker...')
      this.worker = await createWorker('jpn+eng', 1, {
        logger: m => console.log('OCR:', m)
      })
      
      await this.worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY
      })
      
      this.isInitialized = true
      console.log('OCR worker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error)
      throw new Error('OCR initialization failed')
    }
  }

  async processImage(imageFile: File): Promise<ImageData> {
    await this.initialize()
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    try {
      console.log('Processing image with OCR...', imageFile.name)
      
      const { data: { text, confidence } } = await this.worker.recognize(imageFile)
      
      console.log(`OCR completed with ${confidence}% confidence`)
      
      const cleanedText = this.cleanOCRText(text)
      const caption = this.generateCaption(cleanedText, confidence)
      
      return {
        url: URL.createObjectURL(imageFile),
        caption,
        ocrText: cleanedText,
        type: 'screenshot'
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      return {
        url: URL.createObjectURL(imageFile),
        caption: 'Screenshot - Could not extract text content',
        ocrText: '',
        type: 'screenshot'
      }
    }
  }

  async processImageFromUrl(imageUrl: string): Promise<ImageData> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      const blob = await response.blob()
      const file = new File([blob], 'url-image.png', { type: blob.type })
      
      return await this.processImage(file)
    } catch (error) {
      console.error('Failed to process image from URL:', error)
      return {
        url: imageUrl,
        caption: 'External image - Could not process',
        ocrText: '',
        type: 'other'
      }
    }
  }

  private cleanOCRText(text: string): string {
    return text
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private generateCaption(text: string, confidence: number): string {
    if (confidence < 30) {
      return 'スクリーンショット - テキストの読み取りが困難'
    }

    if (this.containsCode(text)) {
      return 'コードスクリーンショット'
    }

    if (text.includes('npm') || text.includes('git') || text.includes('terminal')) {
      return 'ターミナル実行結果のスクリーンショット'
    }

    if (text.includes('error') || text.includes('Error')) {
      return 'エラーメッセージのスクリーンショット'
    }

    if (text.length > 50) {
      return `${text.substring(0, 50)}...のスクリーンショット`
    }

    return 'スクリーンショット'
  }

  private containsCode(text: string): boolean {
    const codePatterns = [
      /function\s*\(/,
      /const\s+\w+\s*=/,
      /import\s+[\w{},\s]*\s+from/,
      /class\s+\w+/,
      /if\s*\(/,
      /console\.log\s*\(/
    ]
    
    return codePatterns.some(pattern => pattern.test(text))
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

export const ocrService = new OCRService()