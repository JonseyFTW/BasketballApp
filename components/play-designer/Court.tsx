'use client'

import React from 'react'
import { Rect, Line, Circle, Arc } from 'react-konva'
import { COURT_DIMENSIONS } from '@/modules/plays/types'

export function Court() {
  const { width, height, keyWidth, keyHeight, basketPosition } = COURT_DIMENSIONS

  // Basketball court color
  const courtColor = '#D2691E' // Basketball court brown/orange
  const lineColor = '#FFFFFF' // White lines
  const lineWidth = 2

  // Calculated dimensions for accurate court markings
  const centerX = width / 2
  const centerY = height / 2
  
  // Three-point line specific calculations (NBA/college standard proportions)
  const threePointRadius = 237.5 // Radius of three-point arc (scaled for 800px court)
  const cornerThreeDistance = 220 // Distance from basket to corner three
  const threePointCornerY = 140 // How far the corner three extends from baseline
  
  // Free throw dimensions
  const freeThrowRadius = 60
  const restrictedAreaRadius = 40

  return (
    <>
      {/* Court background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={courtColor}
      />

      {/* Court outline */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={lineColor}
        strokeWidth={3}
        fill="transparent"
      />

      {/* Center court circle */}
      <Circle
        x={centerX}
        y={centerY}
        radius={60}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Center court small circle */}
      <Circle
        x={centerX}
        y={centerY}
        radius={12}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Center line (half court line) */}
      <Line
        points={[0, centerY, width, centerY]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* TOP HALF COURT */}
      
      {/* Top key/paint area */}
      <Rect
        x={centerX - keyWidth / 2}
        y={0}
        width={keyWidth}
        height={keyHeight}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top free throw circle */}
      <Circle
        x={centerX}
        y={keyHeight}
        radius={freeThrowRadius}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top free throw line */}
      <Line
        points={[centerX - keyWidth / 2, keyHeight, centerX + keyWidth / 2, keyHeight]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Top three-point arc - proper arc that doesn't extend to sidelines */}
      <Arc
        x={basketPosition.x}
        y={basketPosition.y}
        innerRadius={threePointRadius}
        outerRadius={threePointRadius}
        angle={180}
        rotation={270}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top three-point corner lines - straight lines from arc to baseline */}
      <Line
        points={[
          basketPosition.x - cornerThreeDistance, 
          basketPosition.y - Math.sqrt(threePointRadius * threePointRadius - cornerThreeDistance * cornerThreeDistance),
          basketPosition.x - cornerThreeDistance, 
          0
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <Line
        points={[
          basketPosition.x + cornerThreeDistance, 
          basketPosition.y - Math.sqrt(threePointRadius * threePointRadius - cornerThreeDistance * cornerThreeDistance),
          basketPosition.x + cornerThreeDistance, 
          0
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Top basket */}
      <Circle
        x={basketPosition.x}
        y={basketPosition.y}
        radius={9}
        stroke="#FF4500"
        strokeWidth={3}
        fill="transparent"
      />

      {/* Top backboard */}
      <Line
        points={[basketPosition.x - 30, basketPosition.y - 5, basketPosition.x + 30, basketPosition.y - 5]}
        stroke={lineColor}
        strokeWidth={4}
      />

      {/* Top restricted area arc */}
      <Arc
        x={basketPosition.x}
        y={basketPosition.y}
        innerRadius={restrictedAreaRadius}
        outerRadius={restrictedAreaRadius}
        angle={180}
        rotation={270}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* BOTTOM HALF COURT */}
      
      {/* Bottom key/paint area */}
      <Rect
        x={centerX - keyWidth / 2}
        y={height - keyHeight}
        width={keyWidth}
        height={keyHeight}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom free throw circle */}
      <Circle
        x={centerX}
        y={height - keyHeight}
        radius={freeThrowRadius}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom free throw line */}
      <Line
        points={[centerX - keyWidth / 2, height - keyHeight, centerX + keyWidth / 2, height - keyHeight]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Bottom three-point arc */}
      <Arc
        x={basketPosition.x}
        y={height - basketPosition.y}
        innerRadius={threePointRadius}
        outerRadius={threePointRadius}
        angle={180}
        rotation={90}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom three-point corner lines */}
      <Line
        points={[
          basketPosition.x - cornerThreeDistance, 
          height - basketPosition.y + Math.sqrt(threePointRadius * threePointRadius - cornerThreeDistance * cornerThreeDistance),
          basketPosition.x - cornerThreeDistance, 
          height
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <Line
        points={[
          basketPosition.x + cornerThreeDistance, 
          height - basketPosition.y + Math.sqrt(threePointRadius * threePointRadius - cornerThreeDistance * cornerThreeDistance),
          basketPosition.x + cornerThreeDistance, 
          height
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Bottom basket */}
      <Circle
        x={basketPosition.x}
        y={height - basketPosition.y}
        radius={9}
        stroke="#FF4500"
        strokeWidth={3}
        fill="transparent"
      />

      {/* Bottom backboard */}
      <Line
        points={[basketPosition.x - 30, height - basketPosition.y + 5, basketPosition.x + 30, height - basketPosition.y + 5]}
        stroke={lineColor}
        strokeWidth={4}
      />

      {/* Bottom restricted area arc */}
      <Arc
        x={basketPosition.x}
        y={height - basketPosition.y}
        innerRadius={restrictedAreaRadius}
        outerRadius={restrictedAreaRadius}
        angle={180}
        rotation={90}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Hash marks inside the key - properly spaced */}
      {/* Top key hash marks */}
      <Line points={[centerX - keyWidth / 2 + 8, 70, centerX - keyWidth / 2 + 18, 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, 70, centerX + keyWidth / 2 - 8, 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, 100, centerX - keyWidth / 2 + 18, 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, 100, centerX + keyWidth / 2 - 8, 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, 130, centerX - keyWidth / 2 + 18, 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, 130, centerX + keyWidth / 2 - 8, 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, 160, centerX - keyWidth / 2 + 18, 160]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, 160, centerX + keyWidth / 2 - 8, 160]} stroke={lineColor} strokeWidth={lineWidth} />

      {/* Bottom key hash marks */}
      <Line points={[centerX - keyWidth / 2 + 8, height - 70, centerX - keyWidth / 2 + 18, height - 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, height - 70, centerX + keyWidth / 2 - 8, height - 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, height - 100, centerX - keyWidth / 2 + 18, height - 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, height - 100, centerX + keyWidth / 2 - 8, height - 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, height - 130, centerX - keyWidth / 2 + 18, height - 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, height - 130, centerX + keyWidth / 2 - 8, height - 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX - keyWidth / 2 + 8, height - 160, centerX - keyWidth / 2 + 18, height - 160]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[centerX + keyWidth / 2 - 18, height - 160, centerX + keyWidth / 2 - 8, height - 160]} stroke={lineColor} strokeWidth={lineWidth} />

      {/* Coaching box lines */}
      <Line points={[0, centerY - 140, 20, centerY - 140]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[width - 20, centerY - 140, width, centerY - 140]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[0, centerY + 140, 20, centerY + 140]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[width - 20, centerY + 140, width, centerY + 140]} stroke={lineColor} strokeWidth={lineWidth} />
    </>
  )
}