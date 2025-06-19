'use client'

import React, { useState } from 'react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { PDFGenerator, downloadPDF } from '@/lib/export/pdf-generator'
import { PlayWithRelations } from '@/modules/plays/types'
import { GamePlanWithRelations } from '@/modules/gamePlans/types'

interface ExportMenuProps {
  play?: PlayWithRelations
  gamePlan?: GamePlanWithRelations
  onShare?: () => void
}

export function ExportMenu({ play, gamePlan, onShare }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!play && !gamePlan) return
    
    setIsExporting(true)
    try {
      const generator = new PDFGenerator()
      let blob: Blob
      let filename: string

      if (play) {
        blob = await generator.generatePlayPDF(play)
        filename = `${play.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_play.pdf`
      } else if (gamePlan) {
        blob = await generator.generateGamePlanPDF(gamePlan)
        filename = `${gamePlan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_gameplan.pdf`
      } else {
        return
      }

      downloadPDF(blob, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyLink = async () => {
    if (!play && !gamePlan) return
    
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      // TODO: Show toast notification
      console.log('Link copied to clipboard')
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const handleShareLink = () => {
    if (onShare) {
      onShare()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          📤 Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          📄 {isExporting ? 'Generating PDF...' : 'Export as PDF'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          🔗 Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLink}>
          🌐 Generate Share Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // TODO: Export as image
          console.log('Export as image')
        }}>
          🖼️ Export as Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}