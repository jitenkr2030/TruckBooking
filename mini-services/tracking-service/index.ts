import { Server } from 'socket.io'
import { createServer } from 'http'

const PORT = 3001
const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

// Store active connections and locations
const activeDrivers = new Map()
const customerConnections = new Map()

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Driver joins with their user ID
  socket.on('driver-join', (data) => {
    const { userId, bookingId } = data
    socket.join(`driver-${userId}`)
    socket.join(`booking-${bookingId}`)
    
    activeDrivers.set(userId, {
      socketId: socket.id,
      bookingId,
      lastLocation: null
    })
    
    console.log(`Driver ${userId} joined for booking ${bookingId}`)
  })

  // Customer joins to track their booking
  socket.on('customer-join', (data) => {
    const { userId, bookingId } = data
    socket.join(`customer-${userId}`)
    socket.join(`booking-${bookingId}`)
    
    customerConnections.set(userId, {
      socketId: socket.id,
      bookingId
    })
    
    console.log(`Customer ${userId} joined for booking ${bookingId}`)
  })

  // Driver updates location
  socket.on('location-update', (data) => {
    const { userId, bookingId, location, speed, heading } = data
    
    // Update driver's last location
    if (activeDrivers.has(userId)) {
      activeDrivers.get(userId).lastLocation = location
    }

    // Broadcast to all customers tracking this booking
    io.to(`booking-${bookingId}`).emit('location-update', {
      bookingId,
      driverId: userId,
      location,
      speed,
      heading,
      timestamp: new Date().toISOString()
    })

    console.log(`Location update for booking ${bookingId}:`, location)
  })

  // Driver updates trip status
  socket.on('status-update', (data) => {
    const { bookingId, status, message } = data
    
    // Broadcast to all users tracking this booking
    io.to(`booking-${bookingId}`).emit('status-update', {
      bookingId,
      status,
      message,
      timestamp: new Date().toISOString()
    })

    console.log(`Status update for booking ${bookingId}: ${status}`)
  })

  // Chat messages
  socket.on('chat-message', (data) => {
    const { bookingId, senderId, senderRole, message } = data
    
    // Broadcast to all users in this booking
    io.to(`booking-${bookingId}`).emit('chat-message', {
      bookingId,
      senderId,
      senderRole,
      message,
      timestamp: new Date().toISOString()
    })

    console.log(`Chat message for booking ${bookingId} from ${senderRole}`)
  })

  // ETA updates
  socket.on('eta-update', (data) => {
    const { bookingId, eta, distance } = data
    
    // Broadcast to customers
    io.to(`booking-${bookingId}`).emit('eta-update', {
      bookingId,
      eta,
      distance,
      timestamp: new Date().toISOString()
    })
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    
    // Remove from active drivers
    for (const [userId, driver] of activeDrivers.entries()) {
      if (driver.socketId === socket.id) {
        activeDrivers.delete(userId)
        console.log(`Driver ${userId} disconnected`)
        break
      }
    }

    // Remove from customer connections
    for (const [userId, customer] of customerConnections.entries()) {
      if (customer.socketId === socket.id) {
        customerConnections.delete(userId)
        console.log(`Customer ${userId} disconnected`)
        break
      }
    }
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚚 Tracking service running on port ${PORT}`)
  console.log(`📍 Real-time tracking enabled`)
})

// Mock location updates for demo
setInterval(() => {
  activeDrivers.forEach((driver, userId) => {
    if (driver.lastLocation) {
      // Simulate small movement
      const newLocation = {
        lat: driver.lastLocation.lat + (Math.random() - 0.5) * 0.001,
        lng: driver.lastLocation.lng + (Math.random() - 0.5) * 0.001
      }
      
      driver.lastLocation = newLocation
      
      // Broadcast to tracking customers
      io.to(`booking-${driver.bookingId}`).emit('location-update', {
        bookingId: driver.bookingId,
        driverId: userId,
        location: newLocation,
        speed: Math.floor(Math.random() * 40) + 20, // 20-60 km/h
        heading: Math.floor(Math.random() * 360),
        timestamp: new Date().toISOString()
      })
    }
  })
}, 5000) // Update every 5 seconds

export default io