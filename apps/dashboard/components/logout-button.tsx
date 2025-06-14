'use client'

import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <Button
      onClick={() => logout()}
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Logout
    </Button>
  )
} 