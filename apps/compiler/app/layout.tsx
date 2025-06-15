import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skillment Compiler - Fast Online Code Editor',
  description:
    'Skillment Compiler supports 15+ programming languages including Python, Java, C, C++, and JavaScript. Fast, secure, and shareable code snippets.',
  keywords: [
    'online compiler',
    'python compiler',
    'java compiler',
    'code editor',
    'run code online',
    'skillment compiler',
    'best online compiler',
    'multi-language code editor',
  ],
  authors: [{ name: 'Protool', url: 'https://skillment.in' }],
  creator: 'Suhaib King',
  openGraph: {
    title: 'Skillment Compiler - Fastest Online Code Editor',
    description:
      'Run code online in Python, Java, C, and more with Skillment Compiler. The fastest, multi-language compiler for developers.',
    url: 'https://compiler.skillment.in',
    siteName: 'Skillment Compiler',
    images: [
      {
        url: 'https://compiler.skillment.dev/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Skillment Compiler Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skillment Compiler - Fastest Online Code Editor',
    description:
      'Run, debug, and share code online in 15+ programming languages. Fast, simple, and developer-friendly.',
    site: '@skillment_dev',
    creator: '@suhaibking',
    images: ['https://compiler.skillment.in/twitter-image.jpg'],
  },
  metadataBase: new URL('https://compiler.skillment.in'),
  themeColor: '#086c74',
  generator: 'Next.js + Piston + Tailwind + Protool',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head />
      <body className="bg-[#f9f9f9] text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
        {children}
      </body>
    </html>
  )
}
