import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export async function getTemplates() {
  const res = await fetch(`${API_BASE}/email/templates`, { credentials: "include", headers: getAuthHeaders() });
  return res.json();
}

export async function createTemplate(data: any) {
  const res = await fetch(`${API_BASE}/email/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTemplate(id: any, data: any) {
  const res = await fetch(`${API_BASE}/email/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTemplate(id: any) {
  const res = await fetch(`${API_BASE}/email/templates/${id}`, { method: "DELETE", credentials: "include", headers: getAuthHeaders() });
  return res.json();
}

// Helper to get JWT token from localStorage
function getAuthHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token')
    if (token) {
      return { 'Authorization': `Bearer ${token}` }
    }
  }
  return {} as Record<string, string>
}

export async function getLogs() {
  const res = await fetch(`${API_BASE}/email/logs`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getLogDetails(id: any) {
  const res = await fetch(`${API_BASE}/email/logs/${id}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function sendEmail(data: any) {
  const res = await fetch(`${API_BASE}/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function saveDraft(data: any) {
  const res = await fetch(`${API_BASE}/email/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendCredentials(data: any) {
  const res = await fetch(`${API_BASE}/email/send-credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCandidateCredentials(assessmentId: string) {
  const res = await fetch(`${API_BASE}/assessments/${assessmentId}/candidates/credentials`, { credentials: "include", headers: getAuthHeaders() });
  return res.json();
}

export async function getEmailMetrics() {
  const res = await fetch(`${API_BASE}/email/metrics`, { credentials: "include", headers: getAuthHeaders() });
  return res.json();
} 