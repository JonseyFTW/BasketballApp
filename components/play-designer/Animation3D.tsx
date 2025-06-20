'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Box, Plane, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  AnimationSequence,
  AnimationFrame,
  AnimatedPlayer,
  Position
} from '@/modules/plays/types/animation'

interface Animation3DProps {
  animationSequence: AnimationSequence
  currentFrame?: AnimationFrame
  className?: string
  cameraPreset?: 'courtside' | 'overhead' | 'corner' | 'broadcast'
}

// 3D Basketball Court component
function BasketballCourt() {
  const courtColor = '#e8e3d3' // Light wooden court color
  const lineColor = '#333333'
  
  return (
    <group>
      {/* Court Floor */}
      <Plane 
        args={[30, 40]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color={courtColor} />
      </Plane>
      
      {/* Court Lines */}
      <CourtLines />
      
      {/* Basketball Hoops */}
      <BasketballHoop position={[0, 3.05, -20]} />
      <BasketballHoop position={[0, 3.05, 20]} rotation={[0, Math.PI, 0]} />
    </group>
  )
}

function CourtLines() {
  const lineColor = '#333333'
  const lineWidth = 0.1
  
  const lines = useMemo(() => {
    const lineGeometry = new THREE.BufferGeometry()
    const points = []
    
    // Court boundary
    points.push(new THREE.Vector3(-15, 0.01, -20))
    points.push(new THREE.Vector3(15, 0.01, -20))
    points.push(new THREE.Vector3(15, 0.01, 20))
    points.push(new THREE.Vector3(-15, 0.01, 20))
    points.push(new THREE.Vector3(-15, 0.01, -20))
    
    // Center line
    points.push(new THREE.Vector3(-15, 0.01, 0))
    points.push(new THREE.Vector3(15, 0.01, 0))
    
    // Free throw lines
    points.push(new THREE.Vector3(-6, 0.01, -14))
    points.push(new THREE.Vector3(6, 0.01, -14))
    points.push(new THREE.Vector3(-6, 0.01, 14))
    points.push(new THREE.Vector3(6, 0.01, 14))
    
    lineGeometry.setFromPoints(points)
    return lineGeometry
  }, [])
  
  return (
    <line>
      <bufferGeometry attach="geometry" {...lines} />
      <lineBasicMaterial attach="material" color={lineColor} linewidth={2} />
    </line>
  )
}

function BasketballHoop({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Backboard */}
      <Box args={[6, 3.5, 0.2]} position={[0, 0, 0]}>
        <meshLambertMaterial color="#ffffff" transparent opacity={0.8} />
      </Box>
      
      {/* Rim */}
      <mesh position={[0, -0.6, 1]}>
        <torusGeometry args={[0.9, 0.05, 8, 16]} />
        <meshLambertMaterial color="#ff6600" />
      </mesh>
      
      {/* Net (simplified) */}
      <mesh position={[0, -1.2, 1]}>
        <cylinderGeometry args={[0.9, 0.7, 1, 8, 1, true]} />
        <meshLambertMaterial color="#ffffff" transparent opacity={0.6} wireframe />
      </mesh>
    </group>
  )
}

