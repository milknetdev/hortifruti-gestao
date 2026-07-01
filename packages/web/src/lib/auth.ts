import { api } from './api';

export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function loginCustomer(email: string, password: string, tenantId: string) {
  const { data } = await api.post('/auth/customer/login', { email, password, tenantId });
  return data;
}

export async function registerCustomer(userData: {
  email: string; password: string; name: string; phone?: string; cpf?: string; tenantId: string;
}) {
  const { data } = await api.post('/auth/customer/register', userData);
  return data;
}

export async function refreshToken(refreshToken: string) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout errors
  }
}
