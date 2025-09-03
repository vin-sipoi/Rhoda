"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DebugPage = () => {
  const { user, token } = useAuth()
  const [strapiData, setStrapiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStrapiData = async () => {
    if (!token) {
      setError('No token available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/debug/strapi-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch data')
      }

      const data = await response.json()
      setStrapiData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchStrapiData()
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Strapi Data Debug</h1>
          <Button onClick={fetchStrapiData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Auth Context User Data */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Context User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Token Info */}
        <Card>
          <CardHeader>
            <CardTitle>Token Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</p>
              {token && (
                <div>
                  <p><strong>Token (first 50 chars):</strong></p>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    {token.substring(0, 50)}...
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raw Strapi Data */}
        {strapiData && (
          <Card>
            <CardHeader>
              <CardTitle>Raw Strapi Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Strapi URL:</h3>
                  <code className="bg-gray-100 p-2 rounded text-sm">{strapiData.strapiUrl}</code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">User Data:</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                    {JSON.stringify(strapiData.user, null, 2)}
                  </pre>
                </div>

                {strapiData.additional?.learners && (
                  <div>
                    <h3 className="font-semibold mb-2">Learners Data:</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                      {JSON.stringify(strapiData.additional.learners, null, 2)}
                    </pre>
                  </div>
                )}

                {strapiData.additional?.educators && (
                  <div>
                    <h3 className="font-semibold mb-2">Educators Data:</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                      {JSON.stringify(strapiData.additional.educators, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function DebugPageWrapper() {
  return (
    <ProtectedRoute>
      <DebugPage />
    </ProtectedRoute>
  )
}
