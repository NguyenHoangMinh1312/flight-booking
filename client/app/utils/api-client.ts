const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    }
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.errors?.[0].message || "Failed to handle the request"
    throw new Error(message)
  }

  return data as T
}