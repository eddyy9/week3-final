import { useEffect, useState } from 'react'
import { fetchUsers } from './api/users'
import { UserCard } from './components/UserCard'
import { UserSearch } from './components/UserSearch'
import { UserForm } from './components/UserForm'
import type { NewUser, User } from './types/user'
import './App.css'

type RequestStatus = 'loading' | 'success' | 'error'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<RequestStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadUsers() {
      try {
        const loadedUsers = await fetchUsers(controller.signal)
        // Старый запрос не должен менять состояние после cleanup.
        if (!active) return
        setUsers(loadedUsers)
        setStatus('success')
      } catch (caughtError: unknown) {
        if (!active) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Неизвестная ошибка загрузки',
        )
        setStatus('error')
      }
    }

    void loadUsers()

    return () => {
      active = false
      controller.abort()
    }
  }, [reloadKey])

  // Это производные данные: отдельные state и useEffect не нужны.
  const normalizedQuery = query.trim().toLowerCase()
  const visibleUsers = users.filter(user =>
    user.name.toLowerCase().includes(normalizedQuery),
  )

  function handleDelete(id: User['id']) {
    setUsers(currentUsers => currentUsers.filter(user => user.id !== id))
  }

  function handleAdd(newUser: NewUser) {
    setUsers(currentUsers => [
      ...currentUsers,
      {
        id: Math.max(0, ...currentUsers.map(user => user.id)) + 1,
        ...newUser,
        phone: '',
      },
    ])
    setQuery('')
  }

  function handleRetry() {
    setError(null)
    setStatus('loading')
    setReloadKey(currentKey => currentKey + 1)
  }

  return (
    <main className="directory">
      <header className="page-header">
        <p className="eyebrow">USER DIRECTORY</p>
        <h1>Каталог пользователей</h1>
        <p className="intro">Найди человека по имени или добавь нового пользователя.</p>
      </header>

      {status === 'loading' && (
        <section className="message" role="status">
          <h2>Загрузка…</h2>
          <p>Получаем список пользователей.</p>
        </section>
      )}

      {status === 'error' && (
        <section className="message message-error" role="alert">
          <h2>Не удалось загрузить пользователей</h2>
          <p>{error}</p>
          <button type="button" onClick={handleRetry}>Повторить загрузку</button>
        </section>
      )}

      {status === 'success' && (
        <>
          <section className="search-panel" aria-label="Поиск пользователей">
            <UserSearch value={query} onChange={setQuery} />
            <p className="result-count" role="status">
              Показано: {visibleUsers.length} из {users.length}
            </p>
          </section>

          {users.length === 0 ? (
            <section className="message" role="status">
              <h2>Список пользователей пуст</h2>
              <p>Добавь пользователя через форму ниже.</p>
            </section>
          ) : visibleUsers.length === 0 ? (
            <section className="message" role="status">
              <h2>По запросу «{query.trim()}» никто не найден</h2>
              <p>Попробуй другую часть имени или очисти поиск.</p>
              <button className="button-secondary" type="button" onClick={() => setQuery('')}>
                Очистить поиск
              </button>
            </section>
          ) : (
            <ul className="user-list" aria-label="Пользователи">
              {visibleUsers.map(user => (
                <li key={user.id}>
                  <UserCard user={user} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
          )}

          <UserForm onAdd={handleAdd} />
          <p className="local-note">
            Добавление и удаление действуют только в этой вкладке.
            После перезагрузки страницы вернётся список с сервера.
          </p>
        </>
      )}
    </main>
  )
}

export default App
