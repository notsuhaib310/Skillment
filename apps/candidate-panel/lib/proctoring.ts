export async function sendProctoringEvent(eventType: string, details: any = {}, candidateId?: string) {
  try {
    const authToken = sessionStorage.getItem('authToken')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }
    
  await fetch('http://localhost:5000/api/proctoring/event', {
    method: 'POST',
      headers,
    body: JSON.stringify({
      eventType,
      details,
      timestamp: new Date().toISOString(),
      candidateId,
    }),
  });
  } catch (error) {
    // Silently ignore proctoring event failures to avoid disrupting the exam
    console.error('Failed to send proctoring event:', error)
  }
}

export async function sendProctoringMedia(mediaType: string, data: any, candidateId?: string) {
  try {
    const authToken = sessionStorage.getItem('authToken')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }
    
  await fetch('http://localhost:5000/api/proctoring/media', {
    method: 'POST',
      headers,
    body: JSON.stringify({
      mediaType,
      data,
      timestamp: new Date().toISOString(),
      candidateId,
    }),
  });
  } catch (error) {
    // Silently ignore proctoring media failures to avoid disrupting the exam
    console.error('Failed to send proctoring media:', error)
  }
} 