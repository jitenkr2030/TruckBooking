import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone Number', type: 'text' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          return null
        }

        // For demo purposes, accept any 6-digit OTP
        // In production, implement proper OTP verification
        if (credentials.otp && credentials.otp.length === 6) {
          let user = await db.user.findUnique({
            where: { phone: credentials.phone }
          })

          if (!user) {
            // Create new user
            user = await db.user.create({
              data: {
                phone: credentials.phone,
                isVerified: true
              }
            })
          } else {
            // Update verification status
            user = await db.user.update({
              where: { id: user.id },
              data: { isVerified: true }
            })
          }

          return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            isKycVerified: user.isKycVerified
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isVerified = user.isVerified
        token.isKycVerified = user.isKycVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isVerified = token.isVerified as boolean
        session.user.isKycVerified = token.isKycVerified as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
}