export async function getTemplates() {
  const res = await fetch("/api/email/templates");
  return res.json();
}

export async function createTemplate(data: any) {
  const res = await fetch("/api/email/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTemplate(id: any, data: any) {
  const res = await fetch(`/api/email/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTemplate(id: any) {
  const res = await fetch(`/api/email/templates/${id}`, { method: "DELETE" });
  return res.json();
}

// Helper to get JWT token from localStorage
function getAuthHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      return { 'Authorization': `Bearer ${token}` }
    }
  }
  return {} as Record<string, string>
}

export async function getLogs() {
  const res = await fetch("/api/email/logs", {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getLogDetails(id: any) {
  const res = await fetch(`/api/email/logs/${id}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function sendEmail(data: any) {
  const res = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function saveDraft(data: any) {
  const res = await fetch("/api/email/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendCredentials(data: any) {
  const res = await fetch("/api/email/send-credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCandidateCredentials(assessmentId: string) {
  const res = await fetch(`/api/assessments/${assessmentId}/candidates/credentials`);
  return res.json();
}

export async function getEmailMetrics() {
  const res = await fetch("/api/email/metrics")
  return res.json()
} 