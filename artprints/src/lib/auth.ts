import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          let user = await getUserByEmail(credentials.email)

          // If no user exists and this is the admin email, create the admin user
          if (!user && credentials.email === process.env.ADMIN_EMAIL) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10)
            user = await createUser(credentials.email, hashedPassword, 'admin')
          }

          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
  },
}

export const handler = NextAuth(authOptions)

// Type definitions for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}
