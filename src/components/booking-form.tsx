'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Package, Calculator, Truck, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface BookingData {
  pickupLocation: string
  dropLocation: string
  truckType: string
  loadType: string
  loadWeight: string
  scheduledDate: string
  scheduledTime: string
  specialInstructions: string
}

interface FareEstimate {
  baseFare: number
  distance: number
  tollCharges: number
  fuelSurcharge: number
  gstAmount: number
  totalFare: number
}

export function BookingForm() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<FareEstimate | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>({
    pickupLocation: '',
    dropLocation: '',
    truckType: '',
    loadType: '',
    loadWeight: '',
    scheduledDate: '',
    scheduledTime: '',
    specialInstructions: ''
  })

  const truckTypes = [
    { value: 'MINI', label: 'Mini Truck (0.5-1 ton)' },
    { value: 'FT_14', label: '14ft Truck (2-3 tons)' },
    { value: 'FT_20', label: '20ft Truck (4-5 tons)' },
    { value: 'FT_32', label: '32ft Truck (6-8 tons)' },
    { value: 'CONTAINER', label: 'Container (10+ tons)' },
    { value: 'OPEN', label: 'Open Body (3-6 tons)' },
    { value: 'CLOSED', label: 'Closed Body (3-6 tons)' }
  ]

  const loadTypes = [
    'General Goods',
    'Electronics',
    'Furniture',
    'Machinery',
    'Food Items',
    'Chemicals',
    'Construction Materials',
    'Documents',
    'Other'
  ]

  const calculateFare = async () => {
    if (!bookingData.pickupLocation || !bookingData.dropLocation || !bookingData.truckType) {
      toast.error('Please fill in pickup, drop location, and truck type')
      return
    }

    setLoading(true)
    try {
      // Mock API call for fare calculation
      // In production, this would call a real API with Google Maps
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockDistance = Math.floor(Math.random() * 50) + 10 // 10-60 km
      const baseRate = bookingData.truckType === 'MINI' ? 15 : 
                      bookingData.truckType === 'FT_14' ? 20 :
                      bookingData.truckType === 'FT_20' ? 25 :
                      bookingData.truckType === 'FT_32' ? 35 :
                      bookingData.truckType === 'CONTAINER' ? 45 : 30
      
      const baseFare = mockDistance * baseRate
      const tollCharges = Math.floor(Math.random() * 200) + 50
      const fuelSurcharge = baseFare * 0.1
      const subtotal = baseFare + tollCharges + fuelSurcharge
      const gstAmount = subtotal * 0.18
      const totalFare = subtotal + gstAmount

      setEstimate({
        baseFare,
        distance: mockDistance,
        tollCharges,
        fuelSurcharge,
        gstAmount,
        totalFare
      })
      
      toast.success('Fare calculated successfully!')
    } catch (error) {
      toast.error('Failed to calculate fare. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!session) {
      toast.error('Please sign in to book a truck')
      return
    }

    if (!estimate) {
      toast.error('Please calculate fare first')
      return
    }

    if (!bookingData.scheduledDate || !bookingData.scheduledTime) {
      toast.error('Please select date and time for pickup')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookingData,
          ...estimate,
          scheduledDateTime: `${bookingData.scheduledDate}T${bookingData.scheduledTime}:00Z`
        })
      })

      if (response.ok) {
        toast.success('Booking confirmed! Driver will be assigned soon.')
        // Reset form
        setBookingData({
          pickupLocation: '',
          dropLocation: '',
          truckType: '',
          loadType: '',
          loadWeight: '',
          scheduledDate: '',
          scheduledTime: '',
          specialInstructions: ''
        })
        setEstimate(null)
      } else {
        throw new Error('Booking failed')
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pickup" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pickup Location
          </Label>
          <Input
            id="pickup"
            placeholder="Enter pickup address"
            value={bookingData.pickupLocation}
            onChange={(e) => setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="drop" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Drop Location
          </Label>
          <Input
            id="drop"
            placeholder="Enter drop address"
            value={bookingData.dropLocation}
            onChange={(e) => setBookingData(prev => ({ ...prev, dropLocation: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="truck-type" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Truck Type
          </Label>
          <Select
            value={bookingData.truckType}
            onValueChange={(value) => setBookingData(prev => ({ ...prev, truckType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select truck type" />
            </SelectTrigger>
            <SelectContent>
              {truckTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="load-type" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Load Type
          </Label>
          <Select
            value={bookingData.loadType}
            onValueChange={(value) => setBookingData(prev => ({ ...prev, loadType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select load type" />
            </SelectTrigger>
            <SelectContent>
              {loadTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Load Weight (tons)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="e.g., 2.5"
            value={bookingData.loadWeight}
            onChange={(e) => setBookingData(prev => ({ ...prev, loadWeight: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Pickup Date
          </Label>
          <Input
            id="date"
            type="date"
            value={bookingData.scheduledDate}
            onChange={(e) => setBookingData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pickup Time
          </Label>
          <Input
            id="time"
            type="time"
            value={bookingData.scheduledTime}
            onChange={(e) => setBookingData(prev => ({ ...prev, scheduledTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="Any special handling instructions..."
          value={bookingData.specialInstructions}
          onChange={(e) => setBookingData(prev => ({ ...prev, specialInstructions: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={calculateFare} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          {loading ? 'Calculating...' : 'Calculate Fare'}
        </Button>
      </div>

      {estimate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fare Estimate
            </CardTitle>
            <CardDescription>
              Approximate distance: {estimate.distance} km
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Base Fare ({estimate.distance} km)</span>
              <span>₹{estimate.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Toll Charges</span>
              <span>₹{estimate.tollCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fuel Surcharge (10%)</span>
              <span>₹{estimate.fuelSurcharge.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(estimate.baseFare + estimate.tollCharges + estimate.fuelSurcharge).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{estimate.gstAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Fare</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                ₹{estimate.totalFare.toFixed(2)}
              </Badge>
            </div>
            
            <Button 
              onClick={handleBooking} 
              disabled={loading}
              className="w-full mt-4"
              size="lg"
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}