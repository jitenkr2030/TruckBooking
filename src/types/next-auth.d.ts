import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      phone?: string | null
      role: string
      isVerified: boolean
      isKycVerified: boolean
    }
  }

  interface User {
    role: string
    isVerified: boolean
    isKycVerified: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    isVerified: boolean
    isKycVerified: boolean
  }
}