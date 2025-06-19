import jsPDF from 'jspdf'
import { PlayWithRelations } from '@/modules/plays/types'
import { GamePlanWithRelations } from '@/modules/gamePlans/types'
import { PlayDiagram } from '@/modules/common/types'

export class PDFGenerator {
  private pdf: jsPDF
  
  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
  }

  async generatePlayPDF(play: PlayWithRelations): Promise<Blob> {
    this.pdf = new jsPDF()
    
    // Header
    this.addHeader(play.title)
    
    // Play metadata
    this.addPlayMetadata(play)
    
    // Diagram (placeholder - in real implementation would render the Konva stage)
    this.addDiagramPlaceholder()
    
    // Description and notes
    if (play.description) {
      this.addSection('Description', play.description)
    }
    
    // Tags
    if (play.tags.length > 0) {
      this.addTagsSection(play.tags.map(tag => tag.name))
    }
    
    // Relations
    if (play.relationsFrom.length > 0) {
      this.addRelationsSection(play.relationsFrom)
    }
    
    return this.pdf.output('blob')
  }

  async generateGamePlanPDF(gamePlan: GamePlanWithRelations): Promise<Blob> {
    this.pdf = new jsPDF()
    
    // Cover page
    this.addGamePlanCover(gamePlan)
    
    // Table of contents
    this.pdf.addPage()
    this.addTableOfContents(gamePlan)
    
    // Individual plays
    for (const item of gamePlan.items) {
      this.pdf.addPage()
      this.addGamePlanPlay(item)
    }
    
    // Sequences/Flow chart (if available)
    if (gamePlan.sequences.length > 0) {
      this.pdf.addPage()
      this.addSequencesSection(gamePlan.sequences)
    }
    
    return this.pdf.output('blob')
  }

  private addHeader(title: string) {
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, 20, 30)
    
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40)
    
    // Add line
    this.pdf.setLineWidth(0.5)
    this.pdf.line(20, 45, 190, 45)
  }

  private addPlayMetadata(play: PlayWithRelations) {
    let yPos = 60
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Play Information', 20, yPos)
    
    yPos += 10
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    
    this.pdf.text(`Author: ${play.author.name || play.author.email}`, 20, yPos)
    yPos += 6
    this.pdf.text(`Created: ${new Date(play.createdAt).toLocaleDateString()}`, 20, yPos)
    yPos += 6
    this.pdf.text(`Last Modified: ${new Date(play.updatedAt).toLocaleDateString()}`, 20, yPos)
  }

  private addDiagramPlaceholder() {
    const yPos = 100
    
    // Draw a simple court representation
    this.pdf.setLineWidth(1)
    this.pdf.rect(20, yPos, 160, 100) // Court outline
    
    // Center circle
    this.pdf.circle(100, yPos + 50, 15)
    
    // Key areas
    this.pdf.rect(80, yPos, 40, 30) // Top key
    this.pdf.rect(80, yPos + 70, 40, 30) // Bottom key
    
    // Add note
    this.pdf.setFontSize(8)
    this.pdf.text('Court Diagram (Generated from interactive designer)', 20, yPos + 110)
  }

  private addSection(title: string, content: string) {
    const yPos = this.pdf.getNumberOfPages() > 1 ? 220 : 220
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, 20, yPos)
    
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    
    // Word wrap for content
    const lines = this.pdf.splitTextToSize(content, 170)
    this.pdf.text(lines, 20, yPos + 10)
  }

  private addTagsSection(tags: string[]) {
    const yPos = 240
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Tags', 20, yPos)
    
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(tags.join(', '), 20, yPos + 10)
  }

  private addRelationsSection(relations: any[]) {
    const yPos = 260
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Related Plays', 20, yPos)
    
    let currentY = yPos + 10
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    
    relations.forEach(relation => {
      this.pdf.text(
        `${relation.relationType}: ${relation.relatedPlay.title}`,
        20,
        currentY
      )
      currentY += 6
    })
  }

  private addGamePlanCover(gamePlan: GamePlanWithRelations) {
    this.pdf.setFontSize(28)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(gamePlan.title, 20, 60)
    
    if (gamePlan.opponent) {
      this.pdf.setFontSize(18)
      this.pdf.text(`vs ${gamePlan.opponent}`, 20, 80)
    }
    
    if (gamePlan.gameDate) {
      this.pdf.setFontSize(14)
      this.pdf.text(`Game Date: ${new Date(gamePlan.gameDate).toLocaleDateString()}`, 20, 100)
    }
    
    if (gamePlan.defenseType) {
      this.pdf.text(`Defense Type: ${gamePlan.defenseType}`, 20, 120)
    }
    
    if (gamePlan.description) {
      this.pdf.setFontSize(12)
      this.pdf.setFont('helvetica', 'normal')
      const lines = this.pdf.splitTextToSize(gamePlan.description, 170)
      this.pdf.text(lines, 20, 140)
    }
    
    this.pdf.setFontSize(10)
    this.pdf.text(`Created by: ${gamePlan.createdBy.name || gamePlan.createdBy.email}`, 20, 200)
    this.pdf.text(`Total Plays: ${gamePlan.items.length}`, 20, 210)
    this.pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 220)
  }

  private addTableOfContents(gamePlan: GamePlanWithRelations) {
    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Table of Contents', 20, 30)
    
    let yPos = 50
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    
    // Group plays by section
    const sections = new Map<string, typeof gamePlan.items>()
    
    gamePlan.items.forEach(item => {
      const section = item.section || 'General'
      if (!sections.has(section)) {
        sections.set(section, [])
      }
      sections.get(section)!.push(item)
    })
    
    let pageNum = 3 // Starting page for plays
    
    sections.forEach((plays, sectionName) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(sectionName, 20, yPos)
      yPos += 8
      
      this.pdf.setFont('helvetica', 'normal')
      plays.forEach(play => {
        this.pdf.text(`${play.play.title}`, 30, yPos)
        this.pdf.text(`${pageNum}`, 180, yPos)
        yPos += 6
        pageNum++
      })
      
      yPos += 5
    })
  }

  private addGamePlanPlay(item: any) {
    this.addHeader(item.play.title)
    
    if (item.section) {
      this.pdf.setFontSize(14)
      this.pdf.setFont('helvetica', 'italic')
      this.pdf.text(`Section: ${item.section}`, 20, 55)
    }
    
    this.addDiagramPlaceholder()
    
    if (item.play.description) {
      this.addSection('Description', item.play.description)
    }
    
    if (item.notes) {
      this.addSection('Game Plan Notes', item.notes)
    }
    
    if (item.play.tags.length > 0) {
      this.addTagsSection(item.play.tags.map((tag: any) => tag.name))
    }
  }

  private addSequencesSection(sequences: any[]) {
    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Play Sequences', 20, 30)
    
    let yPos = 50
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    
    sequences.forEach(sequence => {
      this.pdf.text(
        `${sequence.fromPlayId} → ${sequence.toPlayId}`,
        20,
        yPos
      )
      
      if (sequence.condition) {
        this.pdf.setFont('helvetica', 'italic')
        this.pdf.text(`Condition: ${sequence.condition}`, 30, yPos + 6)
        this.pdf.setFont('helvetica', 'normal')
        yPos += 12
      } else {
        yPos += 8
      }
    })
  }
}

// Utility function to download PDF
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}