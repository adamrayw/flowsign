import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type RayTechUser = {
  id: string
  name: string
  email: string
}

const DEFAULT_AUTH_URL = 'http://localhost:3000'

function getAuthUrl() {
  return process.env.NEXT_PUBLIC_AUTH_URL ?? DEFAULT_AUTH_URL
}

export async function getRequestOrigin() {
  const headerStore = await headers()
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host')
  const host = forwardedHost ?? headerStore.get('host')
  const proto = forwardedProto ?? (host?.startsWith('localhost') ? 'http' : 'https')

  if (!host) {
    return getAuthUrl()
  }

  return `${proto}://${host}`
}

export function buildRayTechLoginUrl(returnTo?: string) {
  const loginUrl = new URL('/login', getAuthUrl())

  if (returnTo) {
    loginUrl.searchParams.set('returnTo', returnTo)
  }

  return loginUrl.toString()
}

export function buildRayTechLogoutUrl(returnTo?: string) {
  const logoutUrl = new URL('/logout', getAuthUrl())

  if (returnTo) {
    logoutUrl.searchParams.set('returnTo', returnTo)
  }

  return logoutUrl.toString()
}

export async function getRayTechUser() {
  const cookieStore = await cookies()
  const origin = await getRequestOrigin()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const response = await fetch(new URL('/api/me', getAuthUrl()), {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Cookie: cookieHeader,
      Origin: origin,
      'x-raytech-origin': origin,
    },
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as RayTechUser
}

export async function requireRayTechUser(returnPath = '/dashboard') {
  const user = await getRayTechUser()

  if (!user) {
    const origin = await getRequestOrigin()
    redirect(buildRayTechLoginUrl(`${origin}${returnPath}`))
  }

  return user
}
