import { cookies } from 'next/headers'

export async function logout() {
  // Clear all cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name)
  })
  
  // Redirect to login page
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  }
} 