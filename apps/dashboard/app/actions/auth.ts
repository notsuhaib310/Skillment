'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = await cookies()
  
  // Clear all cookies
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name)
  }
  
  // Clear the auth token specifically
  cookieStore.delete('auth_token')
  
  // Redirect to the frontend login page
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  redirect(`${frontendUrl}/login`)
} 