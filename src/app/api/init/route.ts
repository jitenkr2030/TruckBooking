import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Check if pricing rules already exist
    const existingRules = await db.pricingRule.count()
    
    if (existingRules > 0) {
      return NextResponse.json({ message: 'Database already initialized' })
    }

    // Create pricing rules for each truck type
    const pricingRules = [
      {
        truckType: 'MINI',
        baseRate: 15,
        minimumFare: 150,
        perKmRate: 15,
        tollCharge: 50,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'FT_14',
        baseRate: 20,
        minimumFare: 200,
        perKmRate: 20,
        tollCharge: 75,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'FT_20',
        baseRate: 25,
        minimumFare: 300,
        perKmRate: 25,
        tollCharge: 100,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'FT_32',
        baseRate: 35,
        minimumFare: 450,
        perKmRate: 35,
        tollCharge: 150,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'CONTAINER',
        baseRate: 45,
        minimumFare: 600,
        perKmRate: 45,
        tollCharge: 200,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'OPEN',
        baseRate: 30,
        minimumFare: 350,
        perKmRate: 30,
        tollCharge: 125,
        fuelSurcharge: 10,
        gstRate: 18
      },
      {
        truckType: 'CLOSED',
        baseRate: 30,
        minimumFare: 350,
        perKmRate: 30,
        tollCharge: 125,
        fuelSurcharge: 10,
        gstRate: 18
      }
    ]

    await db.pricingRule.createMany({
      data: pricingRules
    })

    // Create a sample admin user
    const adminUser = await db.user.create({
      data: {
        phone: '9999999999',
        email: 'admin@truckbooking.com',
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
        isKycVerified: true
      }
    })

    // Create a sample driver
    const driverUser = await db.user.create({
      data: {
        phone: '8888888888',
        email: 'driver@truckbooking.com',
        name: 'Driver User',
        role: 'DRIVER',
        isVerified: true,
        isKycVerified: true
      }
    })

    // Create driver profile
    await db.driverProfile.create({
      data: {
        userId: driverUser.id,
        licenseNumber: 'DL1234567890123',
        licenseExpiry: new Date('2025-12-31'),
        rcNumber: 'RC14AB1234',
        insuranceNumber: 'INS5678901234',
        insuranceExpiry: new Date('2025-06-30'),
        bankAccount: '1234567890123456',
        bankIfsc: 'HDFC0001234',
        isOnline: true
      }
    })

    // Create a sample truck
    await db.truck.create({
      data: {
        driverId: driverUser.id,
        truckNumber: 'MH14AB1234',
        type: 'FT_14',
        capacity: 3,
        dimensions: '14x6x7',
        make: 'Tata',
        model: '407',
        year: 2022,
        isAvailable: true
      }
    })

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      adminPhone: '9999999999',
      driverPhone: '8888888888'
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}