import type { User } from '../types/user'
import { UserCard } from './UserCard'

type UserListProps = {
  users: readonly User[]
  onDelete: (id: User['id']) => void
}

export function UserList({ users, onDelete }: UserListProps) {
  return (
    <ul className="user-list" aria-label="Пользователи">
      {users.map(user => (
        <li key={user.id}>
          <UserCard user={user} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}
