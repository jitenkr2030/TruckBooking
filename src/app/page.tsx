'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Truck, MapPin, Calendar, Package, Phone, Star, Navigation, DollarSign } from 'lucide-react'
import { BookingForm } from '@/components/booking-form'
import { AuthModal } from '@/components/auth-modal'

export default function Home() {
  const { data: session, status } = useSession()
  const [showAuth, setShowAuth] = useState(false)

  const truckTypes = [
    { type: 'MINI', name: 'Mini Truck', capacity: '0.5-1 ton', description: 'Small loads, city delivery' },
    { type: 'FT_14', name: '14ft Truck', capacity: '2-3 tons', description: 'Medium loads, local transport' },
    { type: 'FT_20', name: '20ft Truck', capacity: '4-5 tons', description: 'Large loads, intercity' },
    { type: 'FT_32', name: '32ft Truck', capacity: '6-8 tons', description: 'Heavy loads, long distance' },
    { type: 'CONTAINER', name: 'Container', capacity: '10+ tons', description: 'Industrial cargo' },
    { type: 'OPEN', name: 'Open Body', capacity: '3-6 tons', description: 'Bulky items, machinery' },
    { type: 'CLOSED', name: 'Closed Body', capacity: '3-6 tons', description: 'Protected cargo' }
  ]

  const features = [
    { icon: Truck, title: 'Multiple Truck Types', description: 'Choose from mini trucks to containers' },
    { icon: Navigation, title: 'Live Tracking', description: 'Real-time GPS tracking of your shipment' },
    { icon: DollarSign, title: 'Transparent Pricing', description: 'No hidden charges, GST invoices' },
    { icon: Phone, title: '24/7 Support', description: 'Dedicated customer support team' },
    { icon: Star, title: 'Verified Drivers', description: 'Professional and experienced drivers' },
    { icon: Package, title: 'Insurance Coverage', description: 'Comprehensive insurance for all shipments' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TruckBooking</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#truck-types" className="text-gray-600 hover:text-gray-900">Truck Types</a>
          </nav>

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {session.user.phone} ({session.user.role})
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuth(true)}>
                Sign In / Register
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Book Trucks Instantly for
              <span className="text-blue-600"> Your Business</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reliable truck booking platform with real-time tracking, transparent pricing, 
              and verified drivers. Move your goods safely and efficiently.
            </p>
          </div>

          {/* Quick Booking Form */}
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Quick Booking
              </CardTitle>
              <CardDescription>
                Enter your details to get instant fare estimate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TruckBooking?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make truck booking simple, reliable, and affordable for businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Truck Types Section */}
      <section id="truck-types" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available Truck Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right truck for your cargo needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {truckTypes.map((truck, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{truck.name}</CardTitle>
                    <Badge variant="secondary">{truck.capacity}</Badge>
                  </div>
                  <CardDescription>{truck.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Capacity: {truck.capacity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book your truck in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Enter Details', desc: 'Pickup, drop location & truck type' },
              { step: 2, title: 'Get Quote', desc: 'Instant fare calculation' },
              { step: 3, title: 'Book & Pay', desc: 'Confirm booking and pay' },
              { step: 4, title: 'Track Delivery', desc: 'Real-time tracking until delivery' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6" />
                <span className="text-xl font-bold">TruckBooking</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for reliable truck booking services.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Local Transport</li>
                <li>Intercity Logistics</li>
                <li>Warehousing</li>
                <li>Fleet Management</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Safety</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TruckBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}