const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.skillment.in';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://app.skillment.in';

export const login = async (email: string, password: string, organization: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, organization }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = `${FRONTEND_URL}/auth/login`;
}; 