'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayWithRelations } from '@/modules/plays/types'

interface PlaySelectorProps {
  plays: PlayWithRelations[]
  onPlaySelect: (play: PlayWithRelations) => void
  selectedPlays?: string[]
}

export function PlaySelector({ 
  plays, 
  onPlaySelect, 
  selectedPlays = [] 
}: PlaySelectorProps) {
  return (
    <div className="p-4 space-y-3">
      {plays.map((play) => (
        <Card 
          key={play.id} 
          className={`
            cursor-pointer transition-all duration-200 hover:shadow-md
            ${selectedPlays.includes(play.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          `}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              {play.title}
            </CardTitle>
            {play.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {play.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Tags */}
            {play.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {play.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: (tag.color || '#3B82F6') + '20',
                      color: tag.color || '#3B82F6',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
                {play.tags.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{play.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Author and Date */}
            <div className="text-xs text-gray-500 mb-3">
              by {play.author.name || play.author.email} • {' '}
              {new Date(play.createdAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlaySelect(play)
                }}
                disabled={selectedPlays.includes(play.id)}
                className="flex-1"
              >
                {selectedPlays.includes(play.id) ? 'Added' : 'Add to Plan'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Preview play
                  console.log('Preview play:', play.id)
                }}
              >
                👁️
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {plays.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No plays found</div>
          <div className="text-xs mt-1">Try adjusting your filters</div>
        </div>
      )}
    </div>
  )
}