'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Truck, MapPin, Calendar, DollarSign, Star, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  bookingNumber: string
  pickupLocation: string
  dropLocation: string
  truckType: string
  scheduledDate: string
  totalFare: number
  status: string
  paymentStatus: string
  customer?: {
    name: string
    phone: string
  }
  driver?: {
    name: string
    phone: string
  }
  truck?: {
    truckNumber: string
    type: string
    capacity: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/')
    }
  }, [status])

  useEffect(() => {
    if (session?.user) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isCustomer = session.user.role === 'CUSTOMER'
  const isDriver = session.user.role === 'DRIVER'
  const isAdmin = session.user.role === 'ADMIN'

  const customerBookings = bookings.filter(booking => 
    booking.customer?.phone === session.user.phone
  )
  const driverBookings = bookings.filter(booking => 
    booking.driver?.phone === session.user.phone
  )

  const pendingBookings = bookings.filter(b => b.status === 'PENDING')
  const activeBookings = bookings.filter(b => ['ASSIGNED', 'IN_PROGRESS'].includes(b.status))
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {session.user.name || session.user.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="capitalize">
                {session.user.role.toLowerCase()}
              </Badge>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Controls */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>Manage users and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button onClick={() => window.location.href = '/admin/users'}>
                  Manage Users
                </Button>
                <Button onClick={() => window.location.href = '/admin/bookings'}>
                  Manage Bookings
                </Button>
                <Button onClick={() => window.location.href = '/admin/pricing'}>
                  Pricing Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Driver Controls */}
        {isDriver && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Driver Dashboard</CardTitle>
              <CardDescription>Manage your availability and trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button onClick={() => window.location.href = '/driver/profile'}>
                  My Profile
                </Button>
                <Button onClick={() => window.location.href = '/driver/earnings'}>
                  My Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              {isCustomer && 'Your booking history'}
              {isDriver && 'Trip assignments'}
              {isAdmin && 'All system bookings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <BookingsTable bookings={bookings} session={session} />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <BookingsTable bookings={pendingBookings} session={session} />
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <BookingsTable bookings={activeBookings} session={session} />
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <BookingsTable bookings={completedBookings} session={session} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BookingsTable({ bookings, session }: { bookings: Booking[], session: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Booking #</th>
            <th className="text-left p-2">Route</th>
            <th className="text-left p-2">Truck Type</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Fare</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Payment</th>
            {(session.user.role === 'ADMIN' || session.user.role === 'DRIVER') && (
              <th className="text-left p-2">Customer</th>
            )}
            {session.user.role === 'ADMIN' && (
              <th className="text-left p-2">Driver</th>
            )}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-mono text-sm">{booking.bookingNumber}</td>
              <td className="p-2">
                <div className="max-w-xs">
                  <div className="text-sm font-medium truncate">{booking.pickupLocation}</div>
                  <div className="text-xs text-gray-500 truncate">→ {booking.dropLocation}</div>
                </div>
              </td>
              <td className="p-2">
                <Badge variant="outline">{booking.truckType}</Badge>
              </td>
              <td className="p-2 text-sm">
                {new Date(booking.scheduledDate).toLocaleDateString()}
              </td>
              <td className="p-2 font-medium">₹{booking.totalFare.toFixed(2)}</td>
              <td className="p-2">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="p-2">
                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
              </td>
              {(session.user.role === 'ADMIN' || session.user.role === 'DRIVER') && (
                <td className="p-2 text-sm">
                  {booking.customer?.name || booking.customer?.phone || 'N/A'}
                </td>
              )}
              {session.user.role === 'ADMIN' && (
                <td className="p-2 text-sm">
                  {booking.driver?.name || booking.driver?.phone || 'Unassigned'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}