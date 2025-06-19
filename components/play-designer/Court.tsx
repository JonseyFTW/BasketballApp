'use client'

import React from 'react'
import { Rect, Line, Circle, Arc, Path } from 'react-konva'
import { COURT_DIMENSIONS } from '@/modules/plays/types'

export function Court() {
  const { width, height, threePointLineRadius, keyWidth, keyHeight, basketPosition } = COURT_DIMENSIONS

  // Basketball court color
  const courtColor = '#D2691E' // Basketball court brown/orange
  const lineColor = '#FFFFFF' // White lines
  const lineWidth = 2

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
        x={width / 2}
        y={height / 2}
        radius={60}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Center court small circle */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={12}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Center line (half court line) */}
      <Line
        points={[0, height / 2, width, height / 2]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* TOP HALF COURT */}
      
      {/* Top key/paint area */}
      <Rect
        x={(width - keyWidth) / 2}
        y={0}
        width={keyWidth}
        height={keyHeight}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top free throw circle */}
      <Circle
        x={width / 2}
        y={keyHeight}
        radius={60}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top free throw line */}
      <Line
        points={[(width - keyWidth) / 2, keyHeight, (width + keyWidth) / 2, keyHeight]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Top three-point arc */}
      <Arc
        x={basketPosition.x}
        y={basketPosition.y}
        innerRadius={threePointLineRadius}
        outerRadius={threePointLineRadius}
        angle={180}
        rotation={270}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Top three-point line corners */}
      <Line
        points={[basketPosition.x - threePointLineRadius * 0.86, 0, basketPosition.x - threePointLineRadius * 0.86, basketPosition.y - threePointLineRadius * 0.5]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <Line
        points={[basketPosition.x + threePointLineRadius * 0.86, 0, basketPosition.x + threePointLineRadius * 0.86, basketPosition.y - threePointLineRadius * 0.5]}
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
        innerRadius={40}
        outerRadius={40}
        angle={180}
        rotation={270}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* BOTTOM HALF COURT */}
      
      {/* Bottom key/paint area */}
      <Rect
        x={(width - keyWidth) / 2}
        y={height - keyHeight}
        width={keyWidth}
        height={keyHeight}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom free throw circle */}
      <Circle
        x={width / 2}
        y={height - keyHeight}
        radius={60}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom free throw line */}
      <Line
        points={[(width - keyWidth) / 2, height - keyHeight, (width + keyWidth) / 2, height - keyHeight]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Bottom three-point arc */}
      <Arc
        x={basketPosition.x}
        y={height - basketPosition.y}
        innerRadius={threePointLineRadius}
        outerRadius={threePointLineRadius}
        angle={180}
        rotation={90}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Bottom three-point line corners */}
      <Line
        points={[basketPosition.x - threePointLineRadius * 0.86, height, basketPosition.x - threePointLineRadius * 0.86, height - basketPosition.y + threePointLineRadius * 0.5]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <Line
        points={[basketPosition.x + threePointLineRadius * 0.86, height, basketPosition.x + threePointLineRadius * 0.86, height - basketPosition.y + threePointLineRadius * 0.5]}
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
        innerRadius={40}
        outerRadius={40}
        angle={180}
        rotation={90}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Hash marks inside the key */}
      {/* Top key hash marks */}
      <Line points={[(width - keyWidth) / 2 + 10, 70, (width - keyWidth) / 2 + 20, 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, 70, (width + keyWidth) / 2 - 10, 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width - keyWidth) / 2 + 10, 100, (width - keyWidth) / 2 + 20, 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, 100, (width + keyWidth) / 2 - 10, 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width - keyWidth) / 2 + 10, 130, (width - keyWidth) / 2 + 20, 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, 130, (width + keyWidth) / 2 - 10, 130]} stroke={lineColor} strokeWidth={lineWidth} />

      {/* Bottom key hash marks */}
      <Line points={[(width - keyWidth) / 2 + 10, height - 70, (width - keyWidth) / 2 + 20, height - 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, height - 70, (width + keyWidth) / 2 - 10, height - 70]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width - keyWidth) / 2 + 10, height - 100, (width - keyWidth) / 2 + 20, height - 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, height - 100, (width + keyWidth) / 2 - 10, height - 100]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width - keyWidth) / 2 + 10, height - 130, (width - keyWidth) / 2 + 20, height - 130]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[(width + keyWidth) / 2 - 20, height - 130, (width + keyWidth) / 2 - 10, height - 130]} stroke={lineColor} strokeWidth={lineWidth} />

      {/* Side court coaching box lines */}
      <Line points={[0, 50, 20, 50]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[width - 20, 50, width, 50]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[0, height - 50, 20, height - 50]} stroke={lineColor} strokeWidth={lineWidth} />
      <Line points={[width - 20, height - 50, width, height - 50]} stroke={lineColor} strokeWidth={lineWidth} />
    </>
  )
}