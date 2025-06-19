'use client'

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PlayNodeData {
  playId: string
  title: string
  section?: string
  tags: string[]
  notes?: string
}

export function PlayNode({ data, selected }: NodeProps<PlayNodeData>) {
  return (
    <div className="min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      <Card className={`
        shadow-lg transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'}
      `}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">
            {data.title}
          </CardTitle>
          {data.section && (
            <div className="text-xs text-gray-500 font-medium">
              {data.section}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {data.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {data.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{data.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Notes */}
          {data.notes && (
            <div className="text-xs text-gray-600 truncate">
              {data.notes}
            </div>
          )}
          
          {/* Play indicator */}
          <div className="mt-2 flex items-center justify-center">
            <div className="w-8 h-6 bg-orange-100 rounded border border-orange-300 flex items-center justify-center">
              <span className="text-xs font-bold text-orange-600">🏀</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  )
}