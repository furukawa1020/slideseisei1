import { createWorker, Worker } from 'tesseract.js'
import { ImageData } from '../types'

export class OCRService {
  private worker: Worker | null = null

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('jpn+eng')
    }
  }

  async processImage(imageFile: File): Promise<ImageData> {
    await this.initialize()
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    try {
      const { data: { text, confidence } } = await this.worker.recognize(imageFile)
      
      // Generate automatic caption based on OCR text
      const caption = this.generateCaption(text, confidence)
      
      return {
        url: URL.createObjectURL(imageFile),
        caption,
        ocrText: text,
        type: this.detectImageType(text)
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      return {
        url: URL.createObjectURL(imageFile),
        caption: 'Image could not be processed',
        ocrText: '',
        type: 'other'
      }
    }
  }

  async processImageFromUrl(imageUrl: string): Promise<ImageData> {
    await this.initialize()
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    try {
      const { data: { text, confidence } } = await this.worker.recognize(imageUrl)
      
      const caption = this.generateCaption(text, confidence)
      
      return {
        url: imageUrl,
        caption,
        ocrText: text,
        type: this.detectImageType(text)
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      return {
        url: imageUrl,
        caption: 'Image could not be processed',
        ocrText: '',
        type: 'other'
      }
    }
  }

  private generateCaption(text: string, confidence: number): string {
    if (confidence < 30) {
      return '画像に含まれるテキストが認識できませんでした'
    }
    
    const cleanText = text.trim().replace(/\n+/g, ' ').substring(0, 100)
    
    if (cleanText.length === 0) {
      return '画像にテキストが含まれていません'
    }
    
    // Try to create a meaningful caption
    if (cleanText.includes('error') || cleanText.includes('Error')) {
      return 'エラーメッセージを示すスクリーンショット'
    }
    
    if (cleanText.includes('import') || cleanText.includes('function') || cleanText.includes('class')) {
      return 'ソースコードのスクリーンショット'
    }
    
    if (cleanText.includes('npm') || cleanText.includes('yarn') || cleanText.includes('install')) {
      return 'パッケージ管理ツールの実行画面'
    }
    
    if (cleanText.includes('test') || cleanText.includes('Test')) {
      return 'テスト実行結果の画面'
    }
    
    if (cleanText.length > 50) {
      return `${cleanText.substring(0, 50)}...`
    }
    
    return cleanText
  }

  private detectImageType(text: string): 'screenshot' | 'diagram' | 'other' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('terminal') || 
        lowerText.includes('console') || 
        lowerText.includes('command') ||
        lowerText.includes('npm') ||
        lowerText.includes('git')) {
      return 'screenshot'
    }
    
    if (lowerText.includes('flow') || 
        lowerText.includes('diagram') || 
        lowerText.includes('chart') ||
        lowerText.includes('architecture')) {
      return 'diagram'
    }
    
    return 'screenshot'
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}