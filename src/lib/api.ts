// Pembungkus fetch untuk sisi client: menyertakan token dan menangani sesi berakhir.
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
  return res;
}

// Mengembalikan pesan error dari API, atau null jika permintaan berhasil.
export async function getApiError(res: Response, fallback: string): Promise<string | null> {
  if (res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.error || fallback;
}
