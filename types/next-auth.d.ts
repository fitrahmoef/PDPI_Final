import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      name: string
      role: UserRole
      branch?: string
    }
  }

  interface User {
    id: string
    username: string
    email: string
    name: string
    role: UserRole
    branch?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    branch?: string
    username: string
  }
}