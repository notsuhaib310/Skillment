import { API_ENDPOINTS, getApiHeaders } from './api-config'

export async function sendProctoringEvent(eventType: string, details: any = {}, candidateId?: string) {
  try {
    const authToken = sessionStorage.getItem('authToken')
    
  await fetch(API_ENDPOINTS.proctoringEvent, {
    method: 'POST',
      headers: getApiHeaders(authToken),
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
    
  await fetch(API_ENDPOINTS.proctoringMedia, {
    method: 'POST',
      headers: getApiHeaders(authToken),
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