'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  Video, 
  Settings, 
  Play,
  FileVideo,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  AnimationSequence,
  AnimationExportOptions
} from '@/modules/plays/types/animation'

interface VideoExporterProps {
  animationSequence: AnimationSequence
  onExport?: (options: AnimationExportOptions) => Promise<void>
  className?: string
}

type ExportStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error'

export function VideoExporter({
  animationSequence,
  onExport,
  className
}: VideoExporterProps) {
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [exportOptions, setExportOptions] = useState<AnimationExportOptions>({
    format: 'mp4',
    fps: 30,
    quality: 'medium',
    resolution: '1080p',
    includeAudio: false,
    watermark: true
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  /**
   * Canvas-based export (for 2D animations)
   */
  const exportCanvasVideo = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      setStatus('preparing')
      setProgress(0)
      setError(null)

      const canvas = canvasRef.current
      const stream = canvas.captureStream(exportOptions.fps)
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setStatus('processing')
        
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        
        if (exportOptions.format === 'mp4') {
          // Convert to MP4 using ffmpeg.wasm (implementation below)
          await convertToMp4(blob)
        } else {
          downloadVideo(blob, 'webm')
        }
      }

      setStatus('recording')
      mediaRecorder.start()

      // Simulate animation recording
      const duration = animationSequence.duration
      const interval = 100 // Update progress every 100ms
      
      for (let time = 0; time <= duration; time += interval) {
        setProgress((time / duration) * 100)
        await new Promise(resolve => setTimeout(resolve, interval))
      }

      mediaRecorder.stop()
      setStatus('complete')
      
    } catch (err) {
      console.error('Export error:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }, [animationSequence.duration, exportOptions])

  /**
   * Convert WebM to MP4 using ffmpeg.wasm
   */
  const convertToMp4 = useCallback(async (webmBlob: Blob) => {
    try {
      // Dynamic import to avoid SSR issues
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile } = await import('@ffmpeg/util')

      const ffmpeg = new FFmpeg()
      
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
      })

      await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob))
      
      const outputName = `animation_${Date.now()}.mp4`
      
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', exportOptions.quality === 'high' ? 'slow' : 'fast',
        '-crf', exportOptions.quality === 'high' ? '18' : '23',
        outputName
      ])

      const data = await ffmpeg.readFile(outputName)
      const mp4Blob = new Blob([data], { type: 'video/mp4' })
      
      downloadVideo(mp4Blob, 'mp4')
      
    } catch (err) {
      console.error('Conversion error:', err)
      // Fallback to WebM if conversion fails
      downloadVideo(webmBlob, 'webm')
    }
  }, [exportOptions.quality])

  /**
   * Download the generated video
   */
  const downloadVideo = useCallback((blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${animationSequence.name.replace(/\s+/g, '_')}_animation.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [animationSequence.name])

  /**
   * Screen capture export (fallback method)
   */
  const exportScreenCapture = useCallback(async () => {
    try {
      setStatus('preparing')
      setError(null)

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: exportOptions.includeAudio
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        downloadVideo(blob, 'webm')
        setStatus('complete')
      }

      setStatus('recording')
      mediaRecorder.start()

      // Auto-stop after animation duration + buffer
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach(track => track.stop())
      }, animationSequence.duration + 2000)

    } catch (err) {
      console.error('Screen capture error:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Screen capture failed')
    }
  }, [animationSequence.duration, exportOptions.includeAudio])

  const handleExport = useCallback(async () => {
    if (onExport) {
      await onExport(exportOptions)
    } else {
      // Fallback to screen capture
      await exportScreenCapture()
    }
  }, [onExport, exportOptions, exportScreenCapture])

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
      case 'recording':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing export...'
      case 'recording':
        return 'Recording animation...'
      case 'processing':
        return 'Processing video...'
      case 'complete':
        return 'Export complete!'
      case 'error':
        return `Error: ${error}`
      default:
        return 'Ready to export'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="w-5 h-5" />
          Video Export
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Export Status */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Progress Bar */}
        {(status === 'recording' || status === 'processing') && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-gray-600 text-center">
              {status === 'recording' ? `Recording: ${progress.toFixed(0)}%` : 'Processing...'}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">Export Settings</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Format</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  format: e.target.value as any 
                }))}
                className="w-full p-1 border rounded text-xs"
                disabled={status !== 'idle'}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Quality</label>
              <select
                value={exportOptions.quality}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  quality: e.target.value as any 
                }))}
                className="w-full p-1 border rounded text-xs"
                disabled={status !== 'idle'}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Resolution</label>
              <select
                value={exportOptions.resolution}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  resolution: e.target.value as any 
                }))}
                className="w-full p-1 border rounded text-xs"
                disabled={status !== 'idle'}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">FPS</label>
              <select
                value={exportOptions.fps}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  fps: parseInt(e.target.value) 
                }))}
                className="w-full p-1 border rounded text-xs"
                disabled={status !== 'idle'}
              >
                <option value={24}>24 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={exportOptions.watermark}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  watermark: e.target.checked 
                }))}
                disabled={status !== 'idle'}
              />
              Include watermark
            </label>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={status !== 'idle'}
          className="w-full"
        >
          {status === 'idle' ? (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {getStatusText()}
            </>
          )}
        </Button>

        {/* Export Info */}
        <div className="text-xs text-gray-600 space-y-1">
          <div>Duration: {Math.round(animationSequence.duration / 1000)}s</div>
          <div>Estimated size: ~{Math.round(animationSequence.duration / 1000 * exportOptions.fps * 0.1)}MB</div>
        </div>

        {/* Hidden canvas for recording */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  )
}