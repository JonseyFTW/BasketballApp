'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeamsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real app this would come from API
  const mockTeams = [
    {
      id: '1',
      name: 'Lakers',
      division: 'Pacific',
      conference: 'Western',
      record: { wins: 28, losses: 15 },
      coach: 'Demo Coach',
      colors: ['#552583', '#FDB927'],
      players: 15,
      lastGame: '2024-01-15',
      nextGame: '2024-01-20',
    },
    {
      id: '2',
      name: 'Celtics',
      division: 'Atlantic',
      conference: 'Eastern',
      record: { wins: 32, losses: 11 },
      coach: 'Brad Stevens',
      colors: ['#007A33', '#BA9653'],
      players: 16,
      lastGame: '2024-01-14',
      nextGame: '2024-01-19',
    },
    {
      id: '3',
      name: 'Warriors',
      division: 'Pacific',
      conference: 'Western',
      record: { wins: 25, losses: 18 },
      coach: 'Steve Kerr',
      colors: ['#1D428A', '#FFC72C'],
      players: 14,
      lastGame: '2024-01-16',
      nextGame: '2024-01-21',
    },
  ]

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.conference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getWinPercentage = (wins: number, losses: number) => {
    return ((wins / (wins + losses)) * 100).toFixed(1)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">Manage team information and settings</p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Add Team
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Conference</Button>
          <Button variant="outline">Filter by Division</Button>
          <Button variant="outline">Sort</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTeams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTeams.reduce((sum, team) => sum + team.players, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Win %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockTeams.reduce((sum, team) => 
                  sum + parseFloat(getWinPercentage(team.record.wins, team.record.losses)), 0
                ) / mockTeams.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2023-24</div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: team.colors[0] }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{team.name}</div>
                      <div className="text-sm text-gray-600">{team.conference} - {team.division}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">⋮</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Record */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold">
                          {team.record.wins}-{team.record.losses}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getWinPercentage(team.record.wins, team.record.losses)}% Win Rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Coach</div>
                        <div className="font-medium">{team.coach}</div>
                      </div>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Players:</span>
                      <div className="font-medium">{team.players}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Conference:</span>
                      <div className="font-medium">{team.conference}</div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Last Game:</span>
                        <div className="font-medium">{new Date(team.lastGame).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Game:</span>
                        <div className="font-medium">{new Date(team.nextGame).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Team Colors */}
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-2">Team Colors</div>
                    <div className="flex gap-2">
                      {team.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      View Team
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/teams/${team.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No teams found matching your search.</div>
            <Button>Create Your First Team</Button>
          </div>
        )}
      </div>
    </Layout>
  )
}