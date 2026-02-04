# 🚚 Truck Booking App

A modern, full-stack truck booking platform built with Next.js 16, TypeScript, and Prisma. Connect customers with truck drivers for reliable transportation services.

## ✨ Features

### 👤 Customer Features
- **Easy Booking**: Simple interface to book trucks with pickup/drop locations
- **Multiple Truck Types**: Mini, 14ft, 20ft, 32ft, Container, Open/Closed body trucks
- **Transparent Pricing**: Real-time fare calculation with GST invoices
- **Live Tracking**: Real-time GPS tracking of shipments (framework ready)
- **Order Management**: View booking history, cancel/reschedule bookings
- **Multiple Payment Options**: UPI, Wallet, Credit/Debit Card, Cash on Delivery
- **Ratings & Reviews**: Rate drivers and provide feedback

### 🚛 Driver Features
- **Profile Management**: Complete driver profile with KYC verification
- **Trip Management**: Accept/reject trip requests with detailed information
- **Earnings Dashboard**: Track daily/weekly earnings and payment status
- **Availability Management**: Online/Offline toggle with preferred routes
- **Proof of Delivery**: Upload delivery photos and e-signatures
- **Navigation Support**: Google Maps integration for route optimization

### 🛠️ Admin Features
- **User Management**: Approve/suspend accounts, KYC verification
- **Booking Control**: View all bookings, manual assignment, cancellation
- **Pricing Management**: Set per-km rates, commission, fuel surcharge
- **Analytics Dashboard**: Revenue reports, trip completion rates, driver performance
- **Support System**: Handle customer complaints and disputes

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js v4

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Validation**: Zod schemas

### Infrastructure
- **Deployment**: Ready for Vercel, AWS, GCP
- **Database**: SQLite (easily migratable to PostgreSQL)
- **File Storage**: Ready for cloud storage integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Bun or npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/TruckBooking.git
   cd TruckBooking
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Initialize sample data**
   ```bash
   # Start the development server first
   bun run dev
   
   # In another terminal, initialize the database
   curl -X POST http://localhost:3000/api/init
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Demo Accounts

### Admin Account
- **Phone**: `9999999999`
- **Role**: Admin
- **Access**: Full admin panel with user management

### Driver Account  
- **Phone**: `8888888888`
- **Role**: Driver
- **Access**: Driver dashboard and trip management

### Customer Registration
- Use any 10-digit phone number
- **OTP**: Any 6-digit code (for demo purposes)

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main models:

- **Users**: Customer, Driver, and Admin accounts
- **DriverProfiles**: Driver-specific information and KYC details
- **Trucks**: Vehicle information and availability
- **Bookings**: Complete booking lifecycle management
- **Payments**: Transaction tracking and status
- **Tracking**: Real-time location data
- **Ratings**: Driver and service ratings
- **Communications**: In-app messaging system
- **Earnings**: Driver payment tracking
- **AdminActions**: Admin activity logs
- **PricingRules**: Dynamic pricing configuration

## 🎨 UI Components

The app uses a modern design system with:

- **Color Scheme**: Professional blue and gray palette
- **Typography**: Consistent hierarchy with Geist fonts
- **Components**: 30+ shadcn/ui components
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA support and keyboard navigation
- **Dark Mode**: Theme switching support (next-themes)

## 🔧 Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run lint         # Run ESLint
bun run build        # Build for production

# Database
bun run db:push      # Push schema to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:reset     # Reset database
```

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # User dashboards
│   ├── admin/          # Admin panels
│   └── auth/           # Authentication pages
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Custom components
├── lib/               # Utility functions
├── types/             # TypeScript definitions
└── hooks/             # Custom React hooks
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
The app is container-ready and can be deployed to:
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- DigitalOcean
- Railway
- Render

## 🔐 Security Features

- **Authentication**: Secure JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in Next.js protection
- **Secure Headers**: Optimized security headers
- **Environment Variables**: Sensitive data protection

## 📈 Performance

- **Optimized Build**: Next.js 16 with Turbopack
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Efficient data caching strategies
- **Bundle Analysis**: Optimized package dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@truckbooking.com
- Documentation: [Wiki](https://github.com/jitenkr2030/TruckBooking/wiki)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core booking system
- ✅ User authentication
- ✅ Admin panel
- ✅ Driver management

### Phase 2 (In Progress)
- 🔄 Google Maps integration
- 🔄 Payment gateway integration
- 🔄 Real-time tracking
- 🔄 Push notifications

### Phase 3 (Future)
- 📋 Mobile apps (React Native)
- 📋 Advanced analytics
- 📋 Fleet management system
- 📋 IoT integration
- 📋 Multi-language support

## 📊 Stats

- **Lines of Code**: ~5,000+
- **Components**: 30+ UI components
- **API Endpoints**: 15+ routes
- **Database Tables**: 12 models
- **Test Coverage**: Framework ready

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**