// 3D Player component
function Player3D({ 
  player, 
  isActive = false 
}: { 
  player: AnimatedPlayer
  isActive?: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Convert 2D court coordinates to 3D world coordinates
  const worldPosition = useMemo(() => {
    // Map from 800x600 2D court to 30x40 3D court
    const x = (player.position.x - 400) / 800 * 30
    const z = (player.position.y - 300) / 600 * 40
    return [x, 1, z] as [number, number, number]
  }, [player.position])
  
  const playerColor = isActive ? '#ff4444' : '#4444ff'
  
  return (
    <group position={worldPosition}>
      {/* Player body */}
      <Sphere ref={meshRef} args={[0.8, 16, 16]} position={[0, 0, 0]}>
        <meshLambertMaterial 
          color={playerColor} 
          transparent 
          opacity={player.opacity || 1} 
        />
      </Sphere>
      
      {/* Player number */}
      <Text
        position={[0, 2, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {player.label}
      </Text>
    </group>
  )
}

// 3D Action visualization (passes, cuts, etc.)
function Action3D({ 
  fromPlayer, 
  toPlayer, 
  progress = 0,
  actionType = 'pass'
}: {
  fromPlayer: AnimatedPlayer
  toPlayer?: AnimatedPlayer
  progress: number
  actionType?: string
}) {
  if (!toPlayer) return null
  
  const fromPos = useMemo(() => {
    const x = (fromPlayer.position.x - 400) / 800 * 30
    const z = (fromPlayer.position.y - 300) / 600 * 40
    return [x, 1, z] as [number, number, number]
  }, [fromPlayer.position])
  
  const toPos = useMemo(() => {
    const x = (toPlayer.position.x - 400) / 800 * 30
    const z = (toPlayer.position.y - 300) / 600 * 40
    return [x, 1, z] as [number, number, number]
  }, [toPlayer.position])
  
  const currentPos = useMemo(() => {
    return [
      fromPos[0] + (toPos[0] - fromPos[0]) * progress,
      fromPos[1] + (toPos[1] - fromPos[1]) * progress + Math.sin(progress * Math.PI) * 2, // Arc for passes
      fromPos[2] + (toPos[2] - fromPos[2]) * progress
    ] as [number, number, number]
  }, [fromPos, toPos, progress])
  
  if (actionType === 'pass') {
    return (
      <Sphere args={[0.15, 8, 8]} position={currentPos}>
        <meshLambertMaterial color="#ff8800" />
      </Sphere>
    )
  }
  
  return null
}

// Trail component for player movement
function PlayerTrail({ 
  positions, 
  color = '#4444ff' 
}: { 
  positions: Position[]
  color?: string 
}) {
  const points = useMemo(() => {
    return positions.map(pos => {
      const x = (pos.x - 400) / 800 * 30
      const z = (pos.y - 300) / 600 * 40
      return new THREE.Vector3(x, 0.1, z)
    })
  }, [positions])
  
  if (points.length < 2) return null
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  )
}

// Camera controller for different viewing angles
function CameraController({ preset }: { preset: string }) {
  const { camera } = useThree()
  
  useEffect(() => {
    switch (preset) {
      case 'overhead':
        camera.position.set(0, 50, 0)
        camera.lookAt(0, 0, 0)
        break
      case 'courtside':
        camera.position.set(-25, 5, 0)
        camera.lookAt(0, 2, 0)
        break
      case 'corner':
        camera.position.set(-20, 15, -25)
        camera.lookAt(0, 0, 0)
        break
      case 'broadcast':
        camera.position.set(0, 25, 30)
        camera.lookAt(0, 0, 0)
        break
      default:
        camera.position.set(0, 30, 25)
        camera.lookAt(0, 0, 0)
    }
  }, [preset, camera])
  
  return null
}

// Main 3D Animation component
export function Animation3D({
  animationSequence,
  currentFrame,
  className,
  cameraPreset = 'broadcast'
}: Animation3DProps) {
  const [playerTrails, setPlayerTrails] = useState<Map<string, Position[]>>(new Map())
  
  // Update player trails
  useEffect(() => {
    if (currentFrame && animationSequence.settings.showTrails) {
      setPlayerTrails(prevTrails => {
        const newTrails = new Map(prevTrails)
        
        currentFrame.players.forEach(player => {
          const trail = newTrails.get(player.id) || []
          const maxTrailLength = animationSequence.settings.trailLength || 5
          
          // Add current position to trail
          const newTrail = [...trail, player.position].slice(-maxTrailLength)
          newTrails.set(player.id, newTrail)
        })
        
        return newTrails
      })
    }
  }, [currentFrame, animationSequence.settings])
  
  return (
    <div className={`${className} w-full h-full bg-gradient-to-b from-blue-100 to-blue-200`}>
      <Canvas camera={{ position: [0, 30, 25], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 20, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, 20, -10]} intensity={0.6} />
        <directionalLight
          position={[0, 50, 0]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Camera controller */}
        <CameraController preset={cameraPreset} />
        
        {/* Court */}
        <BasketballCourt />
        
        {/* Players */}
        {currentFrame?.players.map(player => (
          <Player3D
            key={player.id}
            player={player}
            isActive={player.highlight}
          />
        ))}
        
        {/* Player trails */}
        {animationSequence.settings.showTrails && Array.from(playerTrails.entries()).map(([playerId, trail]) => (
          <PlayerTrail
            key={`trail-${playerId}`}
            positions={trail}
            color="#4444ff"
          />
        ))}
        
        {/* Active actions */}
        {currentFrame?.actions.map(action => {
          const fromPlayer = currentFrame.players.find(p => p.id === action.fromPlayer)
          const toPlayer = action.toPlayer ? currentFrame.players.find(p => p.id === action.toPlayer) : undefined
          
          if (!fromPlayer) return null
          
          return (
            <Action3D
              key={action.id}
              fromPlayer={fromPlayer}
              toPlayer={toPlayer}
              progress={action.progress}
              actionType={action.type}
            />
          )
        })}
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}