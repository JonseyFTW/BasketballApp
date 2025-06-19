'use client'

import React, { useState } from 'react'
import { GamePlanFlowChart } from './GamePlanFlowChart'
import { PlaySelector } from './PlaySelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GamePlanWithRelations } from '@/modules/gamePlans/types'
import { PlayWithRelations } from '@/modules/plays/types'

interface GamePlanBuilderProps {
  gamePlan?: GamePlanWithRelations
  availablePlays: PlayWithRelations[]
  onSave?: (gamePlan: any) => void
}

export function GamePlanBuilder({ 
  gamePlan, 
  availablePlays, 
  onSave 
}: GamePlanBuilderProps) {
  const [selectedView, setSelectedView] = useState<'flowchart' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('all')

  const sections = [
    'all',
    'Half Court Sets',
    'Quick Hitters', 
    'BLOB (Baseline Out)',
    'SLOB (Sideline Out)',
    'Press Break',
    'vs Zone Defense',
    'vs Man Defense',
    'End Game',
    'Special Situations',
  ]

  const filteredPlays = availablePlays.filter(play => {
    const matchesSearch = play.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = selectedSection === 'all' || 
      play.tags.some(tag => tag.name.toLowerCase().includes(selectedSection.toLowerCase()))
    return matchesSearch && matchesSection
  })

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Game Plan Builder
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add plays and create sequences
          </p>
        </div>

        {/* View Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedView === 'list' ? 'default' : 'outline'}
              onClick={() => setSelectedView('list')}
              className="flex-1"
            >
              📋 List View
            </Button>
            <Button
              size="sm"
              variant={selectedView === 'flowchart' ? 'default' : 'outline'}
              onClick={() => setSelectedView('flowchart')}
              className="flex-1"
            >
              🔗 Flow Chart
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Plays
            </label>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Play List */}
        <div className="flex-1 overflow-y-auto">
          <PlaySelector
            plays={filteredPlays}
            onPlaySelect={(play) => {
              console.log('Selected play:', play)
              // TODO: Add play to game plan
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedView === 'list' ? (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Game Plan: {gamePlan?.title || 'New Game Plan'}
              </h3>
              
              {/* Game Plan Items List */}
              <div className="space-y-4">
                {gamePlan?.items?.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.play.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.section || 'No section'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        ↑
                      </Button>
                      <Button size="sm" variant="ghost">
                        ↓
                      </Button>
                      <Button size="sm" variant="ghost">
                        ✕
                      </Button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No plays added yet. Select plays from the sidebar to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <GamePlanFlowChart
            initialData={undefined} // TODO: Convert game plan data to flow chart format
            onSave={(data) => {
              console.log('Flow chart saved:', data)
              // TODO: Save flow chart data
            }}
          />
        )}
      </div>
    </div>
  )
}