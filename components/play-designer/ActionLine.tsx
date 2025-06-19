'use client'

import React from 'react'
import { Line, Arrow, Group, Circle } from 'react-konva'
import { PlayAction } from '@/modules/common/types'

export interface ActionLineProps {
  action: PlayAction
  isSelected: boolean
  onSelect: () => void
  readOnly?: boolean
  isPreview?: boolean
}

export function ActionLine({ 
  action, 
  isSelected, 
  onSelect, 
  readOnly = false, 
  isPreview = false 
}: ActionLineProps) {
  const fromX = action.from.x || 0
  const fromY = action.from.y || 0
  const toX = action.to.x || 0
  const toY = action.to.y || 0

  const handleClick = (e: any) => {
    if (readOnly || isPreview) return
    e.cancelBubble = true
    onSelect()
  }

  const getLineStyle = () => {
    switch (action.type) {
      case 'pass':
        return {
          stroke: isSelected ? '#3b82f6' : '#10b981',
          strokeWidth: isSelected ? 3 : 2,
          dash: [10, 5],
        }
      case 'cut':
        return {
          stroke: isSelected ? '#3b82f6' : '#f59e0b',
          strokeWidth: isSelected ? 3 : 2,
          dash: undefined,
        }
      case 'screen':
        return {
          stroke: isSelected ? '#3b82f6' : '#8b5cf6',
          strokeWidth: isSelected ? 4 : 3,
          dash: undefined,
        }
      case 'dribble':
        return {
          stroke: isSelected ? '#3b82f6' : '#ef4444',
          strokeWidth: isSelected ? 3 : 2,
          dash: [5, 5],
        }
      default:
        return {
          stroke: isSelected ? '#3b82f6' : '#6b7280',
          strokeWidth: isSelected ? 3 : 2,
          dash: undefined,
        }
    }
  }

  const lineStyle = getLineStyle()

  if (action.type === 'screen') {
    // Draw a perpendicular line for screens
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const perpAngle = angle + Math.PI / 2
    const screenLength = 30
    
    const screenX1 = fromX + Math.cos(perpAngle) * (screenLength / 2)
    const screenY1 = fromY + Math.sin(perpAngle) * (screenLength / 2)
    const screenX2 = fromX - Math.cos(perpAngle) * (screenLength / 2)
    const screenY2 = fromY - Math.sin(perpAngle) * (screenLength / 2)

    return (
      <Group onClick={handleClick} onTap={handleClick}>
        <Line
          points={[screenX1, screenY1, screenX2, screenY2]}
          {...lineStyle}
          opacity={isPreview ? 0.5 : 1}
        />
        {/* Screen marker */}
        <Circle
          x={fromX}
          y={fromY}
          radius={4}
          fill={lineStyle.stroke}
          opacity={isPreview ? 0.5 : 1}
        />
      </Group>
    )
  }

  return (
    <Group onClick={handleClick} onTap={handleClick}>
      <Arrow
        points={[fromX, fromY, toX, toY]}
        pointerLength={10}
        pointerWidth={8}
        {...lineStyle}
        opacity={isPreview ? 0.5 : 1}
      />
      
      {/* Action type indicator */}
      {!isPreview && (
        <Circle
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2}
          radius={8}
          fill={lineStyle.stroke}
          opacity={0.8}
        />
      )}
    </Group>
  )
}