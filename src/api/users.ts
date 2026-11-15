import type { User } from '../types/user'

const USERS_URL = 'https://jsonplaceholder.typicode.com/users'

// TypeScript проверяет наш код, но не данные, пришедшие по сети.
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false

  return (
    'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id) &&
    'name' in value && typeof value.name === 'string' &&
    'email' in value && typeof value.email === 'string' &&
    'phone' in value && typeof value.phone === 'string'
  )
}

export async function fetchUsers(signal: AbortSignal): Promise<User[]> {
  const response = await fetch(USERS_URL, { signal })

  if (!response.ok) {
    throw new Error(`Сервер вернул HTTP ${response.status}. Попробуй ещё раз.`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isUser)) {
    throw new Error('Сервер прислал данные пользователей в неожиданном формате.')
  }

  if (new Set(data.map(user => user.id)).size !== data.length) {
    throw new Error('В ответе сервера повторяются идентификаторы пользователей.')
  }

  return data
}
