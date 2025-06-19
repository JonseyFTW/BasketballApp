'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DefenseTypeEnum } from '@/modules/live/types'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Shield, Users, Zap, Eye, Target } from 'lucide-react'
import { DefenseTypeInfo, getDefenseTypesByCategory } from '@/modules/live/types'
import Link from 'next/link'

export default function DefenseSelection() {
  const router = useRouter()
  const [defenseTypes, setDefenseTypes] = useState<Record<string, DefenseTypeInfo[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDefense, setSelectedDefense] = useState<DefenseTypeEnum | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefenseTypes = async () => {
      try {
        const response = await fetch('/api/live/defenses')
        const result = await response.json()
        
        if (result.success) {
          // Group defense types by category
          const categorized = getDefenseTypesByCategory()
          
          // Map API data to categorized structure
          const mappedData: Record<string, DefenseTypeInfo[]> = {}
          Object.keys(categorized).forEach(category => {
            mappedData[category] = result.data.filter((def: DefenseTypeInfo) => def.category === category)
          })
          
          setDefenseTypes(mappedData)
        }
      } catch (error) {
        console.error('Error fetching defense types:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDefenseTypes()
  }, [])

  const handleDefenseSelect = (defenseType: DefenseTypeEnum) => {
    setSelectedDefense(defenseType)
    // Redirect back to main page with selected defense
    const url = new URL('/live', window.location.origin)
    url.searchParams.set('defense', defenseType)
    router.push(url.toString())
  }

  const filteredDefenseTypes = Object.keys(defenseTypes).reduce((acc, category) => {
    const filtered = defenseTypes[category].filter(defense =>
      defense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defense.commonCounters.some(counter => 
        counter.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, DefenseTypeInfo[]>)

  const getCategoryIcon = (category: string) => {
    const icons = {
      man: Users,
      zone: Shield,
      pressure: Zap,
      specialty: Target,
      transition: Eye
    }
    return icons[category as keyof typeof icons] || Shield
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      man: 'bg-blue-50 border-blue-200',
      zone: 'bg-green-50 border-green-200',
      pressure: 'bg-red-50 border-red-200',
      specialty: 'bg-purple-50 border-purple-200',
      transition: 'bg-orange-50 border-orange-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-50 border-gray-200'
  }

  const getCategoryTitle = (category: string) => {
    const titles = {
      man: 'Man-to-Man Defenses',
      zone: 'Zone Defenses',
      pressure: 'Pressure Defenses',
      specialty: 'Specialty Defenses',
      transition: 'Transition Defenses'
    }
    return titles[category as keyof typeof titles] || category
  }

  const getDefenseCardColor = (category: string) => {
    const colors = {
      man: 'hover:bg-blue-50 hover:border-blue-300',
      zone: 'hover:bg-green-50 hover:border-green-300',
      pressure: 'hover:bg-red-50 hover:border-red-300',
      specialty: 'hover:bg-purple-50 hover:border-purple-300',
      transition: 'hover:bg-orange-50 hover:border-orange-300'
    }
    return colors[category as keyof typeof colors] || 'hover:bg-gray-50 hover:border-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading defense types...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/live">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Live Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Select Defense Type</h1>
              <p className="text-gray-600 mt-1">Choose the defense the opponent is playing</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search defenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Defense Categories */}
        <div className="space-y-8">
          {Object.keys(filteredDefenseTypes).map((category) => {
            const Icon = getCategoryIcon(category)
            
            return (
              <div key={category}>
                <Card className={`mb-4 ${getCategoryColor(category)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="w-6 h-6" />
                      {getCategoryTitle(category)}
                      <Badge variant="secondary" className="ml-2">
                        {filteredDefenseTypes[category].length} options
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDefenseTypes[category].map((defense) => (
                    <Card 
                      key={defense.type}
                      className={`cursor-pointer transition-all border-2 ${getDefenseCardColor(category)}`}
                      onClick={() => handleDefenseSelect(defense.type)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{defense.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 ${
                                category === 'man' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                category === 'zone' ? 'bg-green-100 text-green-800 border-green-300' :
                                category === 'pressure' ? 'bg-red-100 text-red-800 border-red-300' :
                                category === 'specialty' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                'bg-orange-100 text-orange-800 border-orange-300'
                              }`}
                            >
                              {category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4 text-sm">
                          {defense.description}
                        </CardDescription>

                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Key Characteristics:</h5>
                            <div className="flex flex-wrap gap-1">
                              {defense.keyCharacteristics.slice(0, 2).map((char, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Common Counters:</h5>
                            <div className="flex flex-wrap gap-1">
                              {defense.commonCounters.slice(0, 2).map((counter, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {counter}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button className="w-full mt-4" size="sm">
                          Select This Defense
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(filteredDefenseTypes).length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No defenses found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </Layout>
  )
}