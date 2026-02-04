'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, MessageCircle, Clock, Send } from 'lucide-react'
import { GoogleMap } from './google-maps'

interface Location {
  lat: number
  lng: number
}

interface TrackingData {
  bookingId: string
  driverId: string
  location: Location
  speed?: number
  heading?: number
  timestamp: string
}

interface ChatMessage {
  bookingId: string
  senderId: string
  senderRole: string
  message: string
  timestamp: string
}

interface RealTimeTrackingProps {
  bookingId: string
  userRole: 'customer' | 'driver'
  userId: string
  driverLocation?: Location
  pickupLocation?: Location
  dropLocation?: Location
}

export function RealTimeTracking({ 
  bookingId, 
  userRole, 
  userId, 
  driverLocation,
  pickupLocation,
  dropLocation 
}: RealTimeTrackingProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(driverLocation || null)
  const [eta, setEta] = useState<string>('')
  const [distance, setDistance] = useState<string>('')
  const [status, setStatus] = useState<string>('IN_PROGRESS')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/', {
      query: { XTransformPort: 3001 }
    })

    newSocket.on('connect', () => {
      console.log('Connected to tracking service')
      setIsConnected(true)
      
      // Join appropriate room
      if (userRole === 'driver') {
        newSocket.emit('driver-join', { userId, bookingId })
      } else {
        newSocket.emit('customer-join', { userId, bookingId })
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from tracking service')
      setIsConnected(false)
    })

    // Listen for location updates
    newSocket.on('location-update', (data: TrackingData) => {
      setCurrentLocation(data.location)
      console.log('Location update received:', data)
    })

    // Listen for status updates
    newSocket.on('status-update', (data) => {
      setStatus(data.status)
    })

    // Listen for ETA updates
    newSocket.on('eta-update', (data) => {
      setEta(data.eta)
      setDistance(data.distance)
    })

    // Listen for chat messages
    newSocket.on('chat-message', (data: ChatMessage) => {
      setChatMessages(prev => [...prev, data])
    })

    socketRef.current = newSocket
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [bookingId, userRole, userId])

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Driver location updates
  useEffect(() => {
    if (userRole === 'driver' && socket && isConnected) {
      const interval = setInterval(() => {
        // Mock location update - in real app, get from GPS
        const mockLocation = {
          lat: (driverLocation?.lat || 19.0760) + (Math.random() - 0.5) * 0.01,
          lng: (driverLocation?.lng || 72.8777) + (Math.random() - 0.5) * 0.01
        }
        
        socket.emit('location-update', {
          userId,
          bookingId,
          location: mockLocation,
          speed: Math.floor(Math.random() * 40) + 20,
          heading: Math.floor(Math.random() * 360)
        })
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [userRole, socket, isConnected, userId, bookingId, driverLocation])

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit('chat-message', {
        bookingId,
        senderId: userId,
        senderRole: userRole,
        message: newMessage.trim()
      })
      setNewMessage('')
    }
  }

  const updateStatus = (newStatus: string) => {
    if (socket) {
      socket.emit('status-update', {
        bookingId,
        status: newStatus,
        message: `Status updated to ${newStatus}`
      })
      setStatus(newStatus)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map and Tracking Info */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Live Tracking
              </CardTitle>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <CardDescription>
              Real-time location tracking for booking #{bookingId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentLocation && (
              <GoogleMap 
                pickup={pickupLocation}
                drop={dropLocation}
              />
            )}
            
            {/* Tracking Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {distance || '--'}
                </div>
                <div className="text-sm text-gray-600">Distance (km)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {eta || '--'}
                </div>
                <div className="text-sm text-gray-600">ETA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {status.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentLocation ? 'Live' : '--'}
                </div>
                <div className="text-sm text-gray-600">Tracking</div>
              </div>
            </div>

            {/* Driver Controls */}
            {userRole === 'driver' && (
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => updateStatus('ARRIVED_PICKUP')}
                  variant="outline"
                  size="sm"
                >
                  Arrived Pickup
                </Button>
                <Button 
                  onClick={() => updateStatus('LOADED')}
                  variant="outline"
                  size="sm"
                >
                  Loaded
                </Button>
                <Button 
                  onClick={() => updateStatus('ARRIVED_DESTINATION')}
                  variant="outline"
                  size="sm"
                >
                  Arrived Destination
                </Button>
                <Button 
                  onClick={() => updateStatus('DELIVERED')}
                  size="sm"
                >
                  Delivered
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription>
              Chat with {userRole === 'driver' ? 'customer' : 'driver'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.senderId === userId 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {msg.senderRole}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}