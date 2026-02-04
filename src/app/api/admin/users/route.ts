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
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = role ? { role: role.toUpperCase() } : {}

    const users = await db.user.findMany({
      where,
      include: {
        driverProfile: {
          include: {
            trucks: true,
            _count: {
              select: {
                ratings: true
              }
            }
          }
        },
        customerBookings: {
          _count: true
        },
        driverBookings: {
          _count: true
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await db.user.count({ where })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isKycVerified: user.isKycVerified,
      createdAt: user.createdAt,
      driverProfile: user.driverProfile ? {
        licenseNumber: user.driverProfile.licenseNumber,
        rcNumber: user.driverProfile.rcNumber,
        isOnline: user.driverProfile.isOnline,
        truckCount: user.driverProfile.trucks.length,
        ratingCount: user.driverProfile._count.ratings
      } : null,
      customerBookingCount: user.customerBookings._count,
      driverBookingCount: user.driverBookings._count
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, data } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'verify':
        updateData = { isVerified: true }
        break
      case 'unverify':
        updateData = { isVerified: false }
        break
      case 'kyc_verify':
        updateData = { isKycVerified: true }
        break
      case 'kyc_unverify':
        updateData = { isKycVerified: false }
        break
      case 'suspend':
        updateData = { isVerified: false, isKycVerified: false }
        break
      case 'update_role':
        if (!data?.role || !['CUSTOMER', 'DRIVER', 'ADMIN'].includes(data.role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }
        updateData = { role: data.role }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData
    })

    // Log admin action
    await db.adminAction.create({
      data: {
        adminId: session.user.id,
        action: `USER_${action.toUpperCase()}`,
        targetId: userId,
        targetType: 'USER',
        description: `Performed ${action} on user ${user.phone}`
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isKycVerified: user.isKycVerified
      }
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}