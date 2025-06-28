export async function sendProctoringEvent(eventType: string, details: any = {}, candidateId?: string) {
  await fetch('http://localhost:5000/api/proctoring/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      details,
      timestamp: new Date().toISOString(),
      candidateId,
    }),
  });
}

export async function sendProctoringMedia(mediaType: string, data: any, candidateId?: string) {
  await fetch('http://localhost:5000/api/proctoring/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaType,
      data,
      timestamp: new Date().toISOString(),
      candidateId,
    }),
  });
} 