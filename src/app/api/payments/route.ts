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
    const { bookingId, amount, paymentMethod, paymentDetails } = body

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId, amount, paymentMethod' 
      }, { status: 400 })
    }

    // Verify booking exists and belongs to the user
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        customerId: session.user.id,
        paymentStatus: 'PENDING'
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Invalid booking or already paid' }, { status: 404 })
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId,
        status: 'PAID',
        paidAt: new Date()
      }
    })

    // Update booking payment status
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PAID' }
    })

    // Process payment based on method (mock implementation)
    let paymentResult = await processPayment(paymentMethod, paymentDetails, amount, transactionId)

    if (!paymentResult.success) {
      // If payment fails, update status
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })
      
      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'FAILED' }
      })

      return NextResponse.json({ 
        error: 'Payment processing failed',
        details: paymentResult.message 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paidAt: payment.paidAt
      },
      message: 'Payment processed successfully'
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const bookingId = searchParams.get('bookingId')

    let where: any = {}
    
    if (bookingId) {
      where.bookingId = bookingId
    }

    // If user is not admin, only show their payments
    if (session.user.role !== 'ADMIN') {
      where.booking = {
        customerId: session.user.id
      }
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            bookingNumber: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// Mock payment processing function
async function processPayment(method: string, details: any, amount: number, transactionId: string) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock validation based on payment method
  switch (method.toUpperCase()) {
    case 'UPI':
      if (!details.upiId || !details.upiId.includes('@')) {
        return { success: false, message: 'Invalid UPI ID' }
      }
      break
      
    case 'CARD':
      if (!details.cardNumber || details.cardNumber.length < 16) {
        return { success: false, message: 'Invalid card number' }
      }
      if (!details.cardExpiry || !details.cardCvv) {
        return { success: false, message: 'Incomplete card details' }
      }
      break
      
    case 'WALLET':
      if (!details.walletNumber || details.walletNumber.length !== 10) {
        return { success: false, message: 'Invalid wallet number' }
      }
      break
      
    case 'CORPORATE':
      if (!details.corporateCode) {
        return { success: false, message: 'Corporate code required' }
      }
      break
      
    default:
      return { success: false, message: 'Unsupported payment method' }
  }

  // Simulate random payment failure (10% chance)
  if (Math.random() < 0.1) {
    return { success: false, message: 'Payment declined by bank' }
  }

  return { 
    success: true, 
    message: 'Payment processed successfully',
    transactionId
  }
}