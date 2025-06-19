'use client'

import React from 'react'
import { Circle, Text, Group } from 'react-konva'
import { Player as PlayerType } from '@/modules/common/types'

export interface PlayerProps {
  player: PlayerType
  isSelected: boolean
  onSelect: () => void
  onMove: (position: { x: number; y: number }) => void
  readOnly?: boolean
}

export function Player({ player, isSelected, onSelect, onMove, readOnly = false }: PlayerProps) {
  const handleDragEnd = (e: any) => {
    if (readOnly) return
    
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    }
    onMove(newPos)
  }

  const handleClick = (e: any) => {
    e.cancelBubble = true
    onSelect()
  }

  return (
    <Group
      x={player.x}
      y={player.y}
      draggable={!readOnly}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Player circle */}
      <Circle
        radius={20}
        fill={isSelected ? '#3b82f6' : '#1f2937'}
        stroke={isSelected ? '#1d4ed8' : '#374151'}
        strokeWidth={2}
      />
      
      {/* Player number/label */}
      <Text
        text={player.label}
        fontSize={14}
        fontStyle="bold"
        fill="white"
        width={40}
        height={40}
        align="center"
        verticalAlign="middle"
        x={-20}
        y={-20}
      />
      
      {/* Position label if available */}
      {player.position && (
        <Text
          text={player.position}
          fontSize={10}
          fill="#6b7280"
          width={40}
          align="center"
          x={-20}
          y={25}
        />
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <Circle
          radius={25}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  )
}