'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PlayersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real app this would come from API
  const mockPlayers = [
    {
      id: '1',
      name: 'John Smith',
      number: 1,
      position: 'PG',
      height: '6\'2"',
      weight: '180 lbs',
      stats: {
        ppg: 15.2,
        apg: 7.8,
        rpg: 4.1,
      },
    },
    {
      id: '2',
      name: 'Mike Johnson',
      number: 2,
      position: 'SG',
      height: '6\'4"',
      weight: '195 lbs',
      stats: {
        ppg: 18.5,
        apg: 3.2,
        rpg: 5.3,
      },
    },
    {
      id: '3',
      name: 'David Wilson',
      number: 3,
      position: 'SF',
      height: '6\'7"',
      weight: '210 lbs',
      stats: {
        ppg: 12.1,
        apg: 2.9,
        rpg: 6.8,
      },
    },
    {
      id: '4',
      name: 'Chris Brown',
      number: 4,
      position: 'PF',
      height: '6\'9"',
      weight: '225 lbs',
      stats: {
        ppg: 14.7,
        apg: 1.5,
        rpg: 8.9,
      },
    },
    {
      id: '5',
      name: 'Marcus Davis',
      number: 5,
      position: 'C',
      height: '6\'11"',
      weight: '240 lbs',
      stats: {
        ppg: 11.3,
        apg: 1.1,
        rpg: 10.2,
      },
    },
  ]

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'PG': return 'bg-blue-100 text-blue-800'
      case 'SG': return 'bg-green-100 text-green-800'
      case 'SF': return 'bg-yellow-100 text-yellow-800'
      case 'PF': return 'bg-purple-100 text-purple-800'
      case 'C': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="text-gray-600 mt-2">Manage your team roster and player profiles</p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Add Player
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Position</Button>
          <Button variant="outline">Sort</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPlayers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPlayers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg PPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockPlayers.reduce((sum, p) => sum + p.stats.ppg, 0) / mockPlayers.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg RPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockPlayers.reduce((sum, p) => sum + p.stats.rpg, 0) / mockPlayers.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg">
                      #{player.number}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">⋮</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <div className="font-medium">{player.height}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <div className="font-medium">{player.weight}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">Season Stats</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg">{player.stats.ppg}</div>
                        <div className="text-gray-600 text-xs">PPG</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">{player.stats.rpg}</div>
                        <div className="text-gray-600 text-xs">RPG</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">{player.stats.apg}</div>
                        <div className="text-gray-600 text-xs">APG</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/players/${player.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/players/${player.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No players found matching your search.</div>
            <Button>Add Your First Player</Button>
          </div>
        )}
      </div>
    </Layout>
  )
}