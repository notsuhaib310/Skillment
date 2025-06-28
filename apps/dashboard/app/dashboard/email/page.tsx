"use client"

import { EmailPage } from "@/components/email/email-page"
import { ModalProvider } from "@/components/ui/animated-modal"

export default function EmailPageRoute() {
  return (
    <ModalProvider>
      <EmailPage />
    </ModalProvider>
  )
}
