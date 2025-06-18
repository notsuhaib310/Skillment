'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHtml = async () => {
      try {
        const response = await fetch('/import/page.html');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setHtml(text);
      } catch (e) {
        console.error('Error loading HTML:', e);
        setError(e instanceof Error ? e.message : 'Failed to load content');
      }
    };

    loadHtml();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!html) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      suppressHydrationWarning
    />
  );
}