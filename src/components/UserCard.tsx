import type { User } from '../types/user'

type UserCardProps = {
  user: User
  onDelete: (id: User['id']) => void
}

export function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <article className="user-card">
      <h2>{user.name}</h2>
      <dl>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Телефон</dt><dd>{user.phone || 'Не указан'}</dd></div>
      </dl>
      <button
        className="button-delete"
        type="button"
        aria-label={`Удалить ${user.name}`}
        onClick={() => onDelete(user.id)}
      >
        Удалить
      </button>
    </article>
  )
}
