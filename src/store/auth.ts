export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export function getUser(): User | null {
  const stored = localStorage.getItem('auth_user');
  return stored ? JSON.parse(stored) : null;
}

export function setUser(user: User): void {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem('auth_user');
}
