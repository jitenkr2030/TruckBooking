import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Overall stats
    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      activeDrivers,
      completedBookings
    ] = await Promise.all([
      db.user.count(),
      db.booking.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      db.payment.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      db.driverProfile.count({
        where: { isOnline: true }
      }),
      db.booking.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      })
    ])

    // Revenue over time
    const revenueOverTime = await db.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        SUM(amount) as revenue
      FROM payments 
      WHERE status = 'PAID' 
        AND createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    ` as Array<{ date: string; revenue: bigint }>

    // Bookings by status
    const bookingsByStatus = await db.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    })

    // Bookings by truck type
    const bookingsByTruckType = await db.booking.groupBy({
      by: ['truckType'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    })

    // Top drivers by earnings
    const topDrivers = await db.driverProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        },
        earnings: {
          where: {
            earnedAt: { gte: startDate }
          },
          _sum: {
            netEarning: true
          }
        },
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: {
        earnings: {
          _sum: {
            netEarning: 'desc'
          }
        }
      },
      take: 10
    })

    // Top customers by bookings
    const topCustomers = await db.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      include: {
        customerBookings: {
          where: {
            createdAt: { gte: startDate }
          }
        },
        _count: {
          select: {
            customerBookings: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        customerBookings: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // Daily bookings trend
    const dailyBookings = await db.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as bookings
      FROM bookings 
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    ` as Array<{ date: string; bookings: bigint }>

    // Payment methods breakdown
    const paymentMethods = await db.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'PAID',
        createdAt: { gte: startDate }
      },
      _count: true,
      _sum: { amount: true }
    })

    // Driver performance metrics
    const driverMetrics = await db.driverProfile.aggregate({
      _avg: {
        // This would need to be calculated from ratings
      },
      _count: true
    })

    const analytics = {
      overview: {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeDrivers,
        completedBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
      },
      revenueOverTime: revenueOverTime.map(item => ({
        date: item.date,
        revenue: Number(item.revenue)
      })),
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count
      })),
      bookingsByTruckType: bookingsByTruckType.map(item => ({
        truckType: item.truckType,
        count: item._count
      })),
      topDrivers: topDrivers.map(driver => ({
        name: driver.user.name || driver.user.phone,
        phone: driver.user.phone,
        earnings: Number(driver.earnings._sum.netEarning || 0),
        trips: driver.earnings.length,
        rating: driver._count.ratings
      })),
      topCustomers: topCustomers.map(customer => ({
        name: customer.name || customer.phone,
        phone: customer.phone,
        bookings: customer._count.customerBookings
      })),
      dailyBookings: dailyBookings.map(item => ({
        date: item.date,
        bookings: Number(item.bookings)
      })),
      paymentMethods: paymentMethods.map(method => ({
        method: method.paymentMethod,
        count: method._count,
        revenue: Number(method._sum.amount || 0)
      }))
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}