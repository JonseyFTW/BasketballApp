'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Tool } from './PlayDesigner'

export interface ToolbarProps {
  selectedTool: Tool
  onToolChange: (tool: Tool) => void
  onClearAll: () => void
  onSave: () => void
  onExportImage: () => void
  onDeleteElement: () => void
  hasSelection: boolean
}

export function Toolbar({
  selectedTool,
  onToolChange,
  onClearAll,
  onSave,
  onExportImage,
  onDeleteElement,
  hasSelection,
}: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, label: 'Select', icon: '↖️' },
    { id: 'player' as Tool, label: 'Add Player', icon: '👤' },
    { id: 'pass' as Tool, label: 'Pass', icon: '🔄' },
    { id: 'cut' as Tool, label: 'Cut', icon: '↗️' },
    { id: 'screen' as Tool, label: 'Screen', icon: '🛡️' },
    { id: 'dribble' as Tool, label: 'Dribble', icon: '⚡' },
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className={cn(
                'flex flex-col h-auto p-3 text-xs',
                selectedTool === tool.id && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              <span className="text-lg mb-1">{tool.icon}</span>
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="w-full"
          >
            💾 Save Play
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportImage}
            className="w-full"
          >
            📷 Export Image
          </Button>
          
          {hasSelection && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteElement}
              className="w-full"
            >
              🗑️ Delete Selected
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            🔄 Clear All
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Select tool and click on court to add players</p>
          <p>• Choose action tool and click-drag to draw movements</p>
          <p>• Click elements to select and edit properties</p>
          <p>• Drag players to reposition them</p>
        </div>
      </div>
    </div>
  )
}