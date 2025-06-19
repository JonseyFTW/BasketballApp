'use client'

import React from 'react'
import { Stage, Layer } from 'react-konva'
import { Court } from './Court'
import { Player } from './Player'
import { ActionLine } from './ActionLine'
import { PlayDiagram, Player as PlayerType, PlayAction } from '@/modules/common/types'

export interface CourtViewerProps {
  width?: number
  height?: number
  players?: PlayerType[]
  actions?: PlayAction[]
  readonly?: boolean
  showGrid?: boolean
  diagram?: PlayDiagram
}

export function CourtViewer({ 
  width = 800, 
  height = 600, 
  players = [], 
  actions = [], 
  readonly = true,
  diagram
}: CourtViewerProps) {
  // Use diagram data if provided, otherwise use individual props
  const playersToRender = diagram?.players || players
  const actionsToRender = diagram?.actions || actions

  return (
    <div className="court-viewer" style={{ width, height }}>
      <Stage
        width={width}
        height={height}
        scaleX={width / 800}
        scaleY={height / 600}
      >
        <Layer>
          <Court />
          
          {/* Render players */}
          {playersToRender.map((player) => (
            <Player
              key={player.id}
              player={player}
              isSelected={false}
              onSelect={() => {}}
              onMove={() => {}}
              readOnly={readonly}
            />
          ))}

          {/* Render actions */}
          {actionsToRender.map((action) => (
            <ActionLine
              key={action.id}
              action={action}
              isSelected={false}
              onSelect={() => {}}
              readOnly={readonly}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}