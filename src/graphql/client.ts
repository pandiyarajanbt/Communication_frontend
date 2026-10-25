import loginUserMutation from './operations/loginUser.gql?raw'

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://127.0.0.1:8000/graphql/'

type GraphQLError = {
  message: string
}

type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLError[]
}

export type AuthUser = {
  id: string
  username: string
  email: string
  address: string
  city: string
  country: string
  phone: string
  postalCode: string
  state: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

type LoginResponse = {
  loginUser: AuthSession | null
}

type LoginVariables = {
  email: string
  password: string
}

const SESSION_STORAGE_KEY = 'candidate-communication.auth-session'

export async function requestGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
  } catch {
    throw new Error(`Could not reach the GraphQL server at ${GRAPHQL_ENDPOINT}.`)
  }

  let result: GraphQLResponse<T>
  try {
    result = await response.json() as GraphQLResponse<T>
  } catch {
    throw new Error('The GraphQL server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || `GraphQL request failed (HTTP ${response.status}).`)
  }

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'The GraphQL request failed.')
  }

  if (!result.data) throw new Error('The GraphQL server returned no data.')
  return result.data
}

export async function loginUser(variables: LoginVariables): Promise<AuthSession> {
  const result = await requestGraphQL<LoginResponse>(loginUserMutation, variables)
  const session = result.loginUser

  if (!session?.token || !session.user) {
    throw new Error('Sign-in failed. Check your email and password.')
  }

  return session
}

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='))
    const expiry = (JSON.parse(decodedPayload) as { exp?: unknown }).exp
    return typeof expiry === 'number' ? expiry * 1000 : null
  } catch {
    return null
  }
}

export function getStoredSession(): AuthSession | null {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!storedSession) return null

    const session = JSON.parse(storedSession) as AuthSession
    if (!session.token || !session.user) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    const expiry = getTokenExpiry(session.token)
    if (expiry !== null && expiry <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
