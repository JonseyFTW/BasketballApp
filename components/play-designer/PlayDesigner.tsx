'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import { Court } from './Court'
import { Player } from './Player'
import { ActionLine } from './ActionLine'
import { Toolbar } from './Toolbar'
import { PropertiesPanel } from './PropertiesPanel'
import { PlayDiagram, Player as PlayerType, PlayAction } from '@/modules/common/types'
import { COURT_DIMENSIONS } from '@/modules/plays/types'
import { v4 as uuidv4 } from 'uuid'

export interface PlayDesignerProps {
  initialDiagram?: PlayDiagram
  onSave?: (diagram: PlayDiagram) => void
  readOnly?: boolean
}

export type Tool = 'select' | 'player' | 'pass' | 'cut' | 'screen' | 'dribble'

export function PlayDesigner({ 
  initialDiagram, 
  onSave, 
  readOnly = false 
}: PlayDesignerProps) {
  const [diagram, setDiagram] = useState<PlayDiagram>(
    initialDiagram || {
      players: [],
      actions: [],
      courtDimensions: COURT_DIMENSIONS,
    }
  )
  
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null)
  
  const stageRef = useRef<any>(null)

  const handleAddPlayer = useCallback((position: { x: number; y: number }) => {
    const playerNumber = diagram.players.length + 1
    const newPlayer: PlayerType = {
      id: uuidv4(),
      label: playerNumber.toString(),
      x: position.x,
      y: position.y,
    }

    setDiagram(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }))
  }, [diagram.players.length])

  const handlePlayerMove = useCallback((playerId: string, newPosition: { x: number; y: number }) => {
    setDiagram(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === playerId ? { ...player, ...newPosition } : player
      ),
    }))
  }, [])

  const handleStageClick = useCallback((e: any) => {
    if (readOnly) return

    const pos = e.target.getStage().getPointerPosition()
    
    // Check if clicking on stage or court (not on a player or action)
    const isEmptyArea = e.target === e.target.getStage() || 
                       e.target.getClassName() === 'Rect' || 
                       e.target.getClassName() === 'Line' || 
                       e.target.getClassName() === 'Circle' ||
                       e.target.getClassName() === 'Arc'
    
    // Clear selection if clicking on empty area
    if (isEmptyArea) {
      setSelectedElement(null)
    }

    // Handle adding players
    if (selectedTool === 'player' && isEmptyArea) {
      handleAddPlayer(pos)
      setSelectedTool('select') // Auto-switch back to select tool
    }

    // Handle drawing actions
    if (['pass', 'cut', 'screen', 'dribble'].includes(selectedTool) && isEmptyArea) {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawingStart(pos)
      } else {
        // Complete the action drawing
        if (drawingStart) {
          const newAction: PlayAction = {
            id: uuidv4(),
            type: selectedTool as PlayAction['type'],
            from: { x: drawingStart.x, y: drawingStart.y },
            to: { x: pos.x, y: pos.y },
          }

          setDiagram(prev => ({
            ...prev,
            actions: [...prev.actions, newAction],
          }))
        }
        
        setIsDrawing(false)
        setDrawingStart(null)
        setSelectedTool('select')
      }
    }
  }, [selectedTool, isDrawing, drawingStart, readOnly, handleAddPlayer])

  const handleDeleteElement = useCallback(() => {
    if (!selectedElement) return

    setDiagram(prev => ({
      ...prev,
      players: prev.players.filter(player => player.id !== selectedElement),
      actions: prev.actions.filter(action => action.id !== selectedElement),
    }))
    
    setSelectedElement(null)
  }, [selectedElement])

  const handleClearAll = useCallback(() => {
    setDiagram({
      players: [],
      actions: [],
      courtDimensions: COURT_DIMENSIONS,
    })
    setSelectedElement(null)
  }, [])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(diagram)
    }
  }, [diagram, onSave])

  const handleExportImage = useCallback(() => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2,
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = 'basketball-play.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [])

  const selectedPlayer = selectedElement 
    ? diagram.players.find(p => p.id === selectedElement)
    : null

  const selectedAction = selectedElement
    ? diagram.actions.find(a => a.id === selectedElement)
    : null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbar */}
      {!readOnly && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <Toolbar
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            onClearAll={handleClearAll}
            onSave={handleSave}
            onExportImage={handleExportImage}
            onDeleteElement={handleDeleteElement}
            hasSelection={!!selectedElement}
          />
          
          <PropertiesPanel
            selectedPlayer={selectedPlayer}
            selectedAction={selectedAction}
            onPlayerUpdate={(updates) => {
              if (selectedPlayer) {
                setDiagram(prev => ({
                  ...prev,
                  players: prev.players.map(player =>
                    player.id === selectedPlayer.id ? { ...player, ...updates } : player
                  ),
                }))
              }
            }}
            onActionUpdate={(updates) => {
              if (selectedAction) {
                setDiagram(prev => ({
                  ...prev,
                  actions: prev.actions.map(action =>
                    action.id === selectedAction.id ? { ...action, ...updates } : action
                  ),
                }))
              }
            }}
          />
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="court-canvas">
          <Stage
            ref={stageRef}
            width={COURT_DIMENSIONS.width}
            height={COURT_DIMENSIONS.height}
            onClick={handleStageClick}
          >
            <Layer>
              <Court />
              
              {/* Render players */}
              {diagram.players.map((player) => (
                <Player
                  key={player.id}
                  player={player}
                  isSelected={selectedElement === player.id}
                  onSelect={() => setSelectedElement(player.id)}
                  onMove={(newPos) => handlePlayerMove(player.id, newPos)}
                  readOnly={readOnly}
                />
              ))}

              {/* Render actions */}
              {diagram.actions.map((action) => (
                <ActionLine
                  key={action.id}
                  action={action}
                  isSelected={selectedElement === action.id}
                  onSelect={() => setSelectedElement(action.id)}
                  readOnly={readOnly}
                />
              ))}

              {/* Show drawing preview */}
              {isDrawing && drawingStart && (
                <ActionLine
                  action={{
                    id: 'preview',
                    type: selectedTool as PlayAction['type'],
                    from: drawingStart,
                    to: drawingStart, // Will be updated by mouse position
                  }}
                  isSelected={false}
                  onSelect={() => {}}
                  readOnly={true}
                  isPreview={true}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}