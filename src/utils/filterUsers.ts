import type { User } from '../types/user'

// Поиск игнорирует регистр и пробелы по краям запроса, не меняя исходные данные.
export function filterUsers(users: readonly User[], query: string): User[] {
  const normalizedQuery = query.trim().toLowerCase()

  return users.filter(user => user.name.toLowerCase().includes(normalizedQuery))
}
