import jsPDF from 'jspdf'
import pptxgen from 'pptxgenjs'
import { SlidePresentation, ExportConfig } from '../types'

export class ExportService {
  async exportToPDF(presentation: SlidePresentation, config: ExportConfig): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    for (let i = 0; i < presentation.slides.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }

      const slide = presentation.slides[i]
      let yPosition = margin + 10

      // Title
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(slide.title, margin, yPosition)
      yPosition += 15

      // Content
      if (slide.content) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'normal')
        const contentLines = pdf.splitTextToSize(slide.content, pageWidth - (margin * 2))
        pdf.text(contentLines, margin, yPosition)
        yPosition += contentLines.length * 7
      }

      // Bullets
      if (slide.bullets && slide.bullets.length > 0) {
        pdf.setFontSize(12)
        yPosition += 5
        slide.bullets.forEach((bullet) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage()
            yPosition = margin + 10
          }
          pdf.text(`• ${bullet}`, margin + 5, yPosition)
          yPosition += 8
        })
      }

      // Code
      if (slide.code) {
        yPosition += 10
        pdf.setFontSize(10)
        pdf.setFont('courier', 'normal')
        const codeLines = slide.code.code.split('\n')
        codeLines.forEach(line => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage()
            yPosition = margin + 10
          }
          pdf.text(line, margin, yPosition)
          yPosition += 5
        })
      }

      // Speaker notes (if included)
      if (config.includeNotes && slide.speakerNotes) {
        yPosition += 10
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')
        pdf.text('講演者ノート:', margin, yPosition)
        yPosition += 5
        const notesLines = pdf.splitTextToSize(slide.speakerNotes, pageWidth - (margin * 2))
        pdf.text(notesLines, margin, yPosition)
      }

      // Slide number
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${i + 1} / ${presentation.slides.length}`, pageWidth - margin - 20, pageHeight - 10)
    }

    return new Promise((resolve) => {
      const pdfBlob = pdf.output('blob')
      resolve(pdfBlob)
    })
  }

  async exportToPowerPoint(presentation: SlidePresentation, config: ExportConfig): Promise<Blob> {
    const pptx = new pptxgen()

    // Set presentation properties
    pptx.title = presentation.title
    pptx.author = 'Repo2Talk'
    pptx.subject = `${presentation.mode.toUpperCase()} presentation for ${presentation.repository.name}`

    // Define layout and theme
    pptx.layout = 'LAYOUT_16x9'
    
    const theme = presentation.mode === 'ted' ? {
      background: { color: '1F2937' },
      titleColor: 'FFFFFF',
      textColor: 'F3F4F6',
      accentColor: '3B82F6'
    } : {
      background: { color: 'FFFFFF' },
      titleColor: '1F2937',
      textColor: '374151',
      accentColor: '059669'
    }

    presentation.slides.forEach((slide, index) => {
      const pptxSlide = pptx.addSlide()
      
      // Background
      pptxSlide.background = theme.background

      // Title
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 12,
        h: 1,
        fontSize: slide.type === 'title' ? 36 : 28,
        color: theme.titleColor,
        fontFace: 'Arial',
        bold: true,
        align: slide.type === 'title' || slide.type === 'conclusion' ? 'center' : 'left'
      })

      let yPos = 1.8

      // Content
      if (slide.content && slide.type !== 'title') {
        pptxSlide.addText(slide.content, {
          x: 0.5,
          y: yPos,
          w: 12,
          h: 1.5,
          fontSize: 18,
          color: theme.textColor,
          fontFace: 'Arial',
          align: 'left'
        })
        yPos += 2
      } else if (slide.content && slide.type === 'title') {
        pptxSlide.addText(slide.content, {
          x: 0.5,
          y: 2.5,
          w: 12,
          h: 2,
          fontSize: 20,
          color: theme.titleColor,
          fontFace: 'Arial',
          align: 'center'
        })
      }

      // Bullets
      if (slide.bullets && slide.bullets.length > 0) {
        const bulletText = slide.bullets.map(bullet => `• ${bullet}`).join('\n')
        pptxSlide.addText(bulletText, {
          x: 0.8,
          y: yPos,
          w: 11.4,
          h: 4,
          fontSize: 16,
          color: theme.textColor,
          fontFace: 'Arial',
          lineSpacing: 24
        })
        yPos += slide.bullets.length * 0.5 + 1
      }

      // Code
      if (slide.code) {
        pptxSlide.addText(slide.code.code, {
          x: 0.5,
          y: yPos,
          w: 12,
          h: 3,
          fontSize: 12,
          color: theme.textColor,
          fontFace: 'Courier New',
          fill: { color: '1F2937' },
          margin: 0.2
        })
        
        if (slide.code.explanation) {
          pptxSlide.addText(slide.code.explanation, {
            x: 0.5,
            y: yPos + 3.2,
            w: 12,
            h: 0.8,
            fontSize: 14,
            color: theme.accentColor,
            fontFace: 'Arial',
            italic: true
          })
        }
      }

      // Chart placeholder
      if (slide.chart) {
        pptxSlide.addText(slide.chart.title, {
          x: 0.5,
          y: yPos,
          w: 12,
          h: 0.8,
          fontSize: 18,
          color: theme.titleColor,
          fontFace: 'Arial',
          bold: true,
          align: 'center'
        })
        
        pptxSlide.addText('📊 Chart visualization would appear here', {
          x: 0.5,
          y: yPos + 1,
          w: 12,
          h: 3,
          fontSize: 16,
          color: theme.textColor,
          fontFace: 'Arial',
          align: 'center'
        })
      }

      // Speaker notes
      if (config.includeNotes && slide.speakerNotes) {
        pptxSlide.addNotes(slide.speakerNotes)
      }

      // Slide number
      pptxSlide.addText(`${index + 1}`, {
        x: 12.5,
        y: 7,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: theme.textColor,
        fontFace: 'Arial',
        align: 'center'
      })
    })

    await pptx.writeFile({ fileName: `${presentation.title}.pptx` })
    // Return a placeholder blob for consistency
    return new Blob(['PowerPoint export completed'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
  }

  async exportToKeynote(presentation: SlidePresentation, config: ExportConfig): Promise<Blob> {
    // Keynote export is implemented as PowerPoint export for compatibility
    // Real Keynote export would require native macOS APIs
    return this.exportToPowerPoint(presentation, config)
  }

  async exportToHTML(presentation: SlidePresentation): Promise<string> {
    // This would be handled by the SlideGeneratorService.renderSlides method
    const slideGenerator = await import('./slideGenerator')
    return new slideGenerator.SlideGeneratorService().renderSlides(presentation)
  }

  generateFileName(presentation: SlidePresentation, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const safeTitle = presentation.title.replace(/[^a-zA-Z0-9]/g, '_')
    return `${safeTitle}_${presentation.mode}_${timestamp}.${format}`
  }

  async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async exportPresentation(
    presentation: SlidePresentation, 
    config: ExportConfig
  ): Promise<void> {
    try {
      let blob: Blob
      let filename: string

      switch (config.format) {
        case 'pdf':
          blob = await this.exportToPDF(presentation, config)
          filename = this.generateFileName(presentation, 'pdf')
          break
        
        case 'pptx':
          blob = await this.exportToPowerPoint(presentation, config)
          filename = this.generateFileName(presentation, 'pptx')
          break
        
        case 'keynote':
          blob = await this.exportToKeynote(presentation, config)
          filename = this.generateFileName(presentation, 'key')
          break
        
        case 'html':
          const html = await this.exportToHTML(presentation)
          blob = new Blob([html], { type: 'text/html' })
          filename = this.generateFileName(presentation, 'html')
          break
        
        default:
          throw new Error(`Unsupported export format: ${config.format}`)
      }

      await this.downloadFile(blob, filename)
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error(`Failed to export presentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getAvailableFormats(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'html',
        label: 'HTML (Reveal.js)',
        description: 'インタラクティブなWebプレゼンテーション'
      },
      {
        value: 'pdf',
        label: 'PDF',
        description: '印刷可能なPDFドキュメント'
      },
      {
        value: 'pptx',
        label: 'PowerPoint (PPTX)',
        description: 'Microsoft PowerPoint形式'
      },
      {
        value: 'keynote',
        label: 'Keynote互換',
        description: 'Apple Keynote互換形式'
      }
    ]
  }

  getQualityOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'low', label: '低画質（高速）' },
      { value: 'medium', label: '標準画質' },
      { value: 'high', label: '高画質（低速）' }
    ]
  }
}