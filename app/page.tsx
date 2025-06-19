'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Basketball Coach App
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Design plays, create game plans, and manage your team with our comprehensive coaching platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">✏️</span>
                Design a Play
              </CardTitle>
              <CardDescription>
                Create new basketball plays with our interactive designer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/designer">
                <Button className="w-full">Start Designing</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📋</span>
                Game Plans
              </CardTitle>
              <CardDescription>
                Build comprehensive game plans for your next matchup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gameplans">
                <Button className="w-full" variant="outline">View Game Plans</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🏀</span>
                Play Library
              </CardTitle>
              <CardDescription>
                Browse and manage your collection of basketball plays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plays">
                <Button className="w-full" variant="outline">Browse Plays</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Plays</CardTitle>
              <CardDescription>Your recently created or modified plays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Horns Set</h4>
                    <p className="text-sm text-gray-600">Modified 2 hours ago</p>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Box BLOB</h4>
                    <p className="text-sm text-gray-600">Created yesterday</p>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
                <Link href="/plays">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View All Plays
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Games</CardTitle>
              <CardDescription>Your scheduled games and preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">vs Lakers</h4>
                    <p className="text-sm text-gray-600">Tomorrow, 7:00 PM</p>
                  </div>
                  <Link href="/gameplans">
                    <Button size="sm">View Plan</Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">vs Warriors</h4>
                    <p className="text-sm text-gray-600">Next Friday, 8:00 PM</p>
                  </div>
                  <Link href="/gameplans?action=create">
                    <Button size="sm" variant="outline">Create Plan</Button>
                  </Link>
                </div>
                <Link href="/gameplans">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View All Game Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg p-8 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">🎨 Interactive Play Designer</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Drag-and-drop basketball court interface</li>
                <li>• Multiple action types (passes, cuts, screens)</li>
                <li>• Real-time play visualization</li>
                <li>• Export plays as images</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">🏆 Game Plan Builder</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Organize plays by situation</li>
                <li>• Visual flowchart sequences</li>
                <li>• Opponent-specific strategies</li>
                <li>• Shareable game plans</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">🧠 Smart Play Intelligence</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Tag-based play organization</li>
                <li>• Play relationships and counters</li>
                <li>• Situational play filtering</li>
                <li>• Adaptive play suggestions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">👥 Team Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Player profile management</li>
                <li>• Attribute-based play adaptation</li>
                <li>• Team collaboration tools</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}