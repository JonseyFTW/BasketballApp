'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Player, PlayAction } from '@/modules/common/types'

export interface PropertiesPanelProps {
  selectedPlayer?: Player | null
  selectedAction?: PlayAction | null
  onPlayerUpdate: (updates: Partial<Player>) => void
  onActionUpdate: (updates: Partial<PlayAction>) => void
}

export function PropertiesPanel({
  selectedPlayer,
  selectedAction,
  onPlayerUpdate,
  onActionUpdate,
}: PropertiesPanelProps) {
  if (!selectedPlayer && !selectedAction) {
    return (
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Properties</h3>
        <p className="text-xs text-gray-500">Select a player or action to edit properties</p>
      </div>
    )
  }

  return (
    <div className="p-4 border-t">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
      
      {selectedPlayer && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700">Player Properties</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Label/Number
            </label>
            <Input
              type="text"
              value={selectedPlayer.label}
              onChange={(e) => onPlayerUpdate({ label: e.target.value })}
              className="text-xs"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Position
            </label>
            <select
              value={selectedPlayer.position || ''}
              onChange={(e) => onPlayerUpdate({ position: e.target.value || undefined })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Position</option>
              <option value="PG">Point Guard (PG)</option>
              <option value="SG">Shooting Guard (SG)</option>
              <option value="SF">Small Forward (SF)</option>
              <option value="PF">Power Forward (PF)</option>
              <option value="C">Center (C)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                X Position
              </label>
              <Input
                type="number"
                value={Math.round(selectedPlayer.x)}
                onChange={(e) => onPlayerUpdate({ x: parseInt(e.target.value) || 0 })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Y Position
              </label>
              <Input
                type="number"
                value={Math.round(selectedPlayer.y)}
                onChange={(e) => onPlayerUpdate({ y: parseInt(e.target.value) || 0 })}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}
      
      {selectedAction && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700">Action Properties</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Action Type
            </label>
            <select
              value={selectedAction.type}
              onChange={(e) => onActionUpdate({ type: e.target.value as PlayAction['type'] })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="pass">Pass</option>
              <option value="cut">Cut</option>
              <option value="screen">Screen</option>
              <option value="dribble">Dribble</option>
              <option value="shot">Shot</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sequence Number
            </label>
            <Input
              type="number"
              value={selectedAction.sequence || ''}
              onChange={(e) => onActionUpdate({ sequence: parseInt(e.target.value) || undefined })}
              className="text-xs"
              placeholder="1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From X
              </label>
              <Input
                type="number"
                value={Math.round(selectedAction.from.x || 0)}
                onChange={(e) => onActionUpdate({ 
                  from: { ...selectedAction.from, x: parseInt(e.target.value) || 0 }
                })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From Y
              </label>
              <Input
                type="number"
                value={Math.round(selectedAction.from.y || 0)}
                onChange={(e) => onActionUpdate({ 
                  from: { ...selectedAction.from, y: parseInt(e.target.value) || 0 }
                })}
                className="text-xs"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To X
              </label>
              <Input
                type="number"
                value={Math.round(selectedAction.to.x || 0)}
                onChange={(e) => onActionUpdate({ 
                  to: { ...selectedAction.to, x: parseInt(e.target.value) || 0 }
                })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To Y
              </label>
              <Input
                type="number"
                value={Math.round(selectedAction.to.y || 0)}
                onChange={(e) => onActionUpdate({ 
                  to: { ...selectedAction.to, y: parseInt(e.target.value) || 0 }
                })}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}