'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlayDesigner } from '@/components/play-designer/PlayDesigner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlayDiagram } from '@/modules/common/types'
import { Play } from '@/modules/plays/types'

export default function DesignerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const playId = searchParams.get('playId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlay, setIsLoadingPlay] = useState(!!playId)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [playTitle, setPlayTitle] = useState('')
  const [playDescription, setPlayDescription] = useState('')
  const [currentDiagram, setCurrentDiagram] = useState<PlayDiagram | null>(null)
  const [existingPlay, setExistingPlay] = useState<Play | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Load existing play if playId is provided
  useEffect(() => {
    async function loadPlay() {
      if (!playId || !session) return
      
      setIsLoadingPlay(true)
      try {
        const response = await fetch(`/api/plays/${playId}`)
        if (response.ok) {
          const result = await response.json()
          const play = result.data
          setExistingPlay(play)
          setPlayTitle(play.title)
          setPlayDescription(play.description || '')
          setIsEditMode(true)
        } else {
          console.error('Failed to load play')
          router.push('/designer') // Redirect to new play if loading fails
        }
      } catch (error) {
        console.error('Error loading play:', error)
        router.push('/designer')
      } finally {
        setIsLoadingPlay(false)
      }
    }

    loadPlay()
  }, [playId, session, router])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p>Please sign in to access the play designer.</p>
        </div>
      </div>
    )
  }

  const handleSave = async (diagram: PlayDiagram) => {
    setCurrentDiagram(diagram)
    setShowSaveDialog(true)
  }

  const handleSaveConfirm = async () => {
    if (!currentDiagram || !playTitle.trim()) return

    setIsLoading(true)
    try {
      const url = isEditMode && existingPlay ? `/api/plays/${existingPlay.id}` : '/api/plays'
      const method = isEditMode && existingPlay ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: playTitle,
          description: playDescription,
          diagramJSON: currentDiagram,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const playIdToNavigate = isEditMode && existingPlay ? existingPlay.id : result.data.id
        router.push(`/plays/${playIdToNavigate}`)
      } else {
        console.error('Failed to save play')
      }
    } catch (error) {
      console.error('Error saving play:', error)
    } finally {
      setIsLoading(false)
      setShowSaveDialog(false)
    }
  }

  const SaveDialog = React.useMemo(() => {
    if (!showSaveDialog) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">
            {isEditMode ? 'Update Play' : 'Save Play'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Play Title *
              </label>
              <Input
                type="text"
                value={playTitle}
                onChange={(e) => setPlayTitle(e.target.value)}
                placeholder="Enter play name..."
                required
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={playDescription}
                onChange={(e) => setPlayDescription(e.target.value)}
                placeholder="Describe the play..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setShowSaveDialog(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfirm}
              disabled={!playTitle.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Play' : 'Save Play')}
            </Button>
          </div>
        </div>
      </div>
    )
  }, [showSaveDialog, playTitle, playDescription, isLoading])

  // Show loading state when loading an existing play
  if (isLoadingPlay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading play...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header with navigation */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">
              {isEditMode ? `Edit Play: ${existingPlay?.title || playTitle}` : 'Play Designer'}
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as {session?.user?.name || session?.user?.email}
          </div>
        </div>
      </div>
      
      <PlayDesigner 
        onSave={handleSave} 
        initialDiagram={existingPlay?.diagramJSON as PlayDiagram}
      />
      {SaveDialog}
    </>
  )
}