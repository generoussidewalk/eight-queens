export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      throw new Error(data?.error || 'Could not reach the server. Make sure npm run dev:all is running.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long. Please retry.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
