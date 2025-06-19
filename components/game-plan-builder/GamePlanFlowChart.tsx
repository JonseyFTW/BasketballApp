'use client'

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PlayNode } from './PlayNode'
import { Button } from '@/components/ui/button'
import { GamePlanFlowChart as FlowChartData } from '@/modules/gamePlans/types'

const nodeTypes: NodeTypes = {
  play: PlayNode,
}

interface GamePlanFlowChartProps {
  initialData?: FlowChartData
  onSave?: (data: FlowChartData) => void
  readOnly?: boolean
}

export function GamePlanFlowChart({ 
  initialData, 
  onSave, 
  readOnly = false 
}: GamePlanFlowChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes || []
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges || []
  )
  const [isConnecting, setIsConnecting] = useState(false)

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (readOnly) return
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, readOnly]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (readOnly) return
      console.log('Node clicked:', node)
    },
    [readOnly]
  )

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (readOnly) return
      console.log('Edge clicked:', edge)
    },
    [readOnly]
  )

  const handleSave = useCallback(() => {
    if (onSave) {
      const flowChartData: FlowChartData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: (node.type as 'play' | 'decision') || 'play',
          position: node.position,
          data: node.data,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: (edge.type as 'default' | 'conditional') || 'default',
          label: edge.label as string,
          data: edge.data,
        })),
      }
      onSave(flowChartData)
    }
  }, [nodes, edges, onSave])

  const handleAddNode = useCallback(() => {
    if (readOnly) return
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'play',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        playId: '',
        title: 'New Play',
        section: '',
        tags: [],
        notes: '',
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes, readOnly])

  const handleDeleteSelected = useCallback(() => {
    if (readOnly) return
    
    setNodes((nds) => nds.filter((node) => !node.selected))
    setEdges((eds) => eds.filter((edge) => !edge.selected))
  }, [setNodes, setEdges, readOnly])

  const handleLayoutNodes = useCallback(() => {
    if (readOnly) return
    
    // Simple auto-layout: arrange nodes in a grid
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * 250 + 50,
        y: Math.floor(index / 4) * 150 + 50,
      },
    }))
    setNodes(updatedNodes)
  }, [nodes, setNodes, readOnly])

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-white border-b border-gray-200 p-4 flex gap-2">
          <Button onClick={handleAddNode} size="sm">
            Add Play
          </Button>
          <Button onClick={handleLayoutNodes} size="sm" variant="outline">
            Auto Layout
          </Button>
          <Button 
            onClick={handleDeleteSelected} 
            size="sm" 
            variant="destructive"
          >
            Delete Selected
          </Button>
          <Button onClick={handleSave} size="sm" variant="default">
            Save Flow
          </Button>
        </div>
      )}

      {/* Flow Chart */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="bg-gray-100 p-3 text-sm text-gray-600">
          <strong>Instructions:</strong> Add plays, drag to position them, connect plays by dragging from one node's edge to another. Click elements to select and delete.
        </div>
      )}
    </div>
  )
}