import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      pickupLocation,
      pickupLat,
      pickupLng,
      dropLocation,
      dropLat,
      dropLng,
      truckType,
      loadType,
      loadWeight,
      scheduledDateTime,
      specialInstructions,
      baseFare,
      distance,
      tollCharges,
      fuelSurcharge,
      gstAmount,
      totalFare
    } = body

    // Generate booking number
    const bookingNumber = `TB${Date.now().toString().slice(-8)}`

    // Create booking
    const booking = await db.booking.create({
      data: {
        bookingNumber,
        customerId: session.user.id,
        pickupLocation,
        pickupLat,
        pickupLng,
        dropLocation,
        dropLat,
        dropLng,
        truckType,
        loadType,
        loadWeight: loadWeight ? parseFloat(loadWeight) : null,
        scheduledDate: new Date(scheduledDateTime),
        estimatedDistance: distance,
        baseFare,
        tollCharges,
        fuelSurcharge,
        gstAmount,
        totalFare,
        specialInstructions,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    })

    return NextResponse.json({ 
      success: true, 
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalFare: booking.totalFare,
        status: booking.status
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = session.user.role === 'CUSTOMER' 
      ? { customerId: session.user.id }
      : session.user.role === 'DRIVER'
      ? { driverId: session.user.id }
      : {}

    if (status) {
      where.status = status
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        truck: {
          select: {
            id: true,
            truckNumber: true,
            type: true,
            capacity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await db.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